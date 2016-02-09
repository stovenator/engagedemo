var moment = require('moment-timezone');


module.exports = /*@ngInject*/ function($scope) {
    $scope.test = "Testing 123...";
    $scope.calendar = {};
    $scope.calendar.dayMenuDays = 3;

    $scope.fillDayMenu = function(){
        console.log($scope.calendar.dayMenuDays);
        var myDay = new moment.tz();
        var returnObj = [];
        for (var i=0;i < $scope.calendar.dayMenuDays;i++){
            var newDay = myDay.clone().add(i, 'days');
            returnObj[i] = {day: newDay.format('ddd'), date: newDay.format('DD')};
        }
        $scope.calendar.dayMenu = returnObj;
    };

    $scope.fillTimeslots = function(){
        var myDay = new moment.tz();
        var returnObj = [];
        for (var i=0; i < 24; i++){
            myDay.hours(i).minutes(0).seconds(0);
            returnObj[i] = {hours : myDay.hours(), displayTime: myDay.format('hh:mm:a')};
        }
        $scope.calendar.timeslots = returnObj;
    };

 $scope.fillDayMenu();
 $scope.fillTimeslots();
};
