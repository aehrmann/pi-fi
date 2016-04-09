'use strict';

var app = angular.module('piFiApp');

// The tone factory (maybe more scales in the future)
app.factory("scale_factory", function scale_factory() {
  // Frequencies for the notes A3 through C#4 - according to
  // http://www.phy.mtu.edu/~suits/notefreqs.html

  return [220.00, 246.94, 277.18, 293.66, 329.63, 369.99, 415.30, 440.00, 493.88, 554.37];
});
