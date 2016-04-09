'use strict';

var app = angular.module('piFiApp');
app.service('timer_service', function() {
  return {

    initialize: function(callbackFn, duration) {
      this.timer = new Tock({
        interval: duration,
        callback: callbackFn
      });
      return this;
    },

    start: function() {
      this.timer.start();
    },

    changeInterval: function(newInterval) {
      this.timer.stop();
      this.timer = Tock({
        interval: newInterval,
        callback: this.timer.callback
      });
    }
  }
});
