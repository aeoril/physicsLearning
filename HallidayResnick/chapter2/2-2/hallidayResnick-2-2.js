// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// hallidayResnick-2-2.js - 1 dimensional position and displacement interactive lesson

(function () {
    'use strict';

    var SIG_DIGITS = 8,
        MARGIN = 80,
        SCALAR = 20,
        MINOR_STEP = 1,
        MAJOR_STEP = 5,
        TICK_LENGTH = 5,
        MARKER_LENGTH = 40,
        X1_MARKER_TEXT_OFFSET = 25,
        X2_MARKER_TEXT_OFFSET = 40,
        DISPLACEMENT_OFFSET = -30,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        BLACK_COLOR = 'rgb(0, 0, 0)',
        X1_COLOR = 'rgb(128, 0, 0)',
        X2_COLOR = 'rgb(0, 0, 128)',
        DISPLACEMENT_COLOR = 'rgb(128, 0, 128)',
        MAGNITUDE_COLOR = 'rgb(0, 128, 0)',
        BACKGROUND_STOP_1_COLOR = 'rgba(255, 0, 255, .2)',
        BACKGROUND_STOP_2_COLOR = 'rgba(0, 0, 255, .2)',
        canvasElem,
        checkAnswersElem,
        x1Elem,
        x1LabelElem,
        x2Elem,
        x2LabelElem,
        displacementElem,
        displacementLabelElem,
        magnitudeElem,
        magnitudeLabelElem,
        ctx,
        width,
        height,
        linePos,
        max,
        min,
        x1 = NaN,
        x2 = NaN,
        inputDisplacement = NaN,
        inputMagnitude = NaN,
        actualDisplacement = NaN,
        actualMagnitude = NaN;

    function draw() {
        var lg = ctx.createLinearGradient(0, 0, width, 0),
            i,
            x1CanvasPosition = (x1 - min) * SCALAR + MARGIN,
            x2CanvasPosition = (x2 - min) * SCALAR + MARGIN,
            x1x2CanvasMiddle;

        if (x1CanvasPosition <= x2CanvasPosition) {
            x1x2CanvasMiddle = (x2CanvasPosition - x1CanvasPosition) / 2 + x1CanvasPosition
        } else {
            x1x2CanvasMiddle = (x1CanvasPosition - x2CanvasPosition) / 2 + x2CanvasPosition;
        }
        function drawMarker(x, xCanvasPosition, name, color, offset) {
            ctx.beginPath();
            ctx.moveTo(xCanvasPosition, linePos);
            ctx.lineTo(xCanvasPosition, linePos - MARKER_LENGTH);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fillText(name + ' = ' + x,  (x - min) * SCALAR + MARGIN - ctx.measureText(name + ' = ' + x).width / 2, linePos + offset);
        }
        lg.addColorStop(0, BACKGROUND_STOP_1_COLOR);
        lg.addColorStop(1.0, BACKGROUND_STOP_2_COLOR);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(MARGIN, linePos);
        ctx.lineTo(width - MARGIN, linePos);
        ctx.strokeStyle = BLACK_COLOR;
        ctx.stroke();
        ctx.fillStyle = BLACK_COLOR;
        for (i = min; i <=  max; i += MINOR_STEP) {
            ctx.beginPath();
            ctx.moveTo((i - min) * SCALAR + MARGIN, linePos);
            ctx.lineTo((i - min) * SCALAR + MARGIN, linePos - TICK_LENGTH);
            ctx.stroke();
            if (!(i % MAJOR_STEP)) {
                ctx.lineTo((i - min) * SCALAR + MARGIN, linePos - TICK_LENGTH * 2);
                ctx.stroke();
                ctx.fillText(i,  (i - min) * SCALAR + MARGIN - ctx.measureText(i).width / 2, linePos + 15);
            }
        }
        if (!isNaN(x1)) {
            drawMarker(x1, x1CanvasPosition, 'x1', X1_COLOR, X1_MARKER_TEXT_OFFSET);
        }
        if (!isNaN(x2)) {
            drawMarker(x2, x2CanvasPosition, 'x2', X2_COLOR, X2_MARKER_TEXT_OFFSET);
        }
        if (inputDisplacement === actualDisplacement) {
            ctx.beginPath();
            ctx.moveTo(x1CanvasPosition, linePos + DISPLACEMENT_OFFSET);
            ctx.lineTo(x2CanvasPosition, linePos + DISPLACEMENT_OFFSET);
            if (inputDisplacement >= 0) {
                ctx.lineTo(x2CanvasPosition - ARROWHEAD_LENGTH, linePos + DISPLACEMENT_OFFSET + ARROWHEAD_WIDTH / 2);
                ctx.lineTo(x2CanvasPosition - ARROWHEAD_LENGTH, linePos + DISPLACEMENT_OFFSET - ARROWHEAD_WIDTH / 2);
                ctx.lineTo(x2CanvasPosition, linePos + DISPLACEMENT_OFFSET);
            } else {
                ctx.lineTo(x2CanvasPosition + ARROWHEAD_LENGTH, linePos + DISPLACEMENT_OFFSET + ARROWHEAD_WIDTH / 2);
                ctx.lineTo(x2CanvasPosition + ARROWHEAD_LENGTH, linePos + DISPLACEMENT_OFFSET - ARROWHEAD_WIDTH / 2);
                ctx.lineTo(x2CanvasPosition, linePos + DISPLACEMENT_OFFSET);
            }
            ctx.fillStyle = DISPLACEMENT_COLOR;
            ctx.strokeStyle = DISPLACEMENT_COLOR;
            ctx.stroke();
            ctx.fill();
//            ctx.beginPath();
//            ctx.moveTo(x1x2CanvasMiddle, linePos + DISPLACEMENT_OFFSET);
//            ctx.lineTo(x1x2CanvasMiddle, linePos + DISPLACEMENT_OFFSET + TICK_LENGTH);
//            ctx.stroke();
            ctx.fillText('Displacement = ' + actualDisplacement,  x1x2CanvasMiddle - ctx.measureText('Displacement = ' + actualDisplacement).width / 2, linePos + DISPLACEMENT_OFFSET + 15);
        }
        if (inputMagnitude === actualMagnitude) {
            ctx.beginPath();
            ctx.moveTo(x1CanvasPosition, linePos - MARKER_LENGTH);
            ctx.lineTo(x2CanvasPosition, linePos - MARKER_LENGTH);
            ctx.strokeStyle = MAGNITUDE_COLOR;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x1x2CanvasMiddle, linePos - MARKER_LENGTH);
            ctx.lineTo(x1x2CanvasMiddle, linePos - MARKER_LENGTH - TICK_LENGTH);
            ctx.strokeStyle = MAGNITUDE_COLOR;
            ctx.stroke();
            ctx.fillStyle = MAGNITUDE_COLOR;
            ctx.fillText('Magnitude = ' + actualMagnitude,  x1x2CanvasMiddle - ctx.measureText('Magnitude = ' + actualMagnitude).width / 2, linePos - MARKER_LENGTH - 15);
        }
    }
    function checkAnswers() {
        function processInput(inputElem, name, min, max) {
            var result;

            // Create a numbers from text, fix at 8 significant digits then
            // create numbers from text again to shave off trailing zeroes
            // and have numbers to work with not text
            result = parseFloat(parseFloat(inputElem.value).toFixed(SIG_DIGITS));

            if (isNaN(result)) {
                alert('Invalid Input: ' + name);
                return NaN;
            }
            if (result > max) {
                alert(name + ' must be less than or equal to ' + max);
                return NaN;
            }
            if (result < min) {
                alert(name + ' must be greater than or equal to ' + min);
                return NaN;
            }
            inputElem.value = result.toString();
            return result;
        }
        x1 = processInput(x1Elem, x1LabelElem.innerText, min, max);
        x2 = processInput(x2Elem, x2LabelElem.innerText, min, max);
        inputDisplacement = processInput(displacementElem, displacementLabelElem.innerText, -Infinity, Infinity);
        inputMagnitude = processInput(magnitudeElem, magnitudeLabelElem.innerText, -Infinity, Infinity);

        // Fix at 8 significant digits then create number again to
        // shave off trailing zeroes and have number to work with
        actualDisplacement = parseFloat((x2 - x1).toFixed(SIG_DIGITS));
        actualMagnitude = Math.abs(actualDisplacement);

        if (inputDisplacement === actualDisplacement) {
            displacementElem.className = 'right';
        } else {
            displacementElem.className = 'wrong';
        }
        if (inputMagnitude === actualMagnitude) {
            magnitudeElem.className = 'right';
        } else {
            magnitudeElem.className = 'wrong';
        }
        draw();
    }
    window.addEventListener('load', function() {
        canvasElem = document.getElementById('canvas');
        ctx = canvasElem.getContext('2d');
        checkAnswersElem = document.getElementById('checkAnswers');
        x1Elem = document.getElementById('x1');
        x1LabelElem = document.getElementById('x1Label');
        x2Elem = document.getElementById('x2');
        x2LabelElem = document.getElementById('x2Label');
        displacementElem = document.getElementById('displacement');
        displacementLabelElem = document.getElementById('displacementLabel');
        magnitudeElem = document.getElementById('magnitude');
        magnitudeLabelElem = document.getElementById('magnitudeLabel');
        width = canvasElem.width;
        height = canvasElem.height;
        linePos = height / 2;
        max = (width / 2 - MARGIN) / SCALAR;
        min = -max;

        checkAnswersElem.addEventListener('click', checkAnswers, false);

        draw();
    }, false);
})();