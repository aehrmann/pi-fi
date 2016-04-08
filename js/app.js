  'use strict';

// with dependencies loaded
(function(angular, $, Tock) {
  // The app
  var app = angular.module('piFiApp', []);

  // Ooh, magic numbers and text
  // So Keep them together
  var defaults = {
    duration: 300,
    volume: 0.1,
    frequency: 440,
    numberOfDigits: 500,
    initialOpacity: 0.5
  };

  // The genertor (courtesy of https://helloacm.com/list-of-apis/)
  var digitsApiUrl = 'https://helloacm.com/api/pi/?n=';
  app.factory('digitsApi', function($http) {
    return {
      fetch: function(numDigits, callback) {
        $http.get(digitsApiUrl + numDigits)
        .success(function(response) {

          // I don't know why there's a leading 0 in the string...
          var digits = response.slice(1);

          callback(digits);
        });
      }
    };
  });

  function Oscillator() {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillatorNode = audioContext.createOscillator();
    this.gainNode = audioContext.createGain();

    // Set some default parameters
    this.oscillatorNode.frequency.value = defaults.frequency;
    this.oscillatorNode.type = 'triangle';
    this.gainNode.gain.value = 0;

    // Connect all the tubes
    this.oscillatorNode.connect(this.gainNode);
    this.gainNode.connect(audioContext.destination);

    this.oscillatorNode.start(0);

    this.start = function() {
      this.oscillator.start(0);
    };

    this.stop = function() {
      this.gainNode.gain.value = 0;
      this.oscillatorNode.stop();
      this.oscillatorNode = this.audioContext.createOscillator();
      this.oscillatorNode.connect(this.gainNode);
    };

    this.playNote = function(noteFrequency) {
      // Switch off, change frequency, switch on
      this.gainNode.gain.value = 0;
      this.oscillatorNode.frequency.value = noteFrequency;
      this.gainNode.gain.value = defaults.volume;
    };

    this.resetVolume = function() {
      this.gainNode.gain.value = 0;
    }
  };

  // Register the oscillator service with Angular
  app.service("oscillatorService", function() {
    return {
      getOscillator: function() {
        return new Oscillator();
      }
    }
  });

  // The tone factory (maybe more scales in the future)
  app.factory("scaleFactory", function scaleFactory() {
    // Frequencies for the notes C3 through D4- according to
    // http://www.phy.mtu.edu/~suits/notefreqs.html
    return [130.81, 146.83, 164.81, 174.61, 196.00, 196, 220, 246.94, 261.63, 293.66];
  });

  // The main audio controller
  app.controller('AudioCtrl', function($scope, digitsApi, scaleFactory, oscillatorService) {
    // Necessary for "controller as" syntax
    var self = this;

    // Initialize things
    self.dataLoaded = false;
    self.digits = [];
    self.currentIndex = 0;
    self.isPlaying = false;
    self.duration = defaults.duration;
    self.osc = oscillatorService.getOscillator();
    self.scale = scaleFactory;

    self.currentDigitEl = function() {
      return $('.digit').eq(self.currentIndex);
    }

    self.noteForDigit = function(digit) {
      return self.scale[parseInt(self.digits[self.currentIndex])];
    };

    self.step = function() {
      // light up the digit
      self.currentDigitEl().addClass('highlighted');

      // play the note corresponding to the current digit's text
      self.osc.playNote(self.noteForDigit(self.currentDigitEl()), self.duration);
      self.currentIndex++;
    };


    // Create the self-adjusting timer
    self.timer = new Tock({
      interval: self.duration,
      callback: self.step
    });


    // Get the digits of the number
    digitsApi.fetch(defaults.numberOfDigits, function(digits) {
      self.digits = digits;
      self.dataLoaded = true;
    });


    // Play pause
    self.togglePlay = function() {
      if(self.isPlaying) {
        self.pause();
      } else {
        self.play();
      }
      self.isPlaying = !self.isPlaying;
    };

    // Pause
    self.pause = function() {
      self.timer.stop()
      self.osc.resetVolume();
    };

    // Play
    self.play = function() {
      self.currentDigitEl().addClass('highlighted');
      self.timer.start()
    };

    // Reset state
    self.reset = function() {
      self.pause();
      self.currentIndex = 0;
      $('.digit').removeClass('highlighted');
    };

    // Update duration
    self.updateDuration = function() {
      self.pause();
      self.timer.stop();
      self.timer = new Tock({
        interval: self.duration,
        callback: self.step
      });

      if(self.isPlaying) {
        self.timer.start();
      }
    };
  });

})(window.angular, window.jQuery, window.Tock);
