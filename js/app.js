'use strict';

// with dependencies loaded
(function(angular, $, Tock) {
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

  function Oscillator(frequency, wave_type, volume) {
    var self = this;
    // Grab the global audio context so we can make some noises
    var audio_context = new (window.AudioContext || window.webkitAudioContext)();

    this.initialize = function(frequency, wave_type, volume) {
      // Create nodes for the oscillator and a node to regulate its volume
      self.oscillator_node = audio_context.createOscillator();
      self.gain_node = audio_context.createGain();

      // Set some default parameters
      self.oscillator_node.frequency.value = frequency || defaults.frequency;
      self.oscillator_node.type = wave_type || defaults.wave_type;
      self.gain_node.gain.value = volume || defaults.volume;

      // Connect all the tubes: oscillator -> gain node -> browser output
      self.oscillator_node.connect(self.gain_node);
      self.gain_node.connect(audio_context.destination);

      // Start the node, even though we can't hear it; it's volume will change 
      // soon enough
      self.oscillator_node.start(0);
    };

    this.start = function() {
      self.initialize();
      this.oscillator.start(0);
    };

    this.stop = function() {
      self.gain_node.gain.value = 0;
      self.oscillator_node.stop();

      // The Web Audio API only allows nodes to be started and stopped once, so 
      // we create a fresh instance, here, for the next user of the service.
      self.oscillator_node = self.audio_context.createOscillator();
      self.oscillator_node.connect(self.gain_node);
    };

    // Switch off, change frequency, switch on
    this.play_note = function(note_frequency) {
      self.gain_node.gain.value = 0;
      self.oscillator_node.frequency.value = note_frequency;
      self.gain_node.gain.value = defaults.volume;
    };

    this.mute = function() {
      self.gain_node.gain.value = 0;
    }
  };

  // Register the oscillator service with Angular
  app.service("oscillator_service", function() {
    return {
      getOscillator: function() {
        var osc = new Oscillator();
        osc.initialize();
        return osc;
      }
    }
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

})(window.angular, window.jQuery, window.Tock);
