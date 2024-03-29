// Ghost's Anatomy
// Leap Motion Script
// 

// Global keyTap and screenTap arrays
var keyTaps = [];
var KEYTAP_LIFETIME = .5;
var KEYTAP_START_SIZE = 15;

// Global keyTap and screenTap arrays
var screenTaps = [];
var SCREENTAP_LIFETIME = 1;
var SCREENTAP_START_SIZE = 30;

// Setting up Canvas

var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');

// Making sure we have the proper aspect ratio for our canvas
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Setup variables
var width = canvas.width;
var height = canvas.height;
var frame, lastFrame;
var numberFingers;

// LeapToScene
function leapToScene(leapPos) {
    var iBox = frame.interactionBox;

    // Left coordinate = Center X - Interaction Box Size / 2
    // Top coordinate = Center Y + Interaction Box Size / 2
    var left = iBox.center[0] - iBox.size[0] / 2;
    var top = iBox.center[1] + iBox.size[1] / 2;

    // X Poisition = Current
    var x = leapPos[0] - left;
    var y = leapPos[1] - top;

    x /= iBox.size[0];
    y /= iBox.size[1];

    x *= width;
    y *= height;

    return [x, -y];
}

function onCircle(gesture) {

    /*
      
        Setting up our parameters
      
      */

    // First get the position using our leapToScene function
    var pos = leapToScene(gesture.center);

    // Assigning the radius
    var radius = gesture.radius;

    var clockwise = false;

    if (gesture.normal[2] <= 0) {

        clockwise = true;

    }

    /*
      
        Setting up our drawing style

      */

    // Setting up the style for the stroke, and fill
    c.fillStyle = "#39AECF";
    c.strokeStyle = "#39AECF";
    c.lineWidth = 5;


    // Creating the path for the finger circle
    c.beginPath();

    // Draw a full circle of radius 6 at the finger position
    c.arc(pos[0], pos[1], radius, 0, Math.PI * 2);

    c.closePath();

    if (clockwise)
        c.stroke();
    else
        c.fill();

}


function onSwipe(gesture) {

    var startPos = leapToScene(gesture.startPosition);
    var pos = leapToScene(gesture.position);

    // Rotate object on swipe if only one finger is detected
    if (numberFingers == 1) {
        dae.rotation.y += (pos[0] - startPos[0]) / 6000;
    }

    // Old Code
    // camera.position.x += (pos[0] - startPos[0])/1500;
    // camera.position.y -= (pos[1] - startPos[1])/1500;

    // Setting up the style for the stroke
    c.strokeStyle = "#FFA040";
    c.lineWidth = 3;

    // Drawing the path
    c.beginPath();

    // Move to the start position
    c.moveTo(startPos[0], startPos[1]);

    // Draw a line to current position
    c.lineTo(pos[0], pos[1]);

    c.closePath();
    c.stroke();


}


function onKeyTap(gesture) {

    var pos = leapToScene(gesture.position);

    var time = frame.timestamp;

    keyTaps.push([pos[0], pos[1], time]);

}

function updateKeyTaps() {

    for (var i = 0; i < keyTaps.length; i++) {

        var keyTap = keyTaps[i];
        var age = frame.timestamp - keyTaps[i][2];
        age /= 1000000;

        if (age >= KEYTAP_LIFETIME) {
            keyTaps.splice(i, 1);
        }

    }

}


function drawKeyTaps() {

    for (var i = 0; i < keyTaps.length; i++) {

        var keyTap = keyTaps[i];

        var x = keyTap[0];
        var y = keyTap[1];

        var age = frame.timestamp - keyTap[2];
        age /= 1000000;

        var completion = age / KEYTAP_LIFETIME;
        var timeLeft = 1 - completion;


        /*
        
          Static Ring

        */
        c.strokeStyle = "#FF2300";
        c.lineWidth = 3;

        c.beginPath();
        c.arc(x, y, KEYTAP_START_SIZE, 0, Math.PI * 2);
        c.closePath();
        c.stroke();



        var opacity = timeLeft;
        var radius = KEYTAP_START_SIZE * timeLeft;
        //console.log( opacity );

        c.fillStyle = "rgba( 256 , 33 , 0 , " + opacity + ")";

        // Creating the path for the finger circle
        c.beginPath();
        console.log(x + " " + y);
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.closePath();
        c.fill();
    }
}

function onScreenTap(gesture) {

    var pos = leapToScene(gesture.position);

    var time = frame.timestamp;

    screenTaps.push([pos[0], pos[1], time]);

}

function updateScreenTaps() {

    for (var i = 0; i < screenTaps.length; i++) {

        var screenTap = screenTaps[i];
        var age = frame.timestamp - screenTaps[i][2];
        age /= 1000000;

        if (age >= SCREENTAP_LIFETIME) {
            screenTaps.splice(i, 1);
        }

    }

}

function drawScreenTaps() {

    for (var i = 0; i < screenTaps.length; i++) {

        var screenTap = screenTaps[i];

        var x = screenTap[0];
        var y = screenTap[1];

        var age = frame.timestamp - screenTap[2];
        age /= 1000000;

        var completion = age / SCREENTAP_LIFETIME;
        var timeLeft = 1 - completion;

        /*
        
        Drawing the static ring

        */
        c.strokeStyle = "#FFB300";
        c.lineWidth = 3;

        // Save the canvas context, so that we can restore it
        // and have it un affected
        c.save();

        // Translate the contex and rotate around the
        // center of the  square
        c.translate(x, y);

        //Starting x and y ( compared to the pivot point )
        var left = -SCREENTAP_START_SIZE / 2;
        var top = -SCREENTAP_START_SIZE / 2;
        var width = SCREENTAP_START_SIZE;
        var height = SCREENTAP_START_SIZE;

        // Draw the rectangle
        c.strokeRect(left, top, width, height);

        // Restore the context, so we don't draw everything rotated
        c.restore();


        // Drawing the non-static part

        var size = SCREENTAP_START_SIZE * timeLeft;
        var opacity = timeLeft;
        var rotation = timeLeft * Math.PI;

        c.fillStyle = "rgba( 255 , 179 , 0 , " + opacity + ")";

        c.save();

        c.translate(x, y);
        c.rotate(rotation);

        var left = -size / 2;
        var top = -size / 2;
        var width = size;
        var height = size;

        c.fillRect(left, top, width, height);

        c.restore();


    }

}

// Setting up the Leap Controller
var controller = new Leap.Controller({
    enableGestures: true
});

// Frame event
controller.on('frame', function (data) {
    lastFrame = frame;
    frame = data;
    numberFingers = frame.fingers.length;

    // Clears the window
    c.clearRect(0, 0, width, height);
    // Loops through each hand
    for (var i = 0; i < frame.hands.length; i++) {

        // Setting up the hand
        var hand = frame.hands[i]; // The current hand
        var handPos = leapToScene(hand.palmPosition); // Palm position
        var scaleFactor = hand.scaleFactor(lastFrame, frame);

        // ZOOM GESTURE - Pinch Motion
        if (numberFingers == 2 & scaleFactor < 1) { // Zoom out
            camera.position.z += (1 - scaleFactor) * 2;
            //camera.position.x += (1 - scaleFactor) * 2;
        } else if (numberFingers == 2 & scaleFactor > 1) { // Zoom in
            camera.position.z -= (scaleFactor - 1) * 2;
            //camera.position.x -= (scaleFactor - 1) * 2;
        }
        // Loops through each finger

        for (var j = 0; j < hand.fingers.length; j++) {
            var finger = hand.fingers[j]; // Current finger
            var fingerPos = leapToScene(finger.tipPosition); // Finger position

            /*            // 1. Connect finger to hand
            c.strokeStyle = "#FFA040";
            c.lineWidth = 3;
            c.beginPath();
              c.moveTo(handPos[0], handPos[1]);
              c.lineTo(fingerPos[0], fingerPos[1]);
            c.closePath();
            c.stroke();
*/
            // 2. Drawing the finger
            c.strokeStyle = "#FF5A40";
            c.lineWidth = 6;
            c.beginPath();
            c.arc(fingerPos[0], fingerPos[1], 6, 0, Math.PI * 2);
            c.closePath();
            c.stroke();

        }

        /*          // 3. Drawing the palm
          c.fillStyle = "#FF5A40";
          c.beginPath();
            c.arc(handPos[0], handPos[1], 10, 0, Math.PI*2);
          c.closePath();
          c.fill();
*/
    }

    /* Gestures */
    for (var k = 0; k < frame.gestures.length; k++) {

        var gesture = frame.gestures[k];

        var type = gesture.type;

        switch (type) {

        case "circle":
            onCircle(gesture);
            break;

        case "swipe":
            onSwipe(gesture);
            break;

        case "screenTap":
            onScreenTap(gesture);
            break;


        }

    }

    updateKeyTaps();
    drawKeyTaps();

    updateScreenTaps();
    drawScreenTaps();


});

controller.connect();