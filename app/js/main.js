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
          templateUrl: "./partials/partial1.html",
          controller: "MainController"
        })
        .otherwise({
           redirectTo: '/'
        });
    }
  ]);

  engageDemo.controller('MainController', require('./controllers/controller'));
  engageDemo.directive('adjustable', engageDirectives.adjustable);
  engageDemo.directive('schedulable', engageDirectives.schedulable);
  engageDemo.directive('selectable', engageDirectives.selectable);


}());
