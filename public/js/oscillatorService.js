'use strict';

var app = angular.module('piFiApp');

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
  }

  this.start = function() {
    self.oscillator.start(0);
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
