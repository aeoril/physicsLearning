// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// positionAndDisplacement.js - 1 dimensional position and displacement interactive lesson

window.addEventListener('load', function() {
    'use strict';

    var SIG_DIGITS = 8,
        MARGIN = 80,
        SCALAR = 10,
        STEP = 10,
        TICK_LENGTH = 5,
        MARKER_LENGTH = 40,
        X1_MARKER_TEXT_OFFSET = 25,
        X2_MARKER_TEXT_OFFSET = 40,
        x1,
        x2,
        canvasElem = document.getElementById('canvas'),
        ctx = canvasElem.getContext('2d'),
        width = canvasElem.width,
        height = canvasElem.height,
        linePos = height / 2,
        max = (width / 2 - MARGIN) / SCALAR,
        min = -max,
        checkAnswersElem = document.getElementById('checkAnswers'),
        x1Elem = document.getElementById('x1'),
        x1LabelElem = document.getElementById('x1Label'),
        x2Elem = document.getElementById('x2'),
        x2LabelElem = document.getElementById('x2Label'),
        displacementElem = document.getElementById('displacement'),
        displacementLabelElem = document.getElementById('displacementLabel'),
        magnitudeElem = document.getElementById('magnitude'),
        magnitudeLabelElem = document.getElementById('magnitudeLabel'),
        inputDisplacement,
        inputMagnitude,
        actualDisplacement,
        actualMagnitude;

    function draw() {
        var lg = ctx.createLinearGradient(0, 0, width, 0),
            i;

        function drawMarker(x, name, color, offset) {
            ctx.beginPath();
            ctx.moveTo((x - min) * SCALAR + MARGIN, linePos);
            ctx.lineTo((x - min) * SCALAR + MARGIN, linePos - MARKER_LENGTH);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.fillText(name + ' = ' + x,  (x - min) * SCALAR + MARGIN - ctx.measureText(name + ' = ' + x).width / 2, linePos + offset);
        }

        lg.addColorStop('0', 'rgba(255, 0, 255, .2)');
        lg.addColorStop('1.0', 'rgba(0, 0, 255, .2)');
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(MARGIN, linePos);
        ctx.lineTo(width - MARGIN, linePos);
        ctx.strokeStyle = 'rgb(0, 0, 0';
        ctx.stroke();
        ctx.fillStyle = 'rgb(0, 0, 0)';
        for (i = min; i <=  max; i += STEP) {
            ctx.beginPath();
            ctx.moveTo((i - min) * SCALAR + MARGIN, linePos);
            ctx.lineTo((i - min) * SCALAR + MARGIN, linePos - TICK_LENGTH);
            ctx.stroke();
            ctx.fillText(i,  (i - min) * SCALAR + MARGIN - ctx.measureText(i).width / 2, linePos + 15);
        }
        if (!isNaN(x1)) {
            drawMarker(x1, 'x1', 'rgb(255, 0, 0', X1_MARKER_TEXT_OFFSET);
        }
        if (!isNaN(x2)) {
            drawMarker(x2, 'x2', 'rgb(0, 0, 255', X2_MARKER_TEXT_OFFSET);
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
            displacementElem.classList.add('right');
            displacementElem.classList.remove('wrong');
        } else {
            displacementElem.classList.add('wrong');
            displacementElem.classList.remove('right');
        }
        if (inputMagnitude === actualMagnitude) {
            magnitudeElem.classList.add('right');
            magnitudeElem.classList.remove('wrong');
        } else {
            magnitudeElem.classList.add('wrong');
            magnitudeElem.classList.remove('right');
        }

        draw();
    }
    checkAnswersElem.addEventListener('click', checkAnswers, false);
    checkAnswers();
});