"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var defaultAudioContext = require("./audio-context");

/**
 * @class TimeEngine
 * @classdesc Base class for time engines
 *
 * Time engines are components that generate more or less regular audio events and/or playback a media stream.
 * They implement one or multiple interfaces to be synchronized by a master such as a scheduler, a transport or a play-control.
 * The provided interfaces are "scheduled", "transported", and "play-controlled".
 *
 * In the "scheduled" interface the engine implements a method "advanceTime" that is called by the master (usually the scheduler)
 * and returns the delay until the next call of "advanceTime". The master provides the engine with a function "resetNextTime"
 * to reschedule the next call to another time.
 *
 * In the "transported" interface the master (usually a transport) first calls the method "syncPosition" that returns the position
 * of the first event generated by the engine regarding the playing direction (sign of the speed argument). Events are generated
 * through the method "advancePosition" that returns the position of the next event generated through "advancePosition".
 *
 * In the "speed-controlled" interface the engine is controlled by the method "syncSpeed".
 *
 * For all interfaces the engine is provided with the attribute getters "currentTime" and "currentPosition" (for the case that the master
 * does not implement these attribute getters, the base class provides default implementations).
 */

var TimeEngine = (function () {

  /**
   * @constructor
   */

  function TimeEngine() {
    var audioContext = arguments[0] === undefined ? defaultAudioContext : arguments[0];

    _babelHelpers.classCallCheck(this, TimeEngine);

    this.audioContext = audioContext;

    /**
     * Current master
     * @type {Object}
     */
    this.master = null;

    /**
     * Interface currently used
     * @type {String}
     */
    this["interface"] = null;

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }

  _babelHelpers.prototypeProperties(TimeEngine, null, {
    currentTime: {

      /**
       * Get the time engine's current master time
       * @type {Function}
       *
       * This function provided by the master.
       */

      get: function () {
        return this.audioContext.currentTime;
      },
      configurable: true
    },
    currentPosition: {

      /**
       * Get the time engine's current master position
       * @type {Function}
       *
       * This function provided by the master.
       */

      get: function () {
        return 0;
      },
      configurable: true
    },
    resetNextTime: {

      /**
       * Function provided by the scheduler to reset the engine's next time
       * @param {Number} time new engine time (immediately if not specified)
       */

      value: function resetNextTime() {
        var time = arguments[0] === undefined ? null : arguments[0];
      },
      writable: true,
      configurable: true
    },
    resetNextPosition: {

      /**
       * Function provided by the transport to reset the next position or to request resynchronizing the engine's position
       * @param {Number} position new engine position (will call syncPosition with the current position if not specified)
       */

      value: function resetNextPosition() {
        var position = arguments[0] === undefined ? null : arguments[0];
      },
      writable: true,
      configurable: true
    },
    __setGetters: {
      value: function __setGetters(getCurrentTime, getCurrentPosition) {
        if (getCurrentTime) {
          Object.defineProperty(this, "currentTime", {
            configurable: true,
            get: getCurrentTime
          });
        }

        if (getCurrentPosition) {
          Object.defineProperty(this, "currentPosition", {
            configurable: true,
            get: getCurrentPosition
          });
        }
      },
      writable: true,
      configurable: true
    },
    __deleteGetters: {
      value: function __deleteGetters() {
        delete this.currentTime;
        delete this.currentPosition;
      },
      writable: true,
      configurable: true
    },
    implementsScheduled: {

      /**
       * Check whether the time engine implements the scheduled interface
       **/

      value: function implementsScheduled() {
        return this.advanceTime && this.advanceTime instanceof Function;
      },
      writable: true,
      configurable: true
    },
    implementsTransported: {

      /**
       * Check whether the time engine implements the transported interface
       **/

      value: function implementsTransported() {
        return this.syncPosition && this.syncPosition instanceof Function && this.advancePosition && this.advancePosition instanceof Function;
      },
      writable: true,
      configurable: true
    },
    implementsSpeedControlled: {

      /**
       * Check whether the time engine implements the speed-controlled interface
       **/

      value: function implementsSpeedControlled() {
        return this.syncSpeed && this.syncSpeed instanceof Function;
      },
      writable: true,
      configurable: true
    },
    setScheduled: {
      value: function setScheduled(master, resetNextTime, getCurrentTime, getCurrentPosition) {
        this.master = master;
        this["interface"] = "scheduled";

        this.__setGetters(getCurrentTime, getCurrentPosition);

        if (resetNextTime) this.resetNextTime = resetNextTime;
      },
      writable: true,
      configurable: true
    },
    setTransported: {
      value: function setTransported(master, resetNextPosition, getCurrentTime, getCurrentPosition) {
        this.master = master;
        this["interface"] = "transported";

        this.__setGetters(getCurrentTime, getCurrentPosition);

        if (resetNextPosition) this.resetNextPosition = resetNextPosition;
      },
      writable: true,
      configurable: true
    },
    setSpeedControlled: {
      value: function setSpeedControlled(master, getCurrentTime, getCurrentPosition) {
        this.master = master;
        this["interface"] = "speed-controlled";

        this.__setGetters(getCurrentTime, getCurrentPosition);
      },
      writable: true,
      configurable: true
    },
    resetInterface: {
      value: function resetInterface() {
        this.__deleteGetters();

        delete this.resetNextTime;
        delete this.resetNextPosition;

        this.master = null;
        this["interface"] = null;
      },
      writable: true,
      configurable: true
    },
    connect: {

      /**
       * Connect audio node
       * @param {Object} target audio node
       */

      value: function connect(target) {
        this.outputNode.connect(target);
        return this;
      },
      writable: true,
      configurable: true
    },
    disconnect: {

      /**
       * Disconnect audio node
       * @param {Number} connection connection to be disconnected
       */

      value: function disconnect(connection) {
        this.outputNode.disconnect(connection);
        return this;
      },
      writable: true,
      configurable: true
    }
  });

  return TimeEngine;
})();

module.exports = TimeEngine;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBT0EsSUFBSSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBdUIvQyxVQUFVOzs7Ozs7QUFLSCxXQUxQLFVBQVU7UUFLRixZQUFZLGdDQUFHLG1CQUFtQjs7dUNBTDFDLFVBQVU7O0FBTVosUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7Ozs7OztBQU1qQyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7Ozs7O0FBTW5CLFFBQUksYUFBVSxHQUFHLElBQUksQ0FBQzs7Ozs7O0FBTXRCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ3hCOztvQ0F6QkcsVUFBVTtBQWlDVixlQUFXOzs7Ozs7Ozs7V0FBQSxZQUFHO0FBQ2hCLGVBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7T0FDdEM7OztBQVFHLG1CQUFlOzs7Ozs7Ozs7V0FBQSxZQUFHO0FBQ3BCLGVBQU8sQ0FBQyxDQUFDO09BQ1Y7OztBQU1ELGlCQUFhOzs7Ozs7O2FBQUEseUJBQWM7WUFBYixJQUFJLGdDQUFHLElBQUk7T0FBSTs7OztBQU03QixxQkFBaUI7Ozs7Ozs7YUFBQSw2QkFBa0I7WUFBakIsUUFBUSxnQ0FBRyxJQUFJO09BQUk7Ozs7QUFFckMsZ0JBQVk7YUFBQSxzQkFBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7QUFDL0MsWUFBSSxjQUFjLEVBQUU7QUFDbEIsZ0JBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtBQUN6Qyx3QkFBWSxFQUFFLElBQUk7QUFDbEIsZUFBRyxFQUFFLGNBQWM7V0FDcEIsQ0FBQyxDQUFDO1NBQ0o7O0FBRUQsWUFBSSxrQkFBa0IsRUFBRTtBQUN0QixnQkFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7QUFDN0Msd0JBQVksRUFBRSxJQUFJO0FBQ2xCLGVBQUcsRUFBRSxrQkFBa0I7V0FDeEIsQ0FBQyxDQUFDO1NBQ0o7T0FDRjs7OztBQUVELG1CQUFlO2FBQUEsMkJBQUc7QUFDaEIsZUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3hCLGVBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztPQUM3Qjs7OztBQUtELHVCQUFtQjs7Ozs7O2FBQUEsK0JBQUc7QUFDcEIsZUFBUSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLFlBQVksUUFBUSxDQUFFO09BQ25FOzs7O0FBS0QseUJBQXFCOzs7Ozs7YUFBQSxpQ0FBRztBQUN0QixlQUNFLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksWUFBWSxRQUFRLElBQzFELElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsWUFBWSxRQUFRLENBQ2hFO09BQ0g7Ozs7QUFLRCw2QkFBeUI7Ozs7OzthQUFBLHFDQUFHO0FBQzFCLGVBQVEsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLFFBQVEsQ0FBRTtPQUMvRDs7OztBQUVELGdCQUFZO2FBQUEsc0JBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7QUFDdEUsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBSSxhQUFVLEdBQUcsV0FBVyxDQUFDOztBQUU3QixZQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDOztBQUV0RCxZQUFJLGFBQWEsRUFDZixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztPQUN0Qzs7OztBQUVELGtCQUFjO2FBQUEsd0JBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtBQUM1RSxZQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixZQUFJLGFBQVUsR0FBRyxhQUFhLENBQUM7O0FBRS9CLFlBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7O0FBRXRELFlBQUksaUJBQWlCLEVBQ25CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztPQUM5Qzs7OztBQUVELHNCQUFrQjthQUFBLDRCQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7QUFDN0QsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBSSxhQUFVLEdBQUcsa0JBQWtCLENBQUM7O0FBRXBDLFlBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7T0FDdkQ7Ozs7QUFFRCxrQkFBYzthQUFBLDBCQUFHO0FBQ2YsWUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUV2QixlQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDMUIsZUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7O0FBRTlCLFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFlBQUksYUFBVSxHQUFHLElBQUksQ0FBQztPQUN2Qjs7OztBQU1ELFdBQU87Ozs7Ozs7YUFBQSxpQkFBQyxNQUFNLEVBQUU7QUFDZCxZQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxlQUFPLElBQUksQ0FBQztPQUNiOzs7O0FBTUQsY0FBVTs7Ozs7OzthQUFBLG9CQUFDLFVBQVUsRUFBRTtBQUNyQixZQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN2QyxlQUFPLElBQUksQ0FBQztPQUNiOzs7Ozs7U0E3SkcsVUFBVTs7O0FBZ0toQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gdGltZSBlbmdpbmUgYmFzZSBjbGFzc1xuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgZGVmYXVsdEF1ZGlvQ29udGV4dCA9IHJlcXVpcmUoXCIuL2F1ZGlvLWNvbnRleHRcIik7XG5cbi8qKlxuICogQGNsYXNzIFRpbWVFbmdpbmVcbiAqIEBjbGFzc2Rlc2MgQmFzZSBjbGFzcyBmb3IgdGltZSBlbmdpbmVzXG4gKlxuICogVGltZSBlbmdpbmVzIGFyZSBjb21wb25lbnRzIHRoYXQgZ2VuZXJhdGUgbW9yZSBvciBsZXNzIHJlZ3VsYXIgYXVkaW8gZXZlbnRzIGFuZC9vciBwbGF5YmFjayBhIG1lZGlhIHN0cmVhbS5cbiAqIFRoZXkgaW1wbGVtZW50IG9uZSBvciBtdWx0aXBsZSBpbnRlcmZhY2VzIHRvIGJlIHN5bmNocm9uaXplZCBieSBhIG1hc3RlciBzdWNoIGFzIGEgc2NoZWR1bGVyLCBhIHRyYW5zcG9ydCBvciBhIHBsYXktY29udHJvbC5cbiAqIFRoZSBwcm92aWRlZCBpbnRlcmZhY2VzIGFyZSBcInNjaGVkdWxlZFwiLCBcInRyYW5zcG9ydGVkXCIsIGFuZCBcInBsYXktY29udHJvbGxlZFwiLlxuICpcbiAqIEluIHRoZSBcInNjaGVkdWxlZFwiIGludGVyZmFjZSB0aGUgZW5naW5lIGltcGxlbWVudHMgYSBtZXRob2QgXCJhZHZhbmNlVGltZVwiIHRoYXQgaXMgY2FsbGVkIGJ5IHRoZSBtYXN0ZXIgKHVzdWFsbHkgdGhlIHNjaGVkdWxlcilcbiAqIGFuZCByZXR1cm5zIHRoZSBkZWxheSB1bnRpbCB0aGUgbmV4dCBjYWxsIG9mIFwiYWR2YW5jZVRpbWVcIi4gVGhlIG1hc3RlciBwcm92aWRlcyB0aGUgZW5naW5lIHdpdGggYSBmdW5jdGlvbiBcInJlc2V0TmV4dFRpbWVcIlxuICogdG8gcmVzY2hlZHVsZSB0aGUgbmV4dCBjYWxsIHRvIGFub3RoZXIgdGltZS5cbiAqXG4gKiBJbiB0aGUgXCJ0cmFuc3BvcnRlZFwiIGludGVyZmFjZSB0aGUgbWFzdGVyICh1c3VhbGx5IGEgdHJhbnNwb3J0KSBmaXJzdCBjYWxscyB0aGUgbWV0aG9kIFwic3luY1Bvc2l0aW9uXCIgdGhhdCByZXR1cm5zIHRoZSBwb3NpdGlvblxuICogb2YgdGhlIGZpcnN0IGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZW5naW5lIHJlZ2FyZGluZyB0aGUgcGxheWluZyBkaXJlY3Rpb24gKHNpZ24gb2YgdGhlIHNwZWVkIGFyZ3VtZW50KS4gRXZlbnRzIGFyZSBnZW5lcmF0ZWRcbiAqIHRocm91Z2ggdGhlIG1ldGhvZCBcImFkdmFuY2VQb3NpdGlvblwiIHRoYXQgcmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIG5leHQgZXZlbnQgZ2VuZXJhdGVkIHRocm91Z2ggXCJhZHZhbmNlUG9zaXRpb25cIi5cbiAqXG4gKiBJbiB0aGUgXCJzcGVlZC1jb250cm9sbGVkXCIgaW50ZXJmYWNlIHRoZSBlbmdpbmUgaXMgY29udHJvbGxlZCBieSB0aGUgbWV0aG9kIFwic3luY1NwZWVkXCIuXG4gKlxuICogRm9yIGFsbCBpbnRlcmZhY2VzIHRoZSBlbmdpbmUgaXMgcHJvdmlkZWQgd2l0aCB0aGUgYXR0cmlidXRlIGdldHRlcnMgXCJjdXJyZW50VGltZVwiIGFuZCBcImN1cnJlbnRQb3NpdGlvblwiIChmb3IgdGhlIGNhc2UgdGhhdCB0aGUgbWFzdGVyXG4gKiBkb2VzIG5vdCBpbXBsZW1lbnQgdGhlc2UgYXR0cmlidXRlIGdldHRlcnMsIHRoZSBiYXNlIGNsYXNzIHByb3ZpZGVzIGRlZmF1bHQgaW1wbGVtZW50YXRpb25zKS5cbiAqL1xuY2xhc3MgVGltZUVuZ2luZSB7XG5cbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gYXVkaW9Db250ZXh0O1xuXG4gICAgLyoqXG4gICAgICogQ3VycmVudCBtYXN0ZXJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEludGVyZmFjZSBjdXJyZW50bHkgdXNlZFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5pbnRlcmZhY2UgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogT3V0cHV0IGF1ZGlvIG5vZGVcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHRoaXMub3V0cHV0Tm9kZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0aW1lIGVuZ2luZSdzIGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHR5cGUge0Z1bmN0aW9ufVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHByb3ZpZGVkIGJ5IHRoZSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdGltZSBlbmdpbmUncyBjdXJyZW50IG1hc3RlciBwb3NpdGlvblxuICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gcHJvdmlkZWQgYnkgdGhlIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gcHJvdmlkZWQgYnkgdGhlIHNjaGVkdWxlciB0byByZXNldCB0aGUgZW5naW5lJ3MgbmV4dCB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG5ldyBlbmdpbmUgdGltZSAoaW1tZWRpYXRlbHkgaWYgbm90IHNwZWNpZmllZClcbiAgICovXG4gIHJlc2V0TmV4dFRpbWUodGltZSA9IG51bGwpIHt9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHByb3ZpZGVkIGJ5IHRoZSB0cmFuc3BvcnQgdG8gcmVzZXQgdGhlIG5leHQgcG9zaXRpb24gb3IgdG8gcmVxdWVzdCByZXN5bmNocm9uaXppbmcgdGhlIGVuZ2luZSdzIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiBuZXcgZW5naW5lIHBvc2l0aW9uICh3aWxsIGNhbGwgc3luY1Bvc2l0aW9uIHdpdGggdGhlIGN1cnJlbnQgcG9zaXRpb24gaWYgbm90IHNwZWNpZmllZClcbiAgICovXG4gIHJlc2V0TmV4dFBvc2l0aW9uKHBvc2l0aW9uID0gbnVsbCkge31cblxuICBfX3NldEdldHRlcnMoZ2V0Q3VycmVudFRpbWUsIGdldEN1cnJlbnRQb3NpdGlvbikge1xuICAgIGlmIChnZXRDdXJyZW50VGltZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjdXJyZW50VGltZScsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGdldEN1cnJlbnRUaW1lXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZ2V0Q3VycmVudFBvc2l0aW9uKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2N1cnJlbnRQb3NpdGlvbicsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGdldEN1cnJlbnRQb3NpdGlvblxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX19kZWxldGVHZXR0ZXJzKCkge1xuICAgIGRlbGV0ZSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIGRlbGV0ZSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSB0aW1lIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlXG4gICAqKi9cbiAgaW1wbGVtZW50c1NjaGVkdWxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMuYWR2YW5jZVRpbWUgJiYgdGhpcy5hZHZhbmNlVGltZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSB0aW1lIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSB0cmFuc3BvcnRlZCBpbnRlcmZhY2VcbiAgICoqL1xuICBpbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc3luY1Bvc2l0aW9uICYmIHRoaXMuc3luY1Bvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24gJiZcbiAgICAgIHRoaXMuYWR2YW5jZVBvc2l0aW9uICYmIHRoaXMuYWR2YW5jZVBvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb25cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHRpbWUgZW5naW5lIGltcGxlbWVudHMgdGhlIHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlXG4gICAqKi9cbiAgaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMuc3luY1NwZWVkICYmIHRoaXMuc3luY1NwZWVkIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG5cbiAgc2V0U2NoZWR1bGVkKG1hc3RlciwgcmVzZXROZXh0VGltZSwgZ2V0Q3VycmVudFRpbWUsIGdldEN1cnJlbnRQb3NpdGlvbikge1xuICAgIHRoaXMubWFzdGVyID0gbWFzdGVyO1xuICAgIHRoaXMuaW50ZXJmYWNlID0gXCJzY2hlZHVsZWRcIjtcblxuICAgIHRoaXMuX19zZXRHZXR0ZXJzKGdldEN1cnJlbnRUaW1lLCBnZXRDdXJyZW50UG9zaXRpb24pO1xuXG4gICAgaWYgKHJlc2V0TmV4dFRpbWUpXG4gICAgICB0aGlzLnJlc2V0TmV4dFRpbWUgPSByZXNldE5leHRUaW1lO1xuICB9XG5cbiAgc2V0VHJhbnNwb3J0ZWQobWFzdGVyLCByZXNldE5leHRQb3NpdGlvbiwgZ2V0Q3VycmVudFRpbWUsIGdldEN1cnJlbnRQb3NpdGlvbikge1xuICAgIHRoaXMubWFzdGVyID0gbWFzdGVyO1xuICAgIHRoaXMuaW50ZXJmYWNlID0gXCJ0cmFuc3BvcnRlZFwiO1xuXG4gICAgdGhpcy5fX3NldEdldHRlcnMoZ2V0Q3VycmVudFRpbWUsIGdldEN1cnJlbnRQb3NpdGlvbik7XG5cbiAgICBpZiAocmVzZXROZXh0UG9zaXRpb24pXG4gICAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uID0gcmVzZXROZXh0UG9zaXRpb247XG4gIH1cblxuICBzZXRTcGVlZENvbnRyb2xsZWQobWFzdGVyLCBnZXRDdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSBtYXN0ZXI7XG4gICAgdGhpcy5pbnRlcmZhY2UgPSBcInNwZWVkLWNvbnRyb2xsZWRcIjtcblxuICAgIHRoaXMuX19zZXRHZXR0ZXJzKGdldEN1cnJlbnRUaW1lLCBnZXRDdXJyZW50UG9zaXRpb24pO1xuICB9XG5cbiAgcmVzZXRJbnRlcmZhY2UoKSB7XG4gICAgdGhpcy5fX2RlbGV0ZUdldHRlcnMoKTtcblxuICAgIGRlbGV0ZSB0aGlzLnJlc2V0TmV4dFRpbWU7XG4gICAgZGVsZXRlIHRoaXMucmVzZXROZXh0UG9zaXRpb247XG5cbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5pbnRlcmZhY2UgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbm5lY3QgYXVkaW8gbm9kZVxuICAgKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IGF1ZGlvIG5vZGVcbiAgICovXG4gIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmNvbm5lY3QodGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGF1ZGlvIG5vZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGNvbm5lY3Rpb24gY29ubmVjdGlvbiB0byBiZSBkaXNjb25uZWN0ZWRcbiAgICovXG4gIGRpc2Nvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5kaXNjb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZUVuZ2luZTtcbiJdfQ==