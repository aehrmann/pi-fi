'use strict';

var app = angular.module('piFiApp');

// The tone factory (maybe more scales in the future)
app.factory("scale_factory", function scale_factory() {
  // Frequencies for the notes C3 through D4- according to
  // http://www.phy.mtu.edu/~suits/notefreqs.html

  return [130.81, 146.83, 164.81, 174.61, 196.00, 196, 220, 246.94, 261.63, 293.66];
});
