'use strict';

// The app
var app = angular.module('piFiApp', []);

// Ooh, magic numbers and text
// So Keep them together
var defaults = {
  duration: 300,
  frequency: 0,
  initial_opacity: 0.5,
  number_of_digits: 500,
  volume: 0.1,
  wave_type: 'triangle'
};

// The main audio controller
app.controller('AudioCtrl', function($scope, digits_api, scale_factory, oscillator_service) {
  // Necessary for Angular's "controller as" syntax
  var self = this;

  // Initialize things
  self.data_loaded = false;
  self.digits = [];
  self.current_index = 0;
  self.is_playing = false;
  self.duration = defaults.duration;
  self.osc = oscillator_service.getOscillator();
  self.scale = scale_factory;

  self.current_digit_el = function() {
    return $('.digit').eq(self.current_index);
  }

  self.frequency_for_digit = function(digit) {
    var nextIndex = parseInt(self.digits[self.current_index]);
    return self.scale[nextIndex];
  };

  self.step = function() {
    // light up the digit
    self.current_digit_el().addClass('highlighted');

    // play the note corresponding to the current digit's text
    self.osc.play_note(self.frequency_for_digit(self.current_digit_el()), self.duration);
    self.current_index++;
  };


  // Create the self-adjusting timer
  self.timer = new Tock({
    interval: self.duration,
    callback: self.step
  });


  // Get the digits of the number
  digits_api.fetch(defaults.number_of_digits, function(digits) {
    self.digits = digits;
    self.data_loaded = true;
  });


  // Play pause
  self.toggle_play = function() {
    if(self.is_playing) {
      self.pause();
    } else {
      self.play();
    }
    self.is_playing = !self.is_playing;
  };

  // Pause
  self.pause = function() {
    self.timer.stop()
    self.osc.mute();
  };

  // Play
  self.play = function() {
    self.current_digit_el().addClass('highlighted');
    self.timer.start()
  };

  // Reset state
  self.reset = function() {
    self.pause();
    self.current_index = 0;
    $('.digit').removeClass('highlighted');
  };

  // Update duration
  self.update_duration = function() {
    self.pause();
    self.timer.stop();
    self.timer = new Tock({
      interval: self.duration,
      callback: self.step
    });

    if(self.is_playing) {
      self.timer.start();
    }
  };
});
