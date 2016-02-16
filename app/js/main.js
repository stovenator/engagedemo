(function () {

'use strict';


  var engageDirectives = require('./directives/directive');
  var engageDemo = angular.module('EngageDemo', ['ngRoute', 'ngAnimate'])

  .config([
    '$locationProvider',
    '$routeProvider',
    function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      // routes
      $routeProvider
        .when("/", {
          templateUrl: "./partials/availability-scheduler.html",
          controller: "MainController"
        })
        .otherwise({
           redirectTo: '/'
        });
    }
  ])

  .controller('MainController', require('./controllers/controller'))
  .directive('adjustable', engageDirectives.adjustable)
  .directive('schedulable', engageDirectives.schedulable)
  .directive('selectable', engageDirectives.selectable)
  .directive('moveable', engageDirectives.moveable)
  .directive('revealIf', require('./directives/reveal-if'));


}());
