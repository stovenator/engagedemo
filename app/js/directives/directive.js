var quarterHeight = 12.5;
var halfHeight = 25;
var hourHeight = 50;

// Selectable Columns can have an availability added to them
var selectable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            scope.calendar.selectingState = false;
            //Turn on mouse down/leave/move listeners
            element.on('mousedown', selectMouseDown);
            element.on('mouseleave', selectMouseLeave);
            $document.on('mousemove', selectMouseMoveMouseUp);
            element.on('mouseenter', selectMouseEnter);

            function selectMouseEnter(event) {
                if (!scope.calendar.selectingState){

                    //Add Red Timer block trailer
                    addTimerblock();
                }
            }


            // This is a document listener, that watches the mouse move anywhere on the document
            function selectMouseMoveMouseUp(event){
                // addTimerblock();
                // ClientY is the exact position of the mouse on the screen
                var y = event.clientY;
                // OffsetY is the relative position of the mouse in relation to the element
                var offsetY = event.offsetY;
                // If the offset is negative (occassionally happens) , just cheat and set to 0
                offsetY = offsetY < 0 ? 0 : offsetY;
                moveTimerBlock(offsetY);
                var timerText = calculateText({top : offsetY, height : 50});
                setTimerText(timerText);
            }

            function selectMouseMoveMouseDown(event){
                // ClientY is the exact position of the mouse on the screen
                var clientY = event.clientY;
                // OffsetY is the relative position of the mouse in relation to the element
                var offsetY = event.offsetY;
                // If the offset is negative (occassionally happens) , just cheat and set to 0
                offsetY = offsetY < 0 ? 0 : offsetY;
                var highlightVals = moveHighlight(clientY);
                var hText = calculateText(highlightVals);
                setHighlightText(hText);
            }

            // This is an element listener that watches for the mouse to leave the element
            function selectMouseLeave(event){
                //Remove Timerblock
                removeTimerblock();
            }

            // This is an element listener that watches for the mouse to click down on the element
            function selectMouseDown(event){
                scope.calendar.selectingState = true;
                var clientY = event.clientY;
                //Stop any other mouse events to click through below
                event.preventDefault();
                event.stopPropagation();

                var offsetY = event.offsetY;
                // If the offset is negative (occassionally happens) , just cheat and set to 0
                offsetY = offsetY < 0 ? 0 : offsetY;

                // Set to nearest quarter hour
                offsetY = Math.floor(offsetY / quarterHeight) * quarterHeight;

                scope.calendar.startOffsetY = offsetY;
                scope.calendar.startClientY = clientY;

                removeTimerblock();
                addHighlight(offsetY);

                // Create mouseup events on the document
                // instead of on the element, so that if the mouseup occurs elsewhere on the page
                // we can still trap them
                $document.on('mouseup', selectMouseUp);
                //Turn off the mousemove event for while the mouse is Up

                $document.off('mousemove');
                //Turn on the mousemove event for while the mouse is Down
                $document.on('mousemove', selectMouseMoveMouseDown);
            }

            // This is an element listener that watches for the mouse to be released, anywhere on the document
            function selectMouseUp(event){
                var clientY = event.clientY;
                // Get the top and height values to pass to the availability block
                var highlightVals = moveHighlight(clientY);
                removeHighlight();
                addAvailabilityBlock(highlightVals);
                scope.calendar.selectingState = false;

                //Add Red Timer block trailer
                addTimerblock();
                //Turn off the mousemove event for while the mouse is Down
                $document.off('mousemove');
                $document.off('mouseup');
                //Turn on the mousemove event for while the mouse is Up
                $document.on('mousemove', selectMouseMoveMouseUp);
            }

            function addHighlight(offsetY){
                var highlightElement = '<div highlight class="slotHighlight"> </div>';
                var hlElement = getHighlightBlock();
                if (hlElement.length === 0){
                    element.parent().append(highlightElement);
                    hlElement = getHighlightBlock();
                    hlElement.css({
                        display: 'block',
                        top: offsetY + 'px',
                        left:  (element.prop("offsetLeft") + 10) + 'px',
                        width: (element.prop("offsetWidth") -20) + 'px',
                        height: halfHeight + 'px',
                        //minHeight: halfHeight + 'px',
                    });
                }
            }

            function moveHighlight(clientY) {
                var hlElement = angular.element(document.querySelectorAll("[highlight]"));
                var elementTop;
                var elementHeight;
                // If we are below the starting point
                if (scope.calendar.startClientY <= clientY){
                    elementTop = scope.calendar.startOffsetY;
                    elementHeight = Math.abs(scope.calendar.startClientY - clientY);
                }
                // If we are above the starting point
                else{
                    elementTop = scope.calendar.startOffsetY - (scope.calendar.startClientY - clientY);
                    elementHeight = (scope.calendar.startClientY - clientY);
                }
                hlElement.css({
                    height: elementHeight  + 'px',
                    top: elementTop + 'px',
                });
                return {height: elementHeight, top: elementTop};
            }

            function addAvailabilityBlock(vals){
                var UUID = scope.getUUID();
                var availElement = '<div class="timeslots-selected is-show" id="' + UUID + '"> </div>';
                var availInterior = '<div class="timeslots-selected-info"> </div>';
                var columnToAppend = angular.element(document.getElementById('timeslot-column-' + scope.$index));
                columnToAppend.append(availElement);
                var ae = getAvailabilityBlock(UUID);
                ae.append(availInterior);
                var aei = angular.element(ae[0].querySelectorAll(".timeslots-selected-info"));
                if (aei.length > 0){
                    ae.css({
                        height: vals.height  + 'px',
                        top: vals.top + 'px',
                    });
                    var titleElement = '<p class="timeslots-availTitle">My Availability</p>';
                    var textElement = '<p class="timeslots-range">12:00</p>';
                    aei.append(titleElement);
                    aei.append(textElement);
                }
                setAvailabilityBlockText(UUID, vals);
            }

            function addTimerblock(){
                var timeElement = '<div timerblock class="timerblock"> </div>';
                var te = getTimerBlock();
                if (te.length === 0){
                    var titleElement = '<span class="timerblock-title">Set Availability</span>';
                    var textElement = '<span class="timerblock-text">12:00</span>';
                    element.parent().append(timeElement);
                    te = getTimerBlock();
                    te.append(titleElement);
                    te.append(textElement);
                    te.css({
                        left:  (element.prop("offsetLeft") + 10) + 'px',
                        width: (element.prop("offsetWidth") -20) + 'px',
                    });
                }
            }

            function getAvailabilityBlock(id){
                return angular.element(document.getElementById(id));
            }

            function getHighlightBlock(){
                return angular.element(document.querySelectorAll("[highlight]"));
            }

            function getTimerBlock(){
                return angular.element(document.querySelectorAll("[timerblock]"));
            }

            function removeHighlight(){
                var hlElement = getHighlightBlock();
                if (hlElement.length > 0){
                    hlElement[0].remove();
                }
            }

            function moveTimerBlock(y) {
                var timeEl = getTimerBlock();
                timeEl.css({
                    display: 'block',
                    top: (y + 10) + 'px',
                });
            }

            function removeTimerblock(){
                var timeEl = getTimerBlock();
                if (timeEl.length > 0){
                    timeEl[0].remove();
                }
            }

            function calculateText(vals){
                var startHour = getHours(vals.top);
                var startMinutes = getMinutes(vals.top);
                var startAMPM = startHour <= 11 ? 'am' : 'pm';
                var endHour = getHours(vals.top + vals.height);
                var endMinutes = getMinutes(vals.top + vals.height);
                var endAMPM = endHour <= 11 ? 'am' : 'pm';
                return displayHour(startHour) + ":" + displayMinutes(startMinutes) + startAMPM + " - " + displayHour(endHour) + ":" + displayMinutes(endMinutes) + endAMPM;
            }

            function getHours(offsetY){
                return Math.floor(offsetY/hourHeight);
            }

            function displayHour(hour){
                if (hour === 0){
                    return 12;
                }
                else if(hour > 12){
                    return hour - 12;
                }
                else{
                    return hour;
                }
            }
            function displayMinutes(minutes){
                if (minutes === 0){
                    minutes = "00";
                }
                return minutes;
            }

            function getMinutes(offsetY){
                return Math.floor((offsetY % hourHeight) / quarterHeight) * 15;
            }

            function calculateAndSetTimerText(y){
                var hours =Math.floor(y/hourHeight);
                var minutes = Math.floor((y % hourHeight) / quarterHeight) * 15;
                setTimerText(hours + ":" + minutes);
            }

            function setTimerText(text) {
                var timeEl = angular.element(document.querySelectorAll(".timerblock-text"));
                if (timeEl.length > 0) {
                    timeEl.text(text);
                }
            }

            function setHighlightText(text) {
                var hlElement = getHighlightBlock();
                if (hlElement.length > 0) {
                    hlElement.text(text);
                }
            }

            function setAvailabilityBlockText(UUID, vals) {
                var ae = getAvailabilityBlock(UUID);
                if (ae.length > 0) {
                    var availText = calculateText(vals);
                    angular.element(ae[0].querySelectorAll(".timeslots-range")).text(availText);
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
