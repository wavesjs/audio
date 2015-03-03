'use strict';

var wavesAudio = {
  // core
  audioContext: require('./dist/core/audio-context'),
  TimeEngine: require('./dist/core/time-engine'),
  // engines
  GranularEngine: require('./dist/engines/granular-engine'),
  Metronome: require('./dist/engines/metronome'),
  PlayerEngine: require('./dist/engines/player-engine'),
  SegmentEngine: require('./dist/engines/segment-engine'),
  // masters
  PlayControl: require('./dist/masters/play-control'),
  Scheduler: require('./dist/masters/scheduler'),
  SimpleScheduler: require('./dist/masters/simple-scheduler'),
  Transport: require('./dist/masters/transport'),
  // utils
  PriorityQueue: require('./dist/utils/priority-queue')
};

module.exports = wavesAudio;