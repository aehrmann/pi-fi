'use strict';

var app = angular.module('piFiApp');

// The number genertor (courtesy of https://helloacm.com/list-of-apis/)
var digits_api_url = 'https://helloacm.com/api/pi/?n=';
app.service('digits_api', function($http) {
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
