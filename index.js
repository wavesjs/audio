var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};/* written in ECMAscript 6 */
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

var Transported = (function(super$0){MIXIN$0(Transported, super$0);
  function Transported(transport, engine, startPosition, endPosition, offsetPosition) {
    this.__transport = transport;
    this.__engine = engine;
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.__haltPosition = Infinity; // haltPosition === null: engine is active
  }Transported.prototype = Object.create(super$0.prototype, {"constructor": {"value": Transported, "configurable": true, "writable": true} });DP$0(Transported, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  Transported.prototype.setBoundaries = function(startPosition, endPosition) {var offsetPosition = arguments[2];if(offsetPosition === void 0)offsetPosition = startPosition;
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.resetNextPosition();
  }

  Transported.prototype.start = function(time, position, speed) {}
  Transported.prototype.stop = function(time, position) {}

  Transported.prototype.syncPosition = function(time, position, speed) {
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

  Transported.prototype.advancePosition = function(time, position, speed) {
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

  Transported.prototype.syncSpeed = function(time, position, speed) {
    if (speed === 0)
      this.stop(time, position - this.__offsetPosition);
  }

  Transported.prototype.destroy = function() {
    this.__transport = null;
    this.__engine = null;
  }
;return Transported;})(TimeEngine);

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
var TransportedTransported = (function(super$0){MIXIN$0(TransportedTransported, super$0);
  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {var this$0 = this;
    super$0.call(this, transport, engine, startPosition, endPosition, offsetPosition);

    TimeEngine.setTransported(engine, function()  {var nextEnginePosition = arguments[0];if(nextEnginePosition === void 0)nextEnginePosition = null;
      // resetNextPosition
      this$0.resetNextPosition(nextEnginePosition + this$0.__offsetPosition);
    }, function()  {
      // getCurrentTime
      return scheduler.currentTime;
    }, function()  {
      // getCurrentPosition
      return this$0.__transport.currentPosition - this$0.__offsetPosition;
    });
  }TransportedTransported.prototype = Object.create(super$0.prototype, {"constructor": {"value": TransportedTransported, "configurable": true, "writable": true} });DP$0(TransportedTransported, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  TransportedTransported.prototype.syncPosition = function(time, position, speed) {
    if (speed > 0 && position < this.__endPosition)
      position = Math.max(position, this.__startPosition);
    else if (speed < 0 && position >= this.__startPosition)
      position = Math.min(position, this.__endPosition);

    return  this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
  }

  TransportedTransported.prototype.advancePosition = function(time, position, speed) {
    position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

    if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition)
      return position;

    return Infinity;
  }

  TransportedTransported.prototype.syncSpeed = function(time, position, speed) {
    if (this.__engine.syncSpeed)
      this.__engine.syncSpeed(time, position, speed);
  }

  TransportedTransported.prototype.destroy = function() {
    TimeEngine.resetInterface(this.__engine);
    super$0.prototype.destroy.call(this);
  }
;return TransportedTransported;})(Transported);

// TransportedSpeedControlled has to start and stop the speed-controlled engines
// when the transport hits the engine's start and end position
var TransportedSpeedControlled = (function(super$0){MIXIN$0(TransportedSpeedControlled, super$0);
  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {var this$0 = this;
    super$0.call(this, transport, engine, startPosition, endPosition, offsetPosition);

    TimeEngine.setSpeedControlled(engine, function()  {
      // getCurrentTime
      return scheduler.currentTime;
    }, function()  {
      // getCurrentPosition
      return this$0.__transport.currentPosition - this$0.__offsetPosition;
    });
  }TransportedSpeedControlled.prototype = Object.create(super$0.prototype, {"constructor": {"value": TransportedSpeedControlled, "configurable": true, "writable": true} });DP$0(TransportedSpeedControlled, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  TransportedSpeedControlled.prototype.start = function(time, position, speed) {
    this.__engine.syncSpeed(time, position, speed);
  }

  TransportedSpeedControlled.prototype.stop = function(time, position) {
    this.__engine.syncSpeed(time, position, 0);
  }

  TransportedSpeedControlled.prototype.syncSpeed = function(time, position, speed) {
    if (this.__haltPosition === null) // engine is active
      this.__engine.syncSpeed(time, position, speed);
  }

  TransportedSpeedControlled.prototype.destroy = function() {
    this.__engine.syncSpeed(this.__transport.time, this.__transport.position - this.__offsetPosition, 0);
    TimeEngine.resetInterface(this.__engine);
    super$0.prototype.destroy.call(this);
  }
;return TransportedSpeedControlled;})(Transported);

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
var TransportedScheduled = (function(super$0){MIXIN$0(TransportedScheduled, super$0);
  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {var this$0 = this;
    super$0.call(this, transport, engine, startPosition, endPosition, offsetPosition);

    scheduler.add(engine, Infinity, function()  {
      // getCurrentPosition
      return this$0.__transport.currentPosition - this$0.__offsetPosition;
    });
  }TransportedScheduled.prototype = Object.create(super$0.prototype, {"constructor": {"value": TransportedScheduled, "configurable": true, "writable": true} });DP$0(TransportedScheduled, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  TransportedScheduled.prototype.start = function(time, position, speed) {
    this.__engine.resetNextTime(time);
  }

  TransportedScheduled.prototype.stop = function(time, position) {
    this.__engine.resetNextTime(Infinity);
  }

  TransportedScheduled.prototype.destroy = function() {
    scheduler.remove(this.__engine);
    super$0.prototype.destroy.call(this);
  }
;return TransportedScheduled;})(Transported);

var TransportScheduledCell = (function(super$0){MIXIN$0(TransportScheduledCell, super$0);
  function TransportScheduledCell(transport) {
    super$0.call(this);
    this.__transport = transport;
  }TransportScheduledCell.prototype = Object.create(super$0.prototype, {"constructor": {"value": TransportScheduledCell, "configurable": true, "writable": true} });DP$0(TransportScheduledCell, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  // TimeEngine method (scheduled interface)
  TransportScheduledCell.prototype.advanceTime = function(time) {
    var transport = this.__transport;
    var position = transport.__getPositionAtTime(time);
    var nextPosition = transport.advancePosition(time, position, transport.__speed);

    if (nextPosition !== Infinity)
      return transport.__getTimeAtPosition(nextPosition);

    return Infinity;
  }
;return TransportScheduledCell;})(TimeEngine);

/**
 * xxx
 *
 *
 */
var Transport = (function(super$0){var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol.iterator||'@@iterator';function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function')return f.call(v);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};MIXIN$0(Transport, super$0);
  function Transport() {
    super$0.call(this);

    this.__engines = [];
    this.__transported = [];

    this.__scheduledCell = null;
    this.__transportQueue = new PriorityQueue();

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;
  }Transport.prototype = Object.create(super$0.prototype, {"constructor": {"value": Transport, "configurable": true, "writable": true}, currentTime: {"get": currentTime$get$0, "configurable": true, "enumerable": true}, currentPosition: {"get": currentPosition$get$0, "configurable": true, "enumerable": true} });DP$0(Transport, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  Transport.prototype.__getPositionAtTime = function(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  Transport.prototype.__getTimeAtPosition = function(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  Transport.prototype.__syncTransportedPosition = function(time, position, speed) {
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

  Transport.prototype.__syncTransportedSpeed = function(time, position, speed) {var $D$0;var $D$1;var $D$2;var $D$3;
    $D$3 = (this.__transported);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for (var transported ; $D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"]; )
{transported = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);transported.syncSpeed(time, position, speed);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function currentTime$get$0() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function currentPosition$get$0() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  /**
   * Reset next transport position
   * @param {Number} next transport position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  Transport.prototype.resetNextPosition = function(nextPosition) {
    if (this.__scheduledCell)
      this.__scheduledCell.resetNextTime(this.__getTimeAtPosition(nextPosition));

    this.__nextPosition = nextPosition;
  }

  // TimeEngine method (transported interface)
  Transport.prototype.syncPosition = function(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    return this.__syncTransportedPosition(time, position, speed);
  }

  // TimeEngine method (transported interface)
  Transport.prototype.advancePosition = function(time, position, speed) {
    var nextEngine = this.__transportQueue.head;
    var nextEnginePosition = nextEngine.advancePosition(time, position, speed);

    this.__nextPosition = this.__transportQueue.move(nextEngine, nextEnginePosition);

    return this.__nextPosition;
  }

  // TimeEngine method (speed-controlled interface)
  Transport.prototype.syncSpeed = function(time, position, speed) {var seek = arguments[3];if(seek === void 0)seek = false;
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
  Transport.prototype.add = function(engine) {var startPosition = arguments[1];if(startPosition === void 0)startPosition = -Infinity;var endPosition = arguments[2];if(endPosition === void 0)endPosition = Infinity;var offsetPosition = arguments[3];if(offsetPosition === void 0)offsetPosition = startPosition;var this$0 = this;
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

        TimeEngine.setTransported(transported, function()  {var nextEnginePosition = arguments[0];if(nextEnginePosition === void 0)nextEnginePosition = null;
          // resetNextPosition
          var speed = this$0.__speed;

          if (speed !== 0) {
            if (nextEnginePosition === null)
              nextEnginePosition = transported.syncPosition(this$0.currentTime, this$0.currentPosition, speed);

            var nextPosition = this$0.__transportQueue.move(transported, nextEnginePosition);
            this$0.resetNextPosition(nextPosition);
          }
        }, function()  {
          // getCurrentTime
          return scheduler.currentTime;
        }, function()  {
          // getCurrentPosition
          return this$0.__transport.currentPosition - this$0.__offsetPosition;
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
  Transport.prototype.remove = function(engineOrTransported) {
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
  Transport.prototype.clear = function() {var $D$4;var $D$5;var $D$6;var $D$7;
    this.syncSpeed(this.currentTime, this.currentPosition, 0);

    $D$7 = (this.__transported);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (var transported ; $D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"]; ){transported = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);
      TimeEngine.resetInterface(transported);
      transported.destroy();
    };$D$4 = $D$5 = $D$6 = $D$7 = void 0;
  }
;return Transport;})(TimeEngine);

module.exports = Transport;