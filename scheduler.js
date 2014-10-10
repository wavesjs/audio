!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.scheduler=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = _dereq_("audio-context");
var PriorityQueue = _dereq_("priority-queue");
var TimeEngine = _dereq_("time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var Scheduler = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};
  function Scheduler() {
    this.__queue = new PriorityQueue();
    this.__engines = [];

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = 0.1;
  }DPS$0(Scheduler.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}});DP$0(Scheduler,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // global setTimeout scheduling loop
  proto$0.__tick = function() {var this$0 = this;
    while (this.__nextTime <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = this.__nextTime;

      var nextEngine = this.__queue.head;
      var nextEngineTime = Math.max(nextEngine.advanceTime(this.__currentTime), this.__currentTime);

      this.__nextTime = this.__queue.move(nextEngine, nextEngineTime);
    }

    this.__currentTime = null;
    this.__timeout = null;

    if (this.__nextTime !== Infinity) {
      this.__timeout = setTimeout(function()  {
        this$0.__tick();
      }, this.period * 1000);
    }
  };

  proto$0.__reschedule = function(time) {
    if (this.__nextTime !== Infinity) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  };

  /**
   * Get scheduler time
   * @return {Number} current scheduler time including lookahead
   */
  function $currentTime_get$0() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called
   * @param {Number} delay of first callback (default is 0)
   * @param {Number} period callback period (default is 0 for one-shot)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  proto$0.callback = function(callbackFunction) {var delay = arguments[1];if(delay === void 0)delay = 0;var period = arguments[2];if(period === void 0)period = 0;
    var engine = {
      period: period || Infinity,
      advanceTime: function(time) {
        callbackFunction(time);
        return time + this.period;
      }
    };

    this.__nextTime = this.__queue.insert(engine, this.currentTime + delay);
    this.__reschedule();

    return engine;
  };

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   * @param {Function} function to get current position
   */
  proto$0.add = function(engine) {var delay = arguments[1];if(delay === void 0)delay = 0;var getCurrentPosition = arguments[2];if(getCurrentPosition === void 0)getCurrentPosition = null;var this$0 = this;
    if (!engine.interface) {
      if (TimeEngine.implementsScheduled(engine)) {
        this.__engines.push(engine);

        TimeEngine.setScheduled(engine, function(time)  {
          this$0.__nextTime = this$0.__queue.move(engine, time);
          this$0.__reschedule();
        }, function()  {
          return this$0.currentTime;
        }, getCurrentPosition);

        this.__nextTime = this.__queue.insert(engine, this.currentTime + delay);
        this.__reschedule();
      } else {
        throw new Error("object cannot be added to scheduler");
      }
    } else {
      throw new Error("object has already been added to a master");
    }

    return engine;
  };

  /**
   * Remove time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  proto$0.remove = function(engine) {
    if (arrayRemove(this.__engines, engine)) {
      TimeEngine.resetInterface(engine);

      this.__nextTime = this.__queue.remove(engine);
      this.__reschedule();
    } else {
      throw new Error("object has not been added to this scheduler");
    }
  };

  /**
   * Reschedule a scheduled time engine or callback at a given time
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  proto$0.reset = function(engine, time) {
    this.__nextTime = this.__queue.move(engine, time);
    this.__reschedule();
  };
MIXIN$0(Scheduler.prototype,proto$0);proto$0=void 0;return Scheduler;})();

module.exports = new Scheduler(); // export scheduler singleton
},{"audio-context":2,"priority-queue":3,"time-engine":4}],2:[function(_dereq_,module,exports){
/* Generated by es6-transpiler v 0.7.14-2 */
// instantiates an audio context in the global scope if not there already
var context = window.audioContext || new AudioContext() || new webkitAudioContext();
window.audioContext = context;
module.exports = context;
},{}],3:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 *
 * First rather stupid implementation to be optimized...
 */
'use strict';

var PriorityQueue = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};

  function PriorityQueue() {
    this.__objects = [];
    this.reverse = false;
  }DPS$0(PriorityQueue.prototype,{head: {"get": head$get$0, "configurable":true,"enumerable":true}});DP$0(PriorityQueue,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /* Get the index of an object in the object list */
  proto$0.__objectIndex = function(object) {
    for (var i = 0; i < this.__objects.length; i++) {
      if (object === this.__objects[i][0]) {
        return i;
      }
    }

    return -1;
  };

  /* Withdraw an object from the object list */
  proto$0.__removeObject = function(object) {
    var index = this.__objectIndex(object);

    if (index >= 0)
      this.__objects.splice(index, 1);

    if (this.__objects.length > 0)
      return this.__objects[0][1]; // return time of first object

    return Infinity;
  };

  proto$0.__sortObjects = function() {
    if (!this.reverse)
      this.__objects.sort(function(a, b) {
        return a[1] - b[1];
      });
    else
      this.__objects.sort(function(a, b) {
        return b[1] - a[1];
      });
  };

  /**
   * Insert an object to the queue
   * (for this primitive version: prevent sorting for each element by calling with "false" as third argument)
   */
  proto$0.insert = function(object, time) {var sort = arguments[2];if(sort === void 0)sort = true;
    if (time !== Infinity && time != -Infinity) {
      // add new object
      this.__objects.push([object, time]);

      if (sort)
        this.__sortObjects();

      return this.__objects[0][1]; // return time of first object
    }

    return this.__removeObject(object);
  };

  /**
   * Move an object to another time in the queue
   */
  proto$0.move = function(object, time) {
    if (time !== Infinity && time != -Infinity) {
      var index = this.__objectIndex(object);

      if (index < 0)
        this.__objects.push([object, time]); // add new object
      else
        this.__objects[index][1] = time; // update time of existing object

      this.__sortObjects();

      return this.__objects[0][1]; // return time of first object
    }

    return this.__removeObject(object);
  };

  /**
   * Remove an object from the queue
   */
  proto$0.remove = function(object) {
    return this.__removeObject(object);
  };

  /**
   * Clear queue
   */
  proto$0.clear = function() {
    this.__objects.length = 0; // clear object list
    return Infinity;
  };

  /**
   * Get first object in queue
   */
  function head$get$0() {
    return this.__objects[0][0];
  }
MIXIN$0(PriorityQueue.prototype,proto$0);proto$0=void 0;return PriorityQueue;})();

module.exports = PriorityQueue;
},{}],4:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = _dereq_("audio-context");

/**
 * @class TimeEngine
 * @classdesc Base class for time engines
 *
 * Time engines are components that generate more or less regular audio events and/or playback a media stream.
 * They implement one or multiple imterfaces to be synchronized by a master such as a scheduler, a transport or a play-control.
 * The provided interfaces are "scheduled", "transported", and "play-controlled".
 *
 * In the "scheduled" interface the engine implements a method "advanceTime" that is called by the master (usually teh scheduler)
 * and returns the delay until the next call of "advanceTime". The master provides the engien with a function "resetNextTime"
 * to reschedule the next call to another time.
 *
 * In the "transported" interface the master (usually a transport) first calls the method "syncPosition" that returns the position
 * of the first event generated by the engine regarding the playing direction (sign of the speed argument). Events are generated
 * through the method "advancePosition" that returns the position of the next event generated through "advancePosition".
 *
 * In the "speed-controlled" interface the engine is controlled by the method "syncSpeed".
 *
 * For all interfaces the engine is provided with the attribute getters "currentTime" and "currentPosition" (for the case that the master
 * does not implement these attributte getters, the base class provides default implementations).
 */
var TimeEngine = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};

  /**
   * @constructor
   */
  function TimeEngine() {

    /**
     * Interface currently used
     * @type {String}
     */
    this.interface = null;

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }DPS$0(TimeEngine.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": $currentPosition_get$0, "configurable":true,"enumerable":true}});DP$0(TimeEngine,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /**
   * Get the time engine's current master time
   * @type {Function}
   *
   * This function provided by the master.
   */
  function $currentTime_get$0() {
    return audioContext.currentTime;
  }

  /**
   * Get the time engine's current master position
   * @type {Function}
   *
   * This function provided by the master.
   */
  function $currentPosition_get$0() {
    return 0;
  }

  /**
   * Advance engine time (scheduled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the scheduler to let the engine do its work
   * synchronized to the scheduler time.
   * If the engine returns Infinity, it is not called again until it is restarted by
   * the scheduler or it calls resetNextPosition with a valid position.
   */
  // advanceTime(time) {
  //   return time;
  // }

  /**
   * Function provided by the scheduler to reset the engine's next time
   * @param {Number} time new engine time (immediately if not specified)
   */
  proto$0.resetNextTime = function() {var time = arguments[0];if(time === void 0)time = null;};

  /**
   * Synchronize engine to transport position (transported interface)
   * @param {Number} position current transport position to synchronize to
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} speed current speed
   * @return {Number} next position (given the playing direction)
   *
   * This function is called by the msater and allows the engine for synchronizing
   * (seeking) to the current transport position and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the transport or it calls resetNextPosition.
   */
  // syncPosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Advance engine position (transported interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} position current transport position
   * @param {Number} speed current speed
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the transport to let the engine do its work
   * aligned to the transport's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the transport or it calls resetNextPosition.
   */
  // advancePosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Function provided by the transport to reset the next position or to request resynchronizing the engine's position
   * @param {Number} position new engine position (will call syncPosition with the current position if not specified)
   */
  proto$0.resetNextPosition = function() {var position = arguments[0];if(position === void 0)position = null;};

  /**
   * Set engine speed (speed-controlled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} speed current transport speed
   *
   * This function is called by the transport to propagate the transport speed to the engine.
   * The speed can be of any value bewteen -16 and 16.
   * With a speed of 0 the engine is halted.
   */
  // syncSpeed(time, speed) {
  // }

  proto$0.__setGetters = function(getCurrentTime, getCurrentPosition) {
    if (getCurrentTime) {
      Object.defineProperty(this, 'currentTime', {
        configurable: true,
        get: getCurrentTime,
        set: function(time) {}
      });
    }

    if (getCurrentPosition) {
      Object.defineProperty(this, 'currentPosition', {
        configurable: true,
        get: getCurrentPosition,
        set: function(position) {}
      });
    }
  };

  proto$0.__deleteGetters = function() {
    delete this.currentTime;
    delete this.currentPosition;
  };

  /**
   * Connect audio node
   * @param {Object} target audio node
   */
  proto$0.connect = function(target) {
    this.outputNode.connect(target);
    return this;
  };

  /**
   * Disconnect audio node
   * @param {Number} connection connection to be disconnected
   */
  proto$0.disconnect = function(connection) {
    this.outputNode.disconnect(connection);
    return this;
  };
MIXIN$0(TimeEngine.prototype,proto$0);proto$0=void 0;return TimeEngine;})();

/**
 * Check whether the time engine implements the scheduled interface
 **/
TimeEngine.implementsScheduled = function(engine) {
  return (engine.advanceTime && engine.advanceTime instanceof Function);
};

/**
 * Check whether the time engine implements the transported interface
 **/
TimeEngine.implementsTransported = function(engine) {
  return (
    engine.syncPosition && engine.syncPosition instanceof Function &&
    engine.advancePosition && engine.advancePosition instanceof Function
  );
};

/**
 * Check whether the time engine implements the speed-controlled interface
 **/
TimeEngine.implementsSpeedControlled = function(engine) {
  return (engine.syncSpeed && engine.syncSpeed instanceof Function);
};

TimeEngine.setScheduled = function(engine, resetNextTime, getCurrentTime, getCurrentPosition) {
  engine.interface = "scheduled";
  engine.__setGetters(getCurrentTime, getCurrentPosition);
  if (resetNextTime)
    engine.resetNextTime = resetNextTime;
};

TimeEngine.setTransported = function(engine, resetNextPosition, getCurrentTime, getCurrentPosition) {
  engine.interface = "transported";
  engine.__setGetters(getCurrentTime, getCurrentPosition);
  if (resetNextPosition)
    engine.resetNextPosition = resetNextPosition;
};

TimeEngine.setSpeedControlled = function(engine, getCurrentTime, getCurrentPosition) {
  engine.interface = "speed-controlled";
  engine.__setGetters(getCurrentTime, getCurrentPosition);
};

TimeEngine.resetInterface = function(engine) {
  engine.__deleteGetters();
  delete engine.resetNextTime;
  delete engine.resetNextPosition;
  engine.interface = null;
};

module.exports = TimeEngine;
},{"audio-context":5}],5:[function(_dereq_,module,exports){
module.exports=_dereq_(2)
},{}]},{},[1])
(1)
});