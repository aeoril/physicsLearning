// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// hallidayResnick-2-2.js - 1 dimensional position and displacement interactive lesson

(function () {
    'use strict';

    var SIG_DIGITS = 8,
        MARGIN = 80,
        SCALAR = 20,
        FONT = 'normal 12pt TimesNewRoman',
        MINOR_STEP = 1,
        MAJOR_STEP = 5,
        TICK_LENGTH = 5,
        MARKER_LENGTH = 50,
        MARKER_TEXT_OFFSET = 20,
        X1_MARKER_TEXT_OFFSET = 40,
        X2_MARKER_TEXT_OFFSET = 55,
        DISPLACEMENT_OFFSET = -35,
        DISPLACEMENT_TEXT_OFFSET = DISPLACEMENT_OFFSET + 20,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        BLACK_COLOR = 'rgb(0, 0, 0)',
        X1_COLOR = 'rgb(240, 2, 101)',
        X2_COLOR = 'rgb(0, 0, 200)',
        DISPLACEMENT_COLOR = 'rgb(190, 0, 190)',
        MAGNITUDE_COLOR = 'rgb(0, 190, 0)',
        canvasElem,
        formElem,
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
        var i,
            x1CanvasPosition = (x1 - min) * SCALAR + MARGIN,
            x2CanvasPosition = (x2 - min) * SCALAR + MARGIN,
            x1x2CanvasMiddle;

        function drawMarker(x, xCanvasPosition, name, color, offset) {
            ctx.beginPath();
            ctx.moveTo(xCanvasPosition, linePos);
            ctx.lineTo(xCanvasPosition, linePos - MARKER_LENGTH);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.font = FONT;
            ctx.fillText(name + ' = ' + x,  (x - min) * SCALAR + MARGIN - ctx.measureText(name + ' = ' + x).width / 2, linePos + offset);
        }
        if (x1CanvasPosition <= x2CanvasPosition) {
            x1x2CanvasMiddle = (x2CanvasPosition - x1CanvasPosition) / 2 + x1CanvasPosition
        } else {
            x1x2CanvasMiddle = (x1CanvasPosition - x2CanvasPosition) / 2 + x2CanvasPosition;
        }
        ctx.clearRect(0, 0, width, height);
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
            ctx.font = FONT;
            if (!(i % MAJOR_STEP)) {
                ctx.lineTo((i - min) * SCALAR + MARGIN, linePos - TICK_LENGTH * 2);
                ctx.stroke();
                ctx.fillText(i,  (i - min) * SCALAR + MARGIN - ctx.measureText(i).width / 2, linePos + MARKER_TEXT_OFFSET);
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
            ctx.font = FONT;
            ctx.fillText('Displacement = ' + actualDisplacement,  x1x2CanvasMiddle - ctx.measureText('Displacement = ' + actualDisplacement).width / 2, linePos + DISPLACEMENT_TEXT_OFFSET);
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
    function checkAnswers(e) {
        function processInput(inputElem, name, min, max) {
            var result;

            // Create a numbers from text, fix at 8 significant digits then
            // create numbers from text again to shave off trailing zeroes
            // and have numbers to work with not text
            result = Number(parseFloat(inputElem.value).toFixed(SIG_DIGITS));

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
        actualDisplacement = Number((x2 - x1).toFixed(SIG_DIGITS));
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
        e.preventDefault();
    }
    window.addEventListener('load', function() {
        canvasElem = document.getElementById('canvas');
        formElem = document.getElementById('form');
        ctx = canvasElem.getContext('2d');
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
        formElem.addEventListener('submit', checkAnswers, false);
        draw();
        //x1Elem.focus();
    }, false);
}());