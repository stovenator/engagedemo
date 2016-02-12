var quarterHeight = 12.5;
var halfHeight = 25;
var hourHeight = 50;


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

// Selectable Columns can have an availability added to them
var selectable = /*@ngInject*/ function($compile, $document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            // When destroyed, remove all listeners
            element.on('$destroy', function() {
                $document.off('click');
                element.off('mousedown');
                element.off('mouseleave');
                element.off('mouseenter');
                element.off('click');
                $document.off('mousemove');
                $document.off('mouseup');
                scope.calendar.selectingState = false;
            });

            scope.calendar.selectingState = false;
            //Turn on mouse down/leave/move listeners
            element.on('mousedown', selectMouseDown);
            element.on('mouseleave', selectMouseLeave);
            element.on('mouseenter', selectMouseEnter);
            $document.on('mousemove', selectMouseMoveMouseUp);

            function selectMouseEnter(event) {
                if (!scope.calendar.selectingState && !scope.moveable.isMoving){

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
                var availElement = '<div moveable class="timeslots-selected cm-mark--storm is-show" id="' + UUID + '"> </div>';
                var removeElement = '<div class="timeslots-remove" ng-click="removeSelectedTimeslot(' + UUID + ');">X</div>';
                var availInterior = '<div class="timeslots-selected-info"> </div>';
                var titleElement = '<p class="timeslots-availTitle">My Availability</p>';
                var textElement = '<p class="timeslots-range"> </p>';
                var adjElementTop = '<div class="hovercontainer-top" adjustable="" adjhandle="\'top\'" adjusting="adjusting"></div>';
                var adjElementBottom = '<div class="hovercontainer-bottom" adjustable="" adjhandle="\'bottom\'" adjusting="adjusting"> <span class="hc-dot"> </span> <span class="hc-dot"> </span> <span class="hc-dot"> </span> </div>';

                var columnToAppend = angular.element(document.getElementById('timeslot-column-' + scope.$index));
                // We have to $compile this, so that angular knows about the schedulable attribute (to enable the directive)
                columnToAppend.append($compile(availElement)(scope));
                var ae = getAvailabilityBlock(UUID);
                ae.css({
                    height: vals.height  + 'px',
                    top: vals.top + 'px',
                });
                ae.append(availInterior);
                ae.append($compile(adjElementTop)(scope));
                ae.append($compile(adjElementBottom)(scope));
                var aeInterior = angular.element(ae[0].querySelectorAll(".timeslots-selected-info"));
                aeInterior.append(titleElement);
                aeInterior.append(textElement);
                // We have to $compile, to cause angular to know about this new ng-click
                aeInterior.append($compile(removeElement)(scope));
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
                console.log("Entered Schedulable", element[0].id);
            }
        }
    };
};

//Availability block belonging to me are adjustable
var adjustable = /*@ngInject*/ function($document) {
    return {
        restrict: 'A',
        scope: {
            adjhandle : '=',
            adjusting : '=',
            updateAvailTime : '='
        },
        link: function(scope, element, attr) {
            var stylesheet = document.styleSheets[0];

            element.on('$destroy', function() {
                $document.off('mousemove');
                $document.off('mouseup');
                element.off('mousedown');
                scope.adjusting.state = false;
                var glassEl = angular.element(document.querySelectorAll(".glass-viewport"));
                if (glassEl.length > 0){
                    glassEl.remove();
                }
            });
            element.on('mousedown', adjMousedown);
            function adjMousemove(event) {
                var newHeight = scope.adjusting.originalHeight;
                var newTop = scope.adjusting.originalTop;
                var yDistance = event.clientY - (scope.adjusting.startY - scope.adjusting.offsetY);
                if (scope.adjhandle == 'top'){
                    newHeight = scope.adjusting.originalHeight - (Math.floor(yDistance / (hourHeight/4)) * (hourHeight/4));
                    newTop = scope.adjusting.originalTop + (Math.floor(yDistance / (hourHeight/4)) * (hourHeight/4));
                    if (newHeight < hourHeight){
                        newHeight = hourHeight;
                        newTop = scope.adjusting.originalBottom - hourHeight;
                    }
                    scope.adjusting.scheduleElement.css({
                        height: newHeight + "px",
                        top: newTop + "px",
                    });
                }
                else if(scope.adjhandle == 'bottom'){
                    newHeight = scope.adjusting.originalHeight + (Math.floor(yDistance / (hourHeight/4)) * (hourHeight/4));
                    if (newHeight < hourHeight){
                        newHeight = hourHeight;
                    }
                    scope.adjusting.scheduleElement.css({
                        height: newHeight + "px",
                    });
                }
                else{
                    console.log("Should not be able to get here.");
                }
                setAvailabilityBlockText({height: newHeight, top: newTop});
            }
            function adjMouseup(event) {
                $document.off('mouseup');
                $document.off('mousemove');
                scope.adjusting.state = false;
                var glassEl = angular.element(document.querySelectorAll(".glass-viewport"));
                if (glassEl.length > 0){
                    glassEl.remove();
                }
            }
            function adjMousedown(event) {
                console.log("Mousedown");
                // Stop other click event underneath the selection
                event.preventDefault();
                event.stopPropagation();
                scope.adjusting.state = true;

                scope.adjusting.offsetY = event.offsetY;
                scope.adjusting.startY = event.clientY;
                scope.adjusting.scheduleElement = element.parent();
                scope.adjusting.originalTop = scope.adjusting.scheduleElement[0].offsetTop;
                scope.adjusting.originalHeight = scope.adjusting.scheduleElement[0].offsetHeight;
                scope.adjusting.originalBottom = scope.adjusting.originalTop + scope.adjusting.originalHeight;
                var glassElement = '<div class="glass-viewport"> </div>';
                element.append(glassElement);

                $document.on('mousemove', adjMousemove);
                $document.on('mouseup', adjMouseup);
            }

            function setAvailabilityBlockText(vals) {
                var ae = element.parent();
                var availText = calculateText(vals);
                console.log(element);
                angular.element(element.parent()[0].querySelectorAll(".timeslots-range")).text(availText);
            }
        }
    };
};

//Availability block belonging to me are moveable
var moveable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function ($scope, element, attr) {
            $scope.moveable.isMoving = false;
            element.on('mousedown', moveableMouseDown);
            var elHeight;
            var elementWidth;
            var seClientLeft;
            var curSeColumn;

            function moveableMouseDown(event) {
                $scope.moveable.isMoving = true;
                createShadowBlock();
                // Turn on mousemove listener on document
                $document.on('mousemove', moveableMouseMove);
                $document.on('mouseup', moveableMouseUp);
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                $scope.moveable.offsetStartY = se.prop("offsetTop");
                $scope.moveable.clientStartY = event.clientY;
                curSeColumn = $scope.$index;
            }

            function moveableMouseUp(event){
                $document.off('mousemove', moveableMouseMove);
                $document.off('mouseup', moveableMouseUp);
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                var seTop = se.prop("offsetTop");
                var seHeight = se.prop("offsetHeight");
                se.remove();
                element.css({
                    top: seTop + 'px',
                    height: seHeight + 'px'
                });
                setAvailabilityBlockText({height: seHeight, top: seTop});
                $scope.moveable.isMoving = false;
                element.detach();
                columnToAppend = angular.element(document.getElementById('timeslot-column-' + curSeColumn));
                columnToAppend.append(element);
            }

            function moveableMouseMove(event){
                var clientX = event.clientX;
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                seClientLeft = se[0].getBoundingClientRect().left;
                elementWidth = element.prop("offsetWidth");
                elHeight = element.prop("offsetHeight");
                var y = event.clientY;
                var yDistance = event.clientY - $scope.moveable.clientStartY;
                var offsetY = $scope.moveable.offsetStartY + yDistance;
                moveShadowBlock(offsetY, clientX);
                console.log("ElHeight", elHeight);
                var shadowText = calculateText({top : offsetY, height : elHeight});
                setShadowText(shadowText);
            }

            function moveShadowBlock(offsetY, clientX){
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                var columnToAppend;
                se.css({
                    top: offsetY + 'px',
                    zIndex: 5
                });
                if (clientX < seClientLeft && !$scope.$first){
                    console.log("Move left one column");
                    curSeColumn = curSeColumn - 1;
                    se.detach();
                    columnToAppend = angular.element(document.getElementById('timeslot-column-' + curSeColumn));
                    columnToAppend.append(se);
                }
                else if(clientX > seClientLeft + elementWidth && !$scope.$last){
                    console.log("Move right one column");
                    curSeColumn = curSeColumn + 1;
                    se.detach();
                    columnToAppend = angular.element(document.getElementById('timeslot-column-' + curSeColumn));
                    columnToAppend.append(se);
                }
            }

            function setAvailabilityBlockText(vals) {
                var ae = element;
                var availText = calculateText(vals);
                angular.element(element[0].querySelectorAll(".timeslots-range")).text(availText);
            }

            function setShadowText(shadowText){
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                if (se.length > 0) {
                    angular.element(se[0].querySelectorAll(".timeslots-range")).text(shadowText);
                }
            }

            function createShadowBlock(){
                var seTop = element.prop("offsetTop");
                var seHeight = element.prop("offsetHeight");
                var shadowElement = '<div class="timeslots-selected cm-mark--storm is-show shadowelement"> </div>';
                var shadowInterior = '<div class="timeslots-selected-info"> </div>';
                var titleElement = '<p class="timeslots-availTitle">My Availability</p>';
                var textElement = '<p class="timeslots-range"> </p>';
                console.log(element.parent());
                element.parent().append(shadowElement);
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                if (se.length > 0){
                    se.css({
                        height: seHeight  + 'px',
                        top: seTop + 'px',
                        opacity: '0.4',
                        zIndex: 2
                    });
                    se.append(shadowInterior);
                    var seInterior = angular.element(se[0].querySelectorAll(".timeslots-selected-info"));
                    seInterior.append(titleElement);
                    seInterior.append(textElement);
                }
            }
        }
    };
};


exports.adjustable = adjustable;
exports.selectable = selectable;
exports.schedulable = schedulable;
exports.moveable = moveable;
