var adjustable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function ($scope, element, attr) {
            console.log("Adjustable");
        }
    };
};

var selectable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            console.log("selectable");
        }
    };
};


var schedulable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            console.log("schedulable");
        }
    };
};

exports.adjustable = adjustable;
exports.selectable = selectable;
exports.schedulable = schedulable;
