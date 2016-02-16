var quarterHeight = 12.5;
var halfHeight = 25;
var hourHeight = 50;


function calculateText(vals){
    var startHour = getHours(vals.top);
    var startMinutes = getMinutes(vals.top);
    var startAMPM = Math.ceil((startHour + 1) / 12) % 2 == 1 ? 'am' : 'pm';
    var endHour = getHours(vals.top + vals.height);
    var endMinutes = getMinutes(vals.top + vals.height);
    var endAMPM = Math.ceil((endHour + 1) / 12) % 2 == 1 ? 'am' : 'pm';
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
        hour = hour - 12;
        return displayHour(hour);
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

function scrollWhileDragging(initialScrollTop, clientY){
    var timeslotsContainer = document.querySelectorAll(".calendar-timeslots-container")[0];
    var calendarContainer = document.querySelectorAll(".calendar-container")[0];
    var calBottom = calendarContainer.offsetHeight + calendarContainer.offsetTop;
    var calTop = timeslotsContainer.getBoundingClientRect().top;
    if (clientY > calBottom){
        timeslotsContainer.scrollTop  = initialScrollTop + (clientY - calBottom);
    }
    else if(clientY < calTop){
        timeslotsContainer.scrollTop  = initialScrollTop - (calTop - clientY);
    }
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
            element.on('mousedown', selectableMouseDown);
            element.on('mouseleave', selectableMouseLeave);
            element.on('mouseenter', selectableMouseEnter);
            $document.on('mousemove', selectableMouseMove);

            function selectableMouseEnter(event) {
                if (!scope.calendar.selectingState && !scope.moveable.isMoving){

                    //Add Red Timer block trailer
                    addTimerblock();
                }
            }


            // This is a document listener, that watches the mouse move anywhere on the document
            function selectableMouseMove(event){
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

            function selectableMouseMoveClicked(event){
                // ClientY is the exact position of the mouse on the screen
                var clientY = event.clientY;
                // OffsetY is the relative position of the mouse in relation to the element
                var offsetY = event.offsetY;
                // If the offset is negative (occassionally happens) , just cheat and set to 0
                offsetY = offsetY < 0 ? 0 : offsetY;
                var highlightVals = moveHighlight(clientY);
                var hText = calculateText(highlightVals);
                setHighlightText(hText);
                scrollWhileDragging(scope.calendar.initialScrollTop, clientY);
            }

            // This is an element listener that watches for the mouse to leave the element
            function selectableMouseLeave(event){
                //Remove Timerblock
                removeTimerblock();
            }

            // This is an element listener that watches for the mouse to click down on the element
            function selectableMouseDown(event){
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
                scope.calendar.initialScrollTop = document.querySelectorAll(".calendar-timeslots-container")[0].scrollTop;

                removeTimerblock();
                addHighlight(offsetY);

                // Create mouseup events on the document
                // instead of on the element, so that if the mouseup occurs elsewhere on the page
                // we can still trap them
                $document.on('mouseup', selectableMouseUp);
                //Turn off the mousemove event for while the mouse is Up

                $document.off('mousemove');
                //Turn on the mousemove event for while the mouse is Down
                $document.on('mousemove', selectableMouseMoveClicked);
            }

            // This is an element listener that watches for the mouse to be released, anywhere on the document
            function selectableMouseUp(event){
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
                $document.on('mousemove', selectableMouseMove);
                console.log("Fire event for item created. New times are: ", calculateText(highlightVals));
            }

            function addHighlight(offsetY){
                var highlightElement = '<div highlight class="slotHighlight"> </div>';
                var highlightTextElement = '<p class="highlight-text" style="bottom: 5px;position: absolute;text-align: center;width: 100%;"> </p>';
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
                    });
                    hlElement.append(highlightTextElement);
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
                    if (elementTop < 0){
                        elementTop = 0;
                        elementHeight = scope.calendar.startOffsetY;
                    }
                    else{
                        elementHeight = scope.calendar.startClientY - clientY;
                    }
                }
                elementHeight = elementHeight < hourHeight ? hourHeight : elementHeight;
                hlElement.css({
                    height: elementHeight  + 'px',
                    top: elementTop + 'px',
                });
                return {height: elementHeight, top: elementTop};
            }

            function addAvailabilityBlock(vals){
                var UUID = scope.getUUID();
                var availElement = '<div moveable class="timeslots-selected cm-mark--storm is-show" id="' + UUID + '"> </div>';
                var removeElement = '<div class="timeslots-remove" ng-click="removeSelectedTimeslot(' + UUID + ');$event.stopPropagation();$event.preventDefault();">X</div>';
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
                ae.append($compile(removeElement)(scope));
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
                    var hlTextElement = angular.element(hlElement[0].querySelectorAll(".highlight-text"));
                    hlTextElement.text(text);
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
                element.on('mousedown', schedMouseDown);
            }
            function schedMouseDown(event){
                event.preventDefault();
                event.stopPropagation();
                console.log("Mouse Down");
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

            element.on('mousedown', adjMouseDown);

            function adjMouseMove(event) {
                var newHeight = scope.adjusting.originalHeight;
                var newTop = scope.adjusting.originalTop;
                var yDistance = event.clientY - (scope.adjusting.startY - scope.adjusting.offsetY);
                if (scope.adjhandle == 'top'){
                    newTop = scope.adjusting.originalTop + (Math.floor(yDistance / (hourHeight/4)) * (hourHeight/4));
                    if (newTop < 0){
                        newTop = 0;
                        newHeight = scope.adjusting.originalBottom;
                    }
                    else {
                        newHeight = scope.adjusting.originalHeight - (Math.floor(yDistance / (hourHeight/4)) * (hourHeight/4));
                    }

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
                scrollWhileDragging(scope.adjusting.initialScrollTop, event.clientY);
            }
            function adjMouseUp(event) {
                $document.off('mouseup');
                $document.off('mousemove');
                scope.adjusting.state = false;
                var glassEl = angular.element(document.querySelectorAll(".glass-viewport"));
                if (glassEl.length > 0){
                    glassEl.remove();
                }
                var se = element.parent();
                var seTop = se.prop("offsetTop");
                var seHeight = se.prop("offsetHeight");
                console.log("Fire event for item adjusted. New times are: ", calculateText({height: seHeight, top: seTop}));
            }
            function adjMouseDown(event) {
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
                scope.adjusting.initialScrollTop = document.querySelectorAll(".calendar-timeslots-container")[0].scrollTop;
                var glassElement = '<div class="glass-viewport"> </div>';
                element.append(glassElement);

                $document.on('mousemove', adjMouseMove);
                $document.on('mouseup', adjMouseUp);
            }

            function setAvailabilityBlockText(vals) {
                var ae = element.parent();
                var availText = calculateText(vals);
                angular.element(element.parent()[0].querySelectorAll(".timeslots-range")).text(availText);
            }
        }
    };
};

//Availability block belonging to me are moveable
var moveable = /*@ngInject*/ function($document) {
    return {
        'restrict' : 'A',
        link: function (scope, element, attr) {
            scope.moveable.isMoving = false;
            element.on('mousedown', moveableMouseDown);
            var elHeight;
            var elementWidth;
            var seClientLeft;
            var curSeColumn = scope.$index;

            function moveableMouseDown(event) {
                event.preventDefault();
                event.stopPropagation();
                if (!angular.element(event.target).hasClass('timeslots-remove')){
                    scope.moveable.isMoving = true;
                    createShadowBlock();
                    // Turn on mousemove listener on document
                    $document.on('mousemove', moveableMouseMove);
                    $document.on('mouseup', moveableMouseUp);
                    var se = angular.element(document.querySelectorAll(".shadowelement"));
                    scope.moveable.offsetStartY = se.prop("offsetTop");
                    scope.moveable.clientStartY = event.clientY;
                    scope.moveable.initialScrollTop = document.querySelectorAll(".calendar-timeslots-container")[0].scrollTop;
                }
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
                scope.moveable.isMoving = false;
                element.detach();
                columnToAppend = angular.element(document.getElementById('timeslot-column-' + curSeColumn));
                columnToAppend.append(element);
                console.log("Fire event for item moved. New times are: ", calculateText({height: seHeight, top: seTop}));
            }

            function moveableMouseMove(event){
                var clientX = event.clientX;
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                seClientLeft = se[0].getBoundingClientRect().left;
                elementWidth = element.prop("offsetWidth");
                elHeight = element.prop("offsetHeight");
                var y = event.clientY;
                var yDistance = event.clientY - scope.moveable.clientStartY;
                var offsetY = scope.moveable.offsetStartY + yDistance;
                if (offsetY > 0){
                    moveShadowBlock(offsetY, clientX);
                    var shadowText = calculateText({top : offsetY, height : elHeight});
                    setShadowText(shadowText);
                }
                scrollWhileDragging(scope.moveable.initialScrollTop, event.clientY);
            }

            function moveShadowBlock(offsetY, clientX){
                var se = angular.element(document.querySelectorAll(".shadowelement"));
                var columnToAppend;
                se.css({
                    top: offsetY + 'px',
                    zIndex: 5
                });
                if (clientX < seClientLeft && !scope.$first){
                    curSeColumn = curSeColumn - 1;
                    se.detach();
                    columnToAppend = angular.element(document.getElementById('timeslot-column-' + curSeColumn));
                    columnToAppend.append(se);
                }
                else if(clientX > seClientLeft + elementWidth && !scope.$last){
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
