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

// The number genertor (courtesy of https://helloacm.com/list-of-apis/)
var digits_api_url = 'https://helloacm.com/api/pi/?n=';
app.factory('digits_api', function($http) {
  return {
    fetch: function(num_digits, callback) {
      $http.get(digits_api_url + num_digits)
      .success(function(response) {

        // I don't know why there's a leading 0 in the string, but let's get
        // rid of that
        var digits = response.slice(1);

        callback(digits);
      });
    }
  };
});

// The tone factory (maybe more scales in the future)
app.factory("scale_factory", function scale_factory() {
  // Frequencies for the notes C3 through D4- according to
  // http://www.phy.mtu.edu/~suits/notefreqs.html

  return [130.81, 146.83, 164.81, 174.61, 196.00, 196, 220, 246.94, 261.63, 293.66];
});

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
