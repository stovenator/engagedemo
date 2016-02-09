// Selectable Columns can have an availability added to them
var selectable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            element.on('mouseenter', schedMouseEnter);
            function schedMouseEnter(event) {
                //Turn on mouse down/leave/move listeners
                console.log("Enter and add listeners");
                element.on('mousedown', schedMouseDown);
                element.on('mouseleave', schedMouseLeave);
                $document.on('mousemove', schedMouseMove);

                //Add Red Timer block trailer
                console.log("Add Red Timer Block");
                addTimerblock();

            }


            // This is a document listener, that watches the mouse move anywhere on the document
            function schedMouseMove(event){
                console.log("Moving");
                // ClientY is the exact position of the mouse on the screen
                var y = event.clientY;
                // OffsetY is the relative position of the mouse in relation to the element
                var offsetY = event.offsetY;
                // If the offset is negative (occassionally happens) , just cheat and set to 0
                offsetY = offsetY < 0 ? 0 : offsetY;
                moveTimerBlock(offsetY);
                calculateAndSetTimerText(offsetY);

            }

            // This is an element listener that watches for the mouse to leave the element
            function schedMouseLeave(event){
                console.log("Leaving");
                //Turn off listeners
                $document.off('mousemove');
                element.off('mousedown');
                element.off('mouseleave');

                //Remove Timerblock
                removeTimerblock();
            }

            // This is an element listener that watches for the mouse to click down on the element
            function schedMouseDown(event){
                console.log("Down");
            }

            function addTimerblock(){
                var timeElement = '<div timerblock class="timerblock"> </div>';
                var te = angular.element(document.querySelectorAll("[timerblock]"));
                if (te.length === 0){
                    var titleElement = '<span class="timerblock-title">Set Availability</span>';
                    var textElement = '<span class="timerblock-text">12:00</span>';
                    element.parent().append(timeElement);
                    te = angular.element(document.querySelectorAll("[timerblock]"));
                    te.append(titleElement);
                    te.append(textElement);
                }
            }
            function moveTimerBlock(y) {
                var timeEl = angular.element(document.querySelectorAll("[timerblock]"));
                timeEl.css({
                    display: 'block',
                    top: (y + 10) + 'px',
                    left:  (element.prop("offsetLeft") + 10) + 'px',
                    width: (element.prop("offsetWidth") -20) + 'px',
                });
            }

            function removeTimerblock(){
                var timeEl = angular.element(document.querySelectorAll("[timerblock]"));
                timeEl.remove();
            }

            function calculateAndSetTimerText(y){
                var hours =Math.floor(y/50);
                var minutes = Math.floor((y % 50) / 12.5) * 15;
                if (minutes === 0){
                    minutes = "00";
                }
                setTimerText(hours + ":" + minutes);
            }

            function setTimerText(text) {
                var timeEl = angular.element(document.querySelectorAll(".timerblock-text"));
                if (timeEl.length > 0) {
                    timeEl.text(text);
                }
            }

        }
    };
};

//Availability blocks belonging to not me can be scheduled on
var schedulable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            element.on('mouseenter', schedMouseEnter);
            function schedMouseEnter(event) {
                console.log("Entered Schedulable");
            }
        }
    };
};

//Availability block belonging to me are adjustable
var adjustable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function ($scope, element, attr) {
            element.on('mouseenter', schedMouseEnter);
            function schedMouseEnter(event) {
                console.log("Adjustable");
            }
        }
    };
};

//Availability block belonging to me are moveable
var moveable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function ($scope, element, attr) {
            element.on('mouseenter', schedMouseEnter);
            function schedMouseEnter(event) {
                console.log("moveable");
            }
        }
    };
};


exports.adjustable = adjustable;
exports.selectable = selectable;
exports.schedulable = schedulable;
exports.moveable = moveable;
