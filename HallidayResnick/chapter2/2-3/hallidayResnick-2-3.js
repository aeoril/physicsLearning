// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// hallidayResnick-2-3.js - 1 motion: displacement and time interactive lesson

(function () {
    'use strict';

    var TICK_LENGTH = 5,
        BLACK_COLOR = 'rgb(0, 0, 0)',
        AXIS_LABEL_T = 't',
        AXIS_LABEL_X = 'x',
        AXIS_MIN_COORDINATE_T = -20,
        AXIS_MAX_COORDINATE_T = 20,
        AXIS_MIN_COORDINATE_X = -10,
        AXIS_MAX_COORDINATE_X = 10,
        AXIS_COORDINATE_STEP = 2,
        COORDINATE_OFFSET_X = 5,
        NUM_TICKS_T = (AXIS_MAX_COORDINATE_T - AXIS_MIN_COORDINATE_T) / AXIS_COORDINATE_STEP,
        NUM_TICKS_X = (AXIS_MAX_COORDINATE_X - AXIS_MIN_COORDINATE_X) / AXIS_COORDINATE_STEP,
        AXIS_COORDINATES_FONT = 'normal 8pt TimesNewRoman',
        AXIS_LABEL_FONT = 'normal 12pt TimesNewRoman',
        axisLengthT = splineCanvasElem.width - AXIS_MARGINS * 2,
        axisLengthX = splineCanvasElem.height - AXIS_MARGINS * 2,
        tickDistanceT = axisLengthT / NUM_TICKS_T,
        COORDINATE_TEXT_OFFSET_Y = 15,
        COORDINATE_TEXT_OFFSET_Y_H = 4,
        CLOSEST_T = 220,
        AXIS_CLOSEST_T = 20,
        AXIS_CLOSEST_X = 80,
        BUNNY_IMG_WIDTH = 48,
        BUNNY_IMG_HEIGHT = 48,
        BUNNY_IMG_OFFSET_TOP = 5,
        stepT,
        stepX,
        bunnyStep,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        DRAW_CONTROL_POINTS = false,
        CLOSED = false,
        SEGMENT_COLORS = ['rgb(255, 0, 0', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)', 'rbb(255, 255, 0)'],
        KNOT_POINT_FILL_COLOR = 'rgb(255, 255, 0)',
        knots = [],
        mouseIsDown = false,
        mousePoint = 0,
        mousePos = {},
        splineCanvasElem,
        bunnyCanvasElem,
        bunnyImg = new Image(),
        formElem,
        t1Elem,
        x1Elem,
        t2Elem,
        x2Elem,
        t3Elem,
        x3Elem,
        t4Elem,
        x4Elem,
        tensionElem,
        animateElem,
        tension,
        splineCtx,
        bunnyCtx,
        width,
        height,
        splineAxisCoordsScalarT,
        splineAxisCoordsScalarX,
        splineAxisCoordsScalarRatio,
        bunnyAxisCoordsScalar,
        bunnyWidth,
        bunnyHeight,
        x1 = NaN,
        x2 = NaN,
        avgVels = [],
        delT,
        delTTotal,
        bunnyXTotal,
        currentVelIndex,
        requestID;

    function calcDistance(point1, point2) {
        var delta = {t: point2.t - point1.t, x: point2.x - point1.x};
        return Math.sqrt(delta.t * delta.t + delta.x * delta.x);
    }
// *******************************************************************************************
// Start Rob Spencer Code from http://scaledinnovation.com/analytics/splines/aboutSplines.html
// This code is copyrighted with all rights reserved - see his site for details.  Thanks, Rob!
// Heavily refactored by QuarksCode
// *******************************************************************************************
    function drawPoint(ctx, knot, r, strokeColor, fillColor){
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle=fillColor;
        ctx.arc(knot.t, knot.x, r, 0.0, 2*Math.PI, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    function calcControlPoints(prevKnot, currentKnot, nextKnot, tension){
        var distancePC = calcDistance(prevKnot, currentKnot),
            distanceCN = calcDistance(currentKnot, nextKnot),
            fractionPC = tension * distancePC / (distancePC + distanceCN),
            fractionCN = tension - fractionPC,
            controlPointPrev2 = {t: currentKnot.t + fractionPC * (prevKnot.t - nextKnot.t),
                x: currentKnot.x + fractionPC * (prevKnot.x - nextKnot.x)},
            controlPointCurr1 = {t: currentKnot.t - fractionCN * (prevKnot.t - nextKnot.t),
                x: currentKnot.x - fractionCN * (prevKnot.x - nextKnot.x)};

        return {prev2: controlPointPrev2, curr1: controlPointCurr1};
    }
    function drawControlLine(ctx, knot, controlPoint, color){
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.moveTo(knot.t, knot.x);
        ctx.lineTo(controlPoint.t, controlPoint.x);
        ctx.closePath();
        ctx.stroke();
        drawPoint(ctx, controlPoint, 1.5, ctx.strokeStyle, ctx.strokeStyle);
        ctx.restore();
    }
    function drawInnerSegment(ctx, knot1, knot2, knotPrev, drawControlPoints) {
        ctx.strokeStyle = knot1.color;
        ctx.beginPath();
        ctx.moveTo(knot1.t, knot1.x);
        ctx.bezierCurveTo(knot1.cp1.t, knot1.cp1.x, knot1.cp2.t, knot1.cp2.x,
            knot2.t, knot2.x);
        ctx.stroke();
        ctx.closePath();
        if(drawControlPoints){
            drawControlLine(ctx, knot1, knot1.cp1, BLACK_COLOR);
            drawControlLine(ctx, knot1, knotPrev.cp2, BLACK_COLOR);
        }
    }
    function drawEndSegment(ctx, endKnot, innerKnot, cp, cpKnot, prevKnot, color, drawControlPoints) {
        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.moveTo(endKnot.t, endKnot.x);
        ctx.quadraticCurveTo(cp.t, cp.x, innerKnot.t, innerKnot.x);
        ctx.stroke();
        ctx.closePath();
        if(drawControlPoints){
            drawControlLine(ctx, cpKnot, cpKnot.cp1, BLACK_COLOR);
            drawControlLine(ctx, cpKnot, prevKnot.cp2, BLACK_COLOR);
        }
    }
    function drawSpline(ctx, knots, closed, drawControlPoints){
        var lastIndex = knots.length - 1;

        ctx.save();
        ctx.lineWidth=4;
        knots.forEach(function (knot, index, array) {
            var prevKnot = index === 0 ? array[array.length - 1] : array[index - 1],
                nextKnot = array[(index + 1) % array.length],
                controlPoints = calcControlPoints(prevKnot, knot, nextKnot, tension);
            prevKnot.cp2 = controlPoints.prev2;
            knot.cp1 = controlPoints.curr1;
        });
        knots.forEach(function (knot, index, array) {
            var prevKnot = index === 0 ? array[array.length - 1] : array[index - 1],
                nextKnot = array[(index + 1) % array.length];
            if (!closed && (index === 0 || index >= array.length - 2)) {
                return;
            }
            drawInnerSegment(ctx, knot, nextKnot, prevKnot, drawControlPoints);
        });
        if (!closed) {
            drawEndSegment(ctx, knots[0], knots[1], knots[0].cp2, knots[0], knots[lastIndex], knots[0].color, drawControlPoints);
            drawEndSegment(ctx, knots[lastIndex], knots[lastIndex - 1],
                knots[lastIndex - 1].cp1, knots[lastIndex - 1],  knots[lastIndex - 2], knots[lastIndex - 1].color, drawControlPoints);
        }
        if(drawControlPoints){
            drawControlLine(ctx, knots[lastIndex], knots[lastIndex].cp1, BLACK_COLOR);
            drawControlLine(ctx, knots[lastIndex], knots[lastIndex - 1].cp2, BLACK_COLOR);
        }
        knots.forEach(function(knot) {
            drawPoint(ctx, knot, 2.5, BLACK_COLOR, KNOT_POINT_FILL_COLOR);
        });
        ctx.restore();
    }

// *******************************************************************************************
// End Rob Spencer Code from http://scaledinnovation.com/analytics/splines/aboutSplines.html
// Heavily refactored by QuarksCode
// *******************************************************************************************

    function drawArrow(ctx, p1, p2, text) {
        var length = calcDistance(p1, p2),
            angle = Math.atan2(p2.x - p1.x, p2.t - p1.t),
            end = {t: length, x: 0};
        ctx.save();
        ctx.font = NAME_FONT;
        ctx.strokeStyle = BLACK_COLOR;
        ctx.fillStyle = BLACK_COLOR;
        ctx.lineWidth = 1;
        ctx.translate(p1.t, p1.x);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(end.t, end.x);
        ctx.lineTo(end.t - ARROWHEAD_LENGTH, end.x + ARROWHEAD_WIDTH / 2);
        ctx.lineTo(end.t - ARROWHEAD_LENGTH, end.x - ARROWHEAD_WIDTH / 2);
        ctx.lineTo(end.t, end.x);
        ctx.stroke();
        ctx.fill();
        ctx.fillText(text, end.t / 2 - ctx.measureText(text).width / 2, end.x - MARKER_TEXT_OFFSET_X);
        ctx.restore();
    }
    function drawBunny(ctx, x) {
        ctx.drawImage(bunnyImg, x + BUNNY_AXIS_OFFSET_LEFT - BUNNY_IMG_WIDTH / 2, BUNNY_IMG_OFFSET_TOP, BUNNY_IMG_WIDTH, BUNNY_IMG_HEIGHT);
    }
    function drawHorizontalAxis(ctx, start, numTicks, tickDistance, axisColor,
                                axisOffset, minCoordinate, coordinateOffset, step,
                                coordinateFont, coordinateColor, label, labelOffset, labelFont, labelColor) {
        var startPos = {},
            endPos = {},
            coordinate,
            i;

        function drawTick(ctx, startPos, endPos, coordinate, offset, font, color) {
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(posStart.t, posStart.x);
            ctx.lineTo(posEnd.t, posEnd.x);
            ctx.stroke();
            ctx.font = font;
            ctx.fillText(text, startPos.t - ctx.measureText(text).width / 2, startPos.x + offset);
            ctx.restore();
        }
        ctx.save();
        ctx.strokeStyle = axisColor;
        ctx.beginPath();
        ctx.moveTo(start, offset);
        ctx.lineTo(end, offset);
        ctx.stroke();
        ctx.restore();
        for (i = 0; i <= numTicks; i++) {
            startPos.t = start + i * tickDistance;
            startPos.x = axisOffset;
            endPos.t = tickStartPos.t + TICK_LENGTH;
            endPos.x = axisOffset;
            coordinate = minCoordinate + step * i;
            drawTick(ctx, tickStartPos, tickEndPos, coordinate, coordinateOffset, coordinateFont, coordinateColor);
        }
        startPos.t = start + (numTicks * tickDistance - ctx.measureText(label).width) / 2;
        startPos.x = offset + labelOffset;
        ctx.save();
        ctx.fillStyle = labelColor;
        ctx.font = labelFont;
        ctx.fillText(label, startPos.t, startPos.x);
        ctx.restore();
    }
    function draw(ctx) {
        ctx.clearRect(0, 0, splineCanvasElem.width, splineCanvasElem.height);
        drawHorizontalAxis(ctx, start, NUM_TICKS_T, tickDistanceT, BLACK_COLOR,
            AXIS_MIN_COORDINATE_T, COORDINATE_OFFSET_X, AXIS_COORDINATE_STEP,
            AXIS_COORDINATES_FONT, BLACK_COLOR, AXIS_LABEL_T, , AXIS_LABEL_FONT, BLACK_COLOR);
        //drawAxis(ctx, AXIS_OFFSET_BOTTOM, AXIS_OFFSET_TOP, AXIS_OFFSET_LEFT, 'x', stepX, false, SCALAR);
        drawSpline(ctx, knots, CLOSED, DRAW_CONTROL_POINTS);
        drawArrow(ctx, knots[0], knots[1], 'Avg Vel  ' + avgVels[0].toFixed(3));
        drawArrow(ctx, knots[1], knots[2], 'Avg Vel  ' + avgVels[1].toFixed(3));
        drawArrow(ctx, knots[2], knots[3], 'Avg Vel  ' + avgVels[2].toFixed(3));
    }
    function drawBunnyAll(ctx) {
        ctx.clearRect(0, 0, splineCanvasElem.width, splineCanvasElem.height);
        drawBunny(ctx, (AXIS_OFFSET_BOTTOM - knots[0].x) * bunnyXScalar);
        drawAxis(ctx, BUNNY_AXIS_OFFSET_LEFT, BUNNY_AXIS_OFFSET_RIGHT, BUNNY_AXIS_OFFSET_BOTTOM, 'x', bunnyStep, true, BUNNY_SCALAR);
    }
    function calcMousePos(e) {
        var top = 0,
            left = 0,
            obj = splineCanvasElem;

        // get canvas position
        while (obj.tagName != 'BODY') {

            top += obj.offsetTop;
            left += obj.offsetLeft;

            obj = obj.offsetParent;
        }

        // return relative mouse position
        mousePos.t = e.clientX - left + window.pageXOffset;
        mousePos.x = e.clientY - top + window.pageYOffset;
    }
    function calcClosestPoint() {
        var i;

        mousePoint = 0;

        for (i = 0; i < knots.length - 1; i++) {
           if (calcDistance(knots[i], mousePos) >
               calcDistance(knots[i + 1], mousePos)) {
               mousePoint = i + 1;
           }
        }
    }
    function updateTextBoxes() {
        function calcTDisplayVal(t) {
            return ((t - AXIS_OFFSET) * splineAxisCoordsScalarT).toFixed(4);
        }
        function calcXDisplayVal(x) {
            return ((height - (x + AXIS_OFFSET))  * splineAxisCoordsScalarX).toFixed(4);
        }
        t1Elem.value = calcTDisplayVal(knots[0].t);
        x1Elem.value = calcXDisplayVal(knots[0].x);
        t2Elem.value = calcTDisplayVal(knots[1].t);
        x2Elem.value = calcXDisplayVal(knots[1].x);
        t3Elem.value = calcTDisplayVal(knots[2].t);
        x3Elem.value = calcXDisplayVal(knots[2].x);
        t4Elem.value = calcTDisplayVal(knots[3].t);
        x4Elem.value = calcXDisplayVal(knots[3].x);
    }
    function updateAvgVels() {
        function calcVel(p1, p2) {
            return (p2.x - p1.x) / (p2.t - p1.t);
        }
        avgVels[0] = calcVel({t: Number(t1Elem.value), x: Number(x1Elem.value)},
            {t: Number(t2Elem.value), x: Number(x2Elem.value)});
        avgVels[1] = calcVel({t: Number(t2Elem.value), x: Number(x2Elem.value)},
            {t: Number(t3Elem.value), x: Number(x3Elem.value)});
        avgVels[2] = calcVel({t: Number(t3Elem.value), x: Number(x3Elem.value)},
            {t: Number(t4Elem.value), x: Number(x4Elem.value)});
    }
    function mouseMove(e) {

        var posText,
            posTextWidth,
            posTextHeight = 7,
            posTextT,
            posTextX;

        calcMousePos(e);

        if (mousePos.t > width) {
            mousePos.t = width;
        }
        if (mousePos.x > height) {
            mousePos.x = height;
        }
        if (mouseIsDown) {
            if (mousePoint !== 0 &&
                ((mousePoint === knots.length - 1 &&
                  (mousePos.t >= knots[mousePoint - 1].t + CLOSEST_T && mousePos.t <= AXIS_OFFSET_RIGHT)) ||
                 (mousePoint < knots.length - 1 &&
                  (mousePos.t >= knots[mousePoint - 1].t + CLOSEST_T && mousePos.t < knots[mousePoint + 1].t - CLOSEST_T) &&
                  (mousePos.t >= AXIS_OFFSET_LEFT + AXIS_CLOSEST_T && mousePos.t <= AXIS_OFFSET_RIGHT - AXIS_CLOSEST_T)))) {
                knots[mousePoint].t = mousePos.t;
            }
            if (((mousePoint === 0 || mousePoint === knots.length - 1) &&
                 mousePos.x <= AXIS_OFFSET_BOTTOM && mousePos.x >= AXIS_OFFSET_TOP) ||
                (mousePos.x <= AXIS_OFFSET_BOTTOM - AXIS_CLOSEST_X && mousePos.x >= AXIS_OFFSET_TOP + AXIS_CLOSEST_X)) {
                knots[mousePoint].x = mousePos.x;
            }
        }
        updateTextBoxes();
        updateAvgVels();
        draw(splineCtx);
        if (mousePoint === 0 && mouseIsDown) {
            drawBunnyAll(bunnyCtx);
        }
        posText = '{' + mousePos.t + ',' + mousePos.x + ')';
        posTextWidth = splineCtx.measureText(posText).width;
        posTextT = mousePos.t;
        posTextX = mousePos.x;
        if (mousePos.t + posTextWidth > width) {
            posTextT = mousePos.t - (posTextWidth - (width - mousePos.t));
        }

        if (mousePos.x - posTextHeight < 0) {
            posTextX = mousePos.x + (posTextHeight - mousePos.x);
        }
        splineCtx.fillText(posText,  posTextT, posTextX);
    }
    function mouseDown(e) {
        calcMousePos(e);
        calcClosestPoint();
        mouseIsDown = true;
        mouseMove(e);
    }
    function mouseUp() {
        mouseIsDown = false;
    }
    function submit(e) {
        function calcTPoint(tElem) {
            return Number(tElem.value) / splineAxisCoordsScalarT + AXIS_OFFSET;
        }
        function calcXPoint(xElem) {
            return height - (Number(xElem.value) / splineAxisCoordsScalarX + AXIS_OFFSET);
        }
        knots = [];
        knots.push({t: calcTPoint(t1Elem), x: calcXPoint(x1Elem), color: SEGMENT_COLORS[0]});
        knots.push({t: calcTPoint(t2Elem), x: calcXPoint(x2Elem), color: SEGMENT_COLORS[1]});
        knots.push({t: calcTPoint(t3Elem), x: calcXPoint(x3Elem), color: SEGMENT_COLORS[2]});
        knots.push({t: calcTPoint(t4Elem), x: calcXPoint(x4Elem), color: SEGMENT_COLORS[3]});
        tension = Number(tensionElem.value) / 100;
        updateAvgVels();
        updateTextBoxes();
        draw(splineCtx);
        drawBunnyAll(bunnyCtx);
        if (e) {
            e.preventDefault();
        }
    }
    function bunnyRun() {
        var bunnyX;

        bunnyX = avgVels[currentVelIndex] * delT * splineAxisCoordsScalarRatio + bunnyXTotal;
        bunnyCtx.clearRect(0, 0, bunnyWidth, bunnyHeight);
        drawAxis(bunnyCtx, BUNNY_AXIS_OFFSET_LEFT, BUNNY_AXIS_OFFSET_RIGHT, BUNNY_AXIS_OFFSET_BOTTOM, 'x', bunnyStep, true, BUNNY_SCALAR);
        drawBunny(bunnyCtx, bunnyX * bunnyXScalar);
        draw(splineCtx);
        drawPoint(splineCtx, {t: (delT + delTTotal) + AXIS_OFFSET_LEFT, x: AXIS_OFFSET_BOTTOM - bunnyX}, 5.0, "rgb(0, 0, 0)", "rgb(255, 0, 255)");
        delT++;
        if (delT + delTTotal > knots[(currentVelIndex + 1)].t - AXIS_OFFSET_LEFT) {
            bunnyXTotal += avgVels[currentVelIndex] * (delT - 1) * splineAxisCoordsScalarRatio;
            currentVelIndex++;
            delTTotal += delT - 1;
            delT = 1;
            if (currentVelIndex + 1 === knots.length) {
                //window.cancelAnimationFrame(requestID);
                return;
            }
        }
        window.requestAnimationFrame(bunnyRun);
    }
    function animate() {
        delT = 0;
        delTTotal = 0;
        bunnyXTotal = AXIS_OFFSET_BOTTOM - knots[0].x;
        currentVelIndex = 0;
        requestID = window.requestAnimationFrame(bunnyRun);
    }
    window.addEventListener('load', function() {
        splineCanvasElem = document.getElementById('splineCanvas');
        bunnyCanvasElem = document.getElementById('bunnyCanvas');
        formElem = document.getElementById('form');
        splineCtx = splineCanvasElem.getContext('2d');
        bunnyCtx = bunnyCanvasElem.getContext('2d');
        t1Elem = document.getElementById('t1');
        x1Elem = document.getElementById('x1');
        t2Elem = document.getElementById('t2');
        x2Elem = document.getElementById('x2');
        t3Elem = document.getElementById('t3');
        x3Elem = document.getElementById('x3');
        t4Elem = document.getElementById('t4');
        x4Elem = document.getElementById('x4');
        tensionElem = document.getElementById('tension');
        animateElem = document.getElementById('animate');
        width = splineCanvasElem.width;
        height = splineCanvasElem.height;
        bunnyWidth = bunnyCanvasElem.width;
        bunnyHeight = bunnyCanvasElem.height;
        AXIS_OFFSET_LEFT = AXIS_OFFSET;
        AXIS_OFFSET_RIGHT = width - AXIS_MARGIN;
        AXIS_OFFSET_TOP = AXIS_MARGIN;
        AXIS_OFFSET_BOTTOM = height - AXIS_OFFSET;
        BUNNY_AXIS_OFFSET_LEFT = BUNNY_AXIS_MARGIN;
        BUNNY_AXIS_OFFSET_RIGHT = bunnyWidth - BUNNY_AXIS_MARGIN;
        BUNNY_AXIS_OFFSET_BOTTOM = bunnyHeight - AXIS_OFFSET;
        splineAxisCoordsScalarT = (width / (AXIS_OFFSET_RIGHT - AXIS_OFFSET_LEFT)) / SCALAR;
        splineAxisCoordsScalarX = (height / (AXIS_OFFSET_BOTTOM - AXIS_OFFSET_TOP)) / SCALAR;
        splineAxisCoordsScalarRatio = splineAxisCoordsScalarT / splineAxisCoordsScalarX;
        bunnyAxisCoordsScalar = (bunnyWidth / (BUNNY_AXIS_OFFSET_RIGHT - BUNNY_AXIS_OFFSET_LEFT)) / BUNNY_SCALAR;
        bunnyXScalar = (BUNNY_AXIS_OFFSET_RIGHT - BUNNY_AXIS_OFFSET_LEFT) / (AXIS_OFFSET_BOTTOM - AXIS_OFFSET_TOP);
        stepT = 2 / splineAxisCoordsScalarT;
        stepX = 2 / splineAxisCoordsScalarX;
        bunnyStep = (BUNNY_AXIS_OFFSET_RIGHT - BUNNY_AXIS_OFFSET_LEFT) / 10;
//        x1Elem.addEventListener('change', submit, false);
//        y1Elem.addEventListener('change', submit, false);
//        x2Elem.addEventListener('change', submit, false);
//        y2Elem.addEventListener('change', submit, false);
//        x3Elem.addEventListener('change', submit, false);
//        y3Elem.addEventListener('change', submit, false);
//        x4Elem.addEventListener('change', submit, false);
//        y4Elem.addEventListener('change', submit, false);
//        tElem.addEventListener('change', submit, false);
        //formElem.addEventListener('submit', submit, false);
        animateElem.addEventListener('click', animate, false);
        //canvasElem.addEventListener('click', canvasMousePos, false);
        splineCanvasElem.addEventListener('mousemove', mouseMove, false);
        splineCanvasElem.addEventListener('mousedown', mouseDown, false);
        splineCanvasElem.addEventListener('mouseup', mouseUp, false);
        splineCanvasElem.addEventListener('mouseleave', mouseUp, false);
        bunnyImg.addEventListener('load', function () {
            submit();
        });
        bunnyImg.src = 'bunny.jpg';
        t1Elem.focus();
    }, false);
}());