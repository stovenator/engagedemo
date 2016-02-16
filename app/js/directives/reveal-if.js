'use strict';

module.exports = /*@ngInject*/ function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $elem, attrs) {
            if (attrs.revealIf && $scope.$eval(attrs.revealIf)) {
                $timeout(function () {
                    $elem[0].scrollTop = 0;
                    $elem[0].scrollIntoView();
                }, 10);
            }
        }
    };
};
