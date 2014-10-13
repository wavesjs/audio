/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class (time-engine master), provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var TimeEngine = require("time-engine");
var PriorityQueue = require("priority-queue");
var scheduler = require("scheduler");

function removeCouple(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

class Transported extends TimeEngine {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    this.__transport = transport;
    this.__engine = engine;
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.__haltPosition = Infinity; // haltPosition === null: engine is active
  }

  setBoundaries(startPosition, endPosition, offsetPosition = startPosition) {
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.resetNextPosition();
  }

  start(time, position, speed) {}
  stop(time, position) {}

  syncPosition(time, position, speed) {
    if (speed > 0) {
      if (position < this.__startPosition) {
        this.stop(time, position);
        this.__haltPosition = this.__endPosition;
        return this.__startPosition;
      } else if (position <= this.__endPosition) {
        this.start(time, position, speed);
        this.__haltPosition = null; // engine is active
        return this.__endPosition;
      }
    } else {
      if (position >= this.__endPosition) {
        this.stop(time, position);
        this.__haltPosition = this.__startPosition;
        return this.__endPosition;
      } else if (position > this.__startPosition) {
        this.start(time, position, speed);
        this.__haltPosition = null; // engine is active
        return this.__startPosition;
      }
    }

    this.__haltPosition = Infinity;

    return Infinity;
  }

  advancePosition(time, position, speed) {
    var haltPosition = this.__haltPosition;

    if (haltPosition !== null) {
      this.start(time, position - this.__offsetPosition, speed);
      this.__haltPosition = null;
      return haltPosition;
    }

    // stop engine
    this.stop(time, position - this.__offsetPosition);
    this.__haltPosition = Infinity;
    return Infinity;
  }

  syncSpeed(time, position, speed) {
    if (speed === 0)
      this.stop(time, position - this.__offsetPosition);
  }

  destroy() {
    this.__transport = null;
    this.__engine = null;
  }
}

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
class TransportedTransported extends Transported {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    super(transport, engine, startPosition, endPosition, offsetPosition);

    TimeEngine.setTransported(engine, (nextEnginePosition = null) => {
      // resetNextPosition
      this.resetNextPosition(nextEnginePosition + this.__offsetPosition);
    }, () => {
      // getCurrentTime
      return scheduler.currentTime;
    }, () => {
      // getCurrentPosition
      return this.__transport.currentPosition - this.__offsetPosition;
    });
  }

  syncPosition(time, position, speed) {
    if (speed > 0 && position < this.__endPosition)
      position = Math.max(position, this.__startPosition);
    else if (speed < 0 && position >= this.__startPosition)
      position = Math.min(position, this.__endPosition);

    return  this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
  }

  advancePosition(time, position, speed) {
    position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

    if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition)
      return position;

    return Infinity;
  }

  syncSpeed(time, position, speed) {
    if (this.__engine.syncSpeed)
      this.__engine.syncSpeed(time, position, speed);
  }

  destroy() {
    TimeEngine.resetInterface(this.__engine);
    super.destroy();
  }
}

// TransportedSpeedControlled has to start and stop the speed-controlled engines
// when the transport hits the engine's start and end position
class TransportedSpeedControlled extends Transported {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    super(transport, engine, startPosition, endPosition, offsetPosition);

    TimeEngine.setSpeedControlled(engine, () => {
      // getCurrentTime
      return scheduler.currentTime;
    }, () => {
      // getCurrentPosition
      return this.__transport.currentPosition - this.__offsetPosition;
    });
  }

  start(time, position, speed) {
    this.__engine.syncSpeed(time, position, speed);
  }

  stop(time, position) {
    this.__engine.syncSpeed(time, position, 0);
  }

  syncSpeed(time, position, speed) {
    if (this.__haltPosition === null) // engine is active
      this.__engine.syncSpeed(time, position, speed);
  }

  destroy() {
    this.__engine.syncSpeed(this.__transport.time, this.__transport.position - this.__offsetPosition, 0);
    TimeEngine.resetInterface(this.__engine);
    super.destroy();
  }
}

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
class TransportedScheduled extends Transported {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    super(transport, engine, startPosition, endPosition, offsetPosition);

    scheduler.add(engine, Infinity, () => {
      // getCurrentPosition
      return this.__transport.currentPosition - this.__offsetPosition;
    });
  }

  start(time, position, speed) {
    this.__engine.resetNextTime(time);
  }

  stop(time, position) {
    this.__engine.resetNextTime(Infinity);
  }

  destroy() {
    scheduler.remove(this.__engine);
    super.destroy();
  }
}

class TransportScheduledCell extends TimeEngine {
  constructor(transport) {
    super();
    this.__transport = transport;
  }

  // TimeEngine method (scheduled interface)
  advanceTime(time) {
    var transport = this.__transport;
    var position = transport.__getPositionAtTime(time);
    var nextPosition = transport.advancePosition(time, position, transport.__speed);

    if (nextPosition !== Infinity)
      return transport.__getTimeAtPosition(nextPosition);

    return Infinity;
  }
}

/**
 * xxx
 *
 *
 */
class Transport extends TimeEngine {
  constructor() {
    super();

    this.__engines = [];
    this.__transported = [];

    this.__scheduledCell = null;
    this.__transportQueue = new PriorityQueue();

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;
  }

  __getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  __getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  __syncTransportedPosition(time, position, speed) {
    var numTransportedEngines = this.__transported.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var engine, nextEnginePosition;

      this.__transportQueue.clear();
      this.__transportQueue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transported[i];
        nextEnginePosition = engine.syncPosition(time, position, speed);
        this.__transportQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transported[0];
      nextEnginePosition = engine.syncPosition(time, position, speed);
      nextPosition = this.__transportQueue.insert(engine, nextEnginePosition, true); // insert and sort 
    }

    return nextPosition;
  }

  __syncTransportedSpeed(time, position, speed) {
    for (var transported of this.__transported)
      transported.syncSpeed(time, position, speed);
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  get currentTime() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  get currentPosition() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  /**
   * Reset next transport position
   * @param {Number} next transport position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  resetNextPosition(nextPosition) {
    if (this.__scheduledCell)
      this.__scheduledCell.resetNextTime(this.__getTimeAtPosition(nextPosition));

    this.__nextPosition = nextPosition;
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    return this.__syncTransportedPosition(time, position, speed);
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    var nextEngine = this.__transportQueue.head;
    var nextEnginePosition = nextEngine.advancePosition(time, position, speed);

    this.__nextPosition = this.__transportQueue.move(nextEngine, nextEnginePosition);

    return this.__nextPosition;
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    if (speed !== lastSpeed || seek) {
      var nextPosition = this.__nextPosition;
      var scheduledEngine;

      // resync transported engines
      if (seek || speed * lastSpeed < 0) {
        // seek or reverse direction
        nextPosition = this.__syncTransportedPosition(time, position, speed);
      } else if (lastSpeed === 0) {
        // start
        nextPosition = this.__syncTransportedPosition(time, position, speed);

        // schedule transport itself
        this.__scheduledCell = new TransportScheduledCell(this);
        scheduler.add(this.__scheduledCell, Infinity);
      } else if (speed === 0) {
        // stop
        nextPosition = Infinity;

        this.__syncTransportedSpeed(time, position, 0);

        // unschedule transport itself
        scheduler.remove(this.__scheduledCell);
        delete this.__scheduledCell;
      } else {
        // change speed without reversing direction
        this.__syncTransportedSpeed(time, position, speed);
      }

      this.resetNextPosition(nextPosition);
    }
  }

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  add(engine, startPosition = -Infinity, endPosition = Infinity, offsetPosition = startPosition) {
    var transported = null;

    if (offsetPosition === -Infinity)
      offsetPosition = 0;

    if (!engine.interface) {
      if (TimeEngine.implementsTransported(engine))
        transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);
      else if (TimeEngine.implementsSpeedControlled(engine))
        transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);
      else if (TimeEngine.implementsScheduled(engine))
        transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);
      else
        throw new Error("object cannot be added to transport");

      if (transported) {
        var speed = this.__speed;

        this.__engines.push(engine);
        this.__transported.push(transported);

        TimeEngine.setTransported(transported, (nextEnginePosition = null) => {
          // resetNextPosition
          var speed = this.__speed;

          if (speed !== 0) {
            if (nextEnginePosition === null)
              nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);

            var nextPosition = this.__transportQueue.move(transported, nextEnginePosition);
            this.resetNextPosition(nextPosition);
          }
        }, () => {
          // getCurrentTime
          return scheduler.currentTime;
        }, () => {
          // getCurrentPosition
          return this.__transport.currentPosition - this.__offsetPosition;
        });

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);
          var nextPosition = this.__transportQueue.insert(transported, nextEnginePosition);

          this.resetNextPosition(nextPosition);
        }
      }
    } else {
      throw new Error("object has already been added to a master");
    }

    return transported;
  }

  /**
   * Remove a time engine from the transport
   * @param {object} engineOrTransported engine or transported to be removed from the transport
   */
  remove(engineOrTransported) {
    var engine = engineOrTransported;
    var transported = removeCouple(this.__engines, this.__transported, engineOrTransported);

    if (!transported) {
      engine = removeCouple(this.__transported, this.__engines, engineOrTransported);
      transported = engineOrTransported;
    }

    if (engine && transported) {
      var nextPosition = this.__transportQueue.remove(transported);

      TimeEngine.resetInterface(transported);
      transported.destroy();

      if (this.__speed !== 0)
        this.resetNextPosition(nextPosition);
    } else {
      throw new Error("object has not been added to this transport");
    }
  }

  /**
   * Remove all time engines from the transport
   */
  clear() {
    this.syncSpeed(this.currentTime, this.currentPosition, 0);

    for (var transported of this.__transported) {
      TimeEngine.resetInterface(transported);
      transported.destroy();
    }
  }
}

module.exports = Transport;