// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// hallidayResnick-2-3.js - 1 motion: displacement and time interactive lesson

(function () {
    'use strict';

    var COORDINATE_DISPLAY_DIGITS = 2,
        AVERAGE_VELOCITY_DISPLAY_DIGITS = 2,
        TICK_DISPLACEMENT = 5,
        LINE_WIDTH = 1,
        COLOR = 'rgb(100, 100, 100)',
        ARROW_LABEL_COLOR = 'rgb(117, 60, 171)',
        //CANVAS_BACKGROUND_COLOR = 'rgb(100, 100, 100)',
        SEGMENT_COLORS = ['rgb(128, 209, 99)', 'rgb(231, 109, 128)',
            'rgb(74, 158, 139)', 'rgb(245, 165, 115)'],
        KNOT_POINT_FILL_COLOR = 'rgb(199, 67, 88)',
        AXIS_COORDINATE_STEP = 2,
        AXIS_COORDINATES_FONT = 'normal 10pt "Droid Sans", sans-serif',
        AXIS_LABEL_FONT = 'normal 13pt "Droid Sans", sans-serif',
        AXIS_LABEL_OFFSET_T_T = 20,
        AXIS_LABEL_OFFSET_X_T = 40,
        AXIS_LABEL_OFFSET_T_X = 20,
        AXIS_LABEL_OFFSET_X_X = 50,
        COORDINATE_LABEL_OFFSET_T_T = 0,
        COORDINATE_LABEL_OFFSET_X_T = 20,
        COORDINATE_LABEL_OFFSET_T_X = 4,
        COORDINATE_LABEL_OFFSET_X_X = 10,
        SPLINE_AXIS_MARGINS = 30,
        SPLINE_AXIS_MIN_COORDINATE_T = -20,
        SPLINE_AXIS_MAX_COORDINATE_T = 20,
        SPLINE_AXIS_RANGE_T = SPLINE_AXIS_MAX_COORDINATE_T - SPLINE_AXIS_MIN_COORDINATE_T,
        //SPLINE_AXIS_NUM_COORDINATES_T = (SPLINE_AXIS_RANGE_T) / AXIS_COORDINATE_STEP,
        SPLINE_AXIS_MIN_COORDINATE_X = -10,
        SPLINE_AXIS_MAX_COORDINATE_X = 10,
        SPLINE_AXIS_RANGE_X = SPLINE_AXIS_MAX_COORDINATE_X - SPLINE_AXIS_MIN_COORDINATE_X,
        //SPLINE_AXIS_NUM_COORDINATES_X = (SPLINE_AXIS_RANGE_X) / AXIS_COORDINATE_STEP,
        SPLINE_AXIS_LABELS_T =
            [
                {
                    text: '-t',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {t: AXIS_LABEL_OFFSET_T_T, x: AXIS_LABEL_OFFSET_X_T},
                    angle: 0,
                    widthMultiplier: 0.5
                },
                {
                    text: '+t',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "end",
                    offset: {t: -AXIS_LABEL_OFFSET_T_T, x: AXIS_LABEL_OFFSET_X_T},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
        SPLINE_AXIS_LABELS_X =
            [
                {
                    text: '-x',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {t: AXIS_LABEL_OFFSET_T_X, x: -AXIS_LABEL_OFFSET_X_X},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                },
                {
                    text: '+x',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "end",
                    offset: {t: -AXIS_LABEL_OFFSET_T_X, x: -AXIS_LABEL_OFFSET_X_X},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                }
            ],
        COORDINATE_LABELS_T =
            [
                {
                    text: '',
                    font: AXIS_COORDINATES_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {t: COORDINATE_LABEL_OFFSET_T_T, x: COORDINATE_LABEL_OFFSET_X_T},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
        COORDINATE_LABELS_X =
            [
                {
                    text: '',
                    font: AXIS_COORDINATES_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {t: -COORDINATE_LABEL_OFFSET_T_X, x: -COORDINATE_LABEL_OFFSET_X_X},
                    angle: Math.PI / 2,
                    widthMultiplier: 1
                }
            ],
        splineCanvasWidth,
        splineCanvasHeight,
        splineAxisStartT,
        splineAxisEndT,
        splineAxisStartX,
        splineAxisEndX,
        splineAxisLengthT,
        splineAxisLengthX,
        splineAxisCoordinatesScalarT,
        splineAxisCoordinatesScalarX,
        //splineAxisCoordinatesRatio,
        CLOSEST_T = 220,
        AXIS_CLOSEST_T = 0,
        AXIS_CLOSEST_X = 0,
        //BUNNY_IMG_WIDTH = 48,
        //BUNNY_IMG_HEIGHT = 48,
        //BUNNY_IMG_MARGIN_TOP = 5,
        ARROW_LABEL_FONT = 'normal 10pt "Droid Sans", sans-serif',
        ARROW_LABEL_OFFSET_X = 10,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        DRAW_CONTROL_POINTS = false,
        CLOSED = true,
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
        //bunnyCtx,
        //axisCoordinatesRatio,
        //x1 = NaN,
        //x2 = NaN,
        averageVelocities = [];//,
        //delT,
        //delTTotal,
        //bunnyXTotal,
        //currentVelIndex,
        //requestID;

    function cloneObj(from) {
        var to = {},
            key;

        for (key in from) {
            if (from.hasOwnProperty(key)) {
                if (typeof from[key] === 'object') {
                    to[key] = cloneObj(from[key]);
                } else {
                    to[key] = from[key];
                }
            }
        }
        return to;
    }

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
            drawControlLine(ctx, knot1, knot1.cp1, COLOR);
            drawControlLine(ctx, knot1, knotPrev.cp2, COLOR);
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
            drawControlLine(ctx, cpKnot, cpKnot.cp1, COLOR);
            drawControlLine(ctx, cpKnot, prevKnot.cp2, COLOR);
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
            drawControlLine(ctx, knots[lastIndex], knots[lastIndex].cp1, COLOR);
            drawControlLine(ctx, knots[lastIndex], knots[lastIndex - 1].cp2, COLOR);
        }
        knots.forEach(function(knot) {
            drawPoint(ctx, knot, 2.5, COLOR, KNOT_POINT_FILL_COLOR);
        });
        ctx.restore();
    }

// *******************************************************************************************
// End Rob Spencer Code from http://scaledinnovation.com/analytics/splines/aboutSplines.html
// Heavily refactored by QuarksCode
// *******************************************************************************************

    function drawArrow(ctx, p1, p2, text, arrowColor, labelColor) {
        var length = calcDistance(p1, p2),
            angle = Math.atan2(p2.x - p1.x, p2.t - p1.t),
            end = {t: length, x: 0};
        ctx.save();
        ctx.font = ARROW_LABEL_FONT;
        ctx.strokeStyle = arrowColor;
        ctx.fillStyle = arrowColor;
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
        ctx.fillStyle = labelColor;
        ctx.fillText(text, end.t / 2 - ctx.measureText(text).width / 2, end.x - ARROW_LABEL_OFFSET_X);
        ctx.restore();
    }
    function drawAxis(ctx, start, end, width, color, axisLabels,
                      minCoordinate, maxCoordinate, step, tickWidth, tickLength, tickColor, coordinateLabels) {
        var length = calcDistance(start, end),
            angle = Math.atan2(end.x - start.x, end.t - start.t),
            numCoordinates = (maxCoordinate - minCoordinate) / step,
            tickStart = {x: 0},
            tickEnd = {x: -tickLength},
            i;

        function drawLabeledLine(ctx, start, end, width, color, labels) {
            var length = calcDistance(start, end),
                angle = Math.atan2(end.x - start.x, end.t - start.t);
            ctx.save();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.translate(start.t, start.x);
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(length, 0);
            ctx.stroke();
            ctx.restore();
            labels.forEach(function (label) {
                var labelT;
                ctx.save();
                ctx.font = label.font;
                ctx.fillStyle = label.color;
                switch (label.relativeTo) {
                    case 'start' :
                        labelT = label.offset.t;
                        break;
                    case 'middle' :
                        labelT = length / 2 + label.offset.t;
                        break;
                    case 'end' :
                        labelT = length + label.offset.t;
                        break;
                }
                //labelT = label.adjustForWidth ? labelT - ctx.measureText(label.text).width / 2 : labelT;
                ctx.translate(labelT, label.offset.x);
                ctx.rotate(label.angle);
                ctx.fillText(label.text, -ctx.measureText(label.text).width * label.widthMultiplier, 0);
                ctx.restore();
            });
            ctx.restore();
        }
        ctx.save();
        ctx.translate(start.t, start.x);
        ctx.rotate(angle);
        drawLabeledLine(ctx, {t: 0, x: 0}, {t: length, x: 0}, width, color, axisLabels);
        for (i = 0; i <= numCoordinates; i++) {
            tickStart.t = i * length / numCoordinates;
            tickEnd.t = tickStart.t;
            coordinateLabels[0].text = minCoordinate + step * i;
            if (coordinateLabels[0].text !== 0) {
                drawLabeledLine(ctx, tickStart, tickEnd, tickWidth, tickColor, coordinateLabels);
            }
        }
        ctx.restore();
    }
    function drawSplineAll(ctx) {
        ctx.clearRect(0, 0, splineCanvasWidth, splineCanvasHeight);
        //ctx.save();
        //ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        //ctx.fillRect(0, 0, splineCanvasWidth, splineCanvasHeight);
        ctx.restore();
        drawAxis(ctx, splineAxisStartT, splineAxisEndT, LINE_WIDTH, COLOR, SPLINE_AXIS_LABELS_T,
            SPLINE_AXIS_MIN_COORDINATE_T, SPLINE_AXIS_MAX_COORDINATE_T, AXIS_COORDINATE_STEP, LINE_WIDTH,
            TICK_DISPLACEMENT, COLOR, COORDINATE_LABELS_T);
        drawAxis(ctx, splineAxisStartX, splineAxisEndX, LINE_WIDTH, COLOR, SPLINE_AXIS_LABELS_X,
            SPLINE_AXIS_MIN_COORDINATE_X, SPLINE_AXIS_MAX_COORDINATE_X, AXIS_COORDINATE_STEP, LINE_WIDTH,
            -TICK_DISPLACEMENT, COLOR, COORDINATE_LABELS_X);
        drawSpline(ctx, knots, CLOSED, DRAW_CONTROL_POINTS);
        drawArrow(ctx, knots[0], knots[1], 'Average Velocity =  ' + averageVelocities[0].toFixed(AVERAGE_VELOCITY_DISPLAY_DIGITS), COLOR, ARROW_LABEL_COLOR);
        drawArrow(ctx, knots[1], knots[2], 'Average Velocity =  ' + averageVelocities[1].toFixed(AVERAGE_VELOCITY_DISPLAY_DIGITS), COLOR, ARROW_LABEL_COLOR);
        drawArrow(ctx, knots[2], knots[3], 'Average Velocity =  ' + averageVelocities[2].toFixed(AVERAGE_VELOCITY_DISPLAY_DIGITS), COLOR, ARROW_LABEL_COLOR);
    }
//    function drawBunny(ctx, x) {
//        ctx.drawImage(bunnyImg, x + BUNNY_AXIS_OFFSET_LEFT - BUNNY_IMG_WIDTH / 2, BUNNY_IMG_OFFSET_TOP, BUNNY_IMG_WIDTH, BUNNY_IMG_HEIGHT);
//    }
//    function drawBunnyAll(ctx) {
//        ctx.clearRect(0, 0, bunnyCanvasWidth, bunnyCanvasHeight);
//        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
//        ctx.fillRect(0, 0, splineCanvasWidth, splineCanvasHeight);
//        drawBunny(ctx, (AXIS_OFFSET_BOTTOM - knots[0].x) * bunnyXScalar);
//        drawAxis(ctx, splineAxisStartX, splineAxisEndX, LINE_WIDTH, BLACK_COLOR, SPLINE_AXIS_LABELS_X,
//            SPLINE_AXIS_MIN_COORDINATE_X, SPLINE_AXIS_MAX_COORDINATE_X, AXIS_COORDINATE_STEP, LINE_WIDTH, TICK_LENGTH, COORDINATE_LABELS_X);
//    }
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
    function updateKnotCoordinateValues() {
        function calcTCoordinateValue(t) {
            return (((t - splineAxisStartT.t) * splineAxisCoordinatesScalarT) + SPLINE_AXIS_MIN_COORDINATE_T).toFixed(COORDINATE_DISPLAY_DIGITS);
        }
        function calcXCoordinateValue(x) {
            return (((splineAxisStartX.x - x)  * splineAxisCoordinatesScalarX) + SPLINE_AXIS_MIN_COORDINATE_X).toFixed(COORDINATE_DISPLAY_DIGITS);
        }
        knots.forEach(function (value) {
            value.coordinates = {t: calcTCoordinateValue(value.t),
                x: calcXCoordinateValue(value.x)};
        });
    }
    function updateTextBoxes() {
        t1Elem.value = knots[0].coordinates.t;
        x1Elem.value = knots[0].coordinates.x;
        t2Elem.value = knots[1].coordinates.t;
        x2Elem.value = knots[1].coordinates.x;
        t3Elem.value = knots[2].coordinates.t;
        x3Elem.value = knots[2].coordinates.x;
        t4Elem.value = knots[3].coordinates.t;
        x4Elem.value = knots[3].coordinates.x;
    }
    function updateAverageVelocities() {
        function calculateVelocity(p1, p2) {
            return (p2.x - p1.x) / (p2.t - p1.t);
        }
        averageVelocities[0] = calculateVelocity({t: knots[0].coordinates.t, x: knots[0].coordinates.x},
            {t: knots[1].coordinates.t, x: knots[1].coordinates.x});
        averageVelocities[1] = calculateVelocity({t: knots[1].coordinates.t, x: knots[1].coordinates.x},
            {t: knots[2].coordinates.t, x: knots[2].coordinates.x});
        averageVelocities[2] = calculateVelocity({t: knots[2].coordinates.t, x: knots[2].coordinates.x},
            {t: knots[3].coordinates.t, x: knots[3].coordinates.x});
    }
    function mouseMove(e) {

        var posText,
            posTextWidth,
            posTextHeight = 7,
            posTextT,
            posTextX;

        calcMousePos(e);

        if (mousePos.t > splineCanvasWidth) {
            mousePos.t = splineCanvasWidth;
        }
        if (mousePos.x > splineCanvasHeight) {
            mousePos.x = splineCanvasHeight;
        }
        if (mouseIsDown) {
            if (mousePoint !== 0 &&
                ((mousePoint === knots.length - 1 &&
                  (mousePos.t >= knots[mousePoint - 1].t + CLOSEST_T && mousePos.t <= splineAxisEndT.t)) ||
                 (mousePoint < knots.length - 1 &&
                  (mousePos.t >= knots[mousePoint - 1].t + CLOSEST_T && mousePos.t < knots[mousePoint + 1].t - CLOSEST_T) &&
                  (mousePos.t >= splineAxisStartT.t + AXIS_CLOSEST_T && mousePos.t <= splineAxisEndT.t - AXIS_CLOSEST_T)))) {
                knots[mousePoint].t = mousePos.t;
            }
            if (((mousePoint === 0 || mousePoint === knots.length - 1) &&
                 mousePos.x <= splineAxisStartX.x && mousePos.x >= splineAxisEndX.x) ||
                (mousePos.x <= splineAxisStartX.x - AXIS_CLOSEST_X && mousePos.x >= splineAxisEndX.x + AXIS_CLOSEST_X)) {
                knots[mousePoint].x = mousePos.x;
            }
        }
        updateKnotCoordinateValues();
        updateTextBoxes();
        updateAverageVelocities();
        drawSplineAll(splineCtx);
        if (mousePoint === 0 && mouseIsDown) {
            //drawBunnyAll(bunnyCtx);
        }
        posText = '{' + mousePos.t + ',' + mousePos.x + ')';
        posTextWidth = splineCtx.measureText(posText).width;
        posTextT = mousePos.t;
        posTextX = mousePos.x;
        if (mousePos.t + posTextWidth > splineCanvasWidth) {
            posTextT = mousePos.t - (posTextWidth - (splineCanvasWidth - mousePos.t));
        }

        if (mousePos.x - posTextHeight < 0) {
            posTextX = mousePos.x + (posTextHeight - mousePos.x);
        }
        splineCtx.save();
        splineCtx.fillStyle = COLOR;
        splineCtx.fillText(posText,  posTextT, posTextX);
        splineCtx.restore();
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
        knots = [];
        knots.push({coordinates: {t: Number(t1Elem.value), x: Number(x1Elem.value)}, color: SEGMENT_COLORS[0]});
        knots.push({coordinates: {t: Number(t2Elem.value), x: Number(x2Elem.value)}, color: SEGMENT_COLORS[1]});
        knots.push({coordinates: {t: Number(t3Elem.value), x: Number(x3Elem.value)}, color: SEGMENT_COLORS[2]});
        knots.push({coordinates: {t: Number(t4Elem.value), x: Number(x4Elem.value)}, color: SEGMENT_COLORS[3]});
        knots.forEach(function (knot) {
            knot.t = (knot.coordinates.t - SPLINE_AXIS_MIN_COORDINATE_T) / splineAxisCoordinatesScalarT + splineAxisStartT.t;
            knot.x = splineAxisStartX.x - (knot.coordinates.x - SPLINE_AXIS_MIN_COORDINATE_X) / splineAxisCoordinatesScalarX;
        });
        tension = Number(tensionElem.value) / 100;
        updateKnotCoordinateValues();
        updateTextBoxes();
        updateAverageVelocities();
        drawSplineAll(splineCtx);
        //drawBunnyAll(bunnyCtx);
        if (e) {
            e.preventDefault();
        }
    }
/*    function bunnyRun() {
        var bunnyX;

        bunnyX = avgVelocities[currentVelIndex] * delT * axisCoordinatesRatio + bunnyXTotal;
        bunnyCtx.clearRect(0, 0, bunnyWidth, bunnyHeight);
        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, splineCanvasWidth, splineCanvasHeight);
        drawAxis(bunnyCtx, BUNNY_AXIS_OFFSET_LEFT, BUNNY_AXIS_OFFSET_RIGHT, BUNNY_AXIS_OFFSET_BOTTOM, 'x', bunnyStep, true, BUNNY_SCALAR);
        drawBunny(bunnyCtx, bunnyX * bunnyXScalar);
        drawSplineAll(splineCtx);
        drawPoint(splineCtx, {t: (delT + delTTotal) + AXIS_OFFSET_LEFT, x: AXIS_OFFSET_BOTTOM - bunnyX}, 5.0, "rgb(0, 0, 0)", "rgb(255, 0, 255)");
        delT++;
        if (delT + delTTotal > knots[(currentVelIndex + 1)].t - AXIS_OFFSET_LEFT) {
            bunnyXTotal += avgVelocities[currentVelIndex] * (delT - 1) * axisCoordinatesRatio;
            currentVelIndex++;
            delTTotal += delT - 1;
            delT = 1;
            if (currentVelIndex + 1 === knots.length) {
                //window.cancelAnimationFrame(requestID);
                return;
            }
        }
        window.requestAnimationFrame(bunnyRun);
    }*/
/*    function animate() {
        delT = 0;
        delTTotal = 0;
        bunnyXTotal = AXIS_OFFSET_BOTTOM - knots[0].x;
        currentVelIndex = 0;
        requestID = window.requestAnimationFrame(bunnyRun);
    }*/
    window.addEventListener('load', function() {
        splineCanvasElem = document.getElementById('splineCanvas');
        bunnyCanvasElem = document.getElementById('bunnyCanvas');
        formElem = document.getElementById('form');
        splineCtx = splineCanvasElem.getContext('2d');
        //bunnyCtx = bunnyCanvasElem.getContext('2d');
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
        //bunnyWidth = bunnyCanvasElem.width;
        //bunnyHeight = bunnyCanvasElem.height;
        //bunnyAxisCoordsScalar = (bunnyWidth / (BUNNY_AXIS_OFFSET_RIGHT - BUNNY_AXIS_OFFSET_LEFT)) / BUNNY_SCALAR;
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
        //animateElem.addEventListener('click', animate, false);
        //canvasElem.addEventListener('click', canvasMousePos, false);
        splineCanvasWidth = splineCanvasElem.width;
        splineCanvasHeight = splineCanvasElem.height;
        splineAxisStartT = {t: SPLINE_AXIS_MARGINS, x: splineCanvasHeight / 2};
        splineAxisEndT = {t: splineCanvasWidth - SPLINE_AXIS_MARGINS, x: splineCanvasHeight / 2};
        splineAxisStartX = {t: splineCanvasWidth / 2, x: splineCanvasHeight - SPLINE_AXIS_MARGINS};
        splineAxisEndX = {t: splineCanvasWidth / 2, x: SPLINE_AXIS_MARGINS};
        splineAxisLengthT = splineCanvasWidth - SPLINE_AXIS_MARGINS * 2;
        splineAxisLengthX = splineCanvasHeight - SPLINE_AXIS_MARGINS * 2;
        splineAxisCoordinatesScalarT = SPLINE_AXIS_RANGE_T / splineAxisLengthT;
        splineAxisCoordinatesScalarX = SPLINE_AXIS_RANGE_X / splineAxisLengthX;
        //splineAxisCoordinatesRatio = splineAxisCoordinatesScalarT / splineAxisCoordinatesScalarX;
        splineCanvasElem.addEventListener('mousemove', mouseMove, false);
        splineCanvasElem.addEventListener('mousedown', mouseDown, false);
        splineCanvasElem.addEventListener('mouseup', mouseUp, false);
        splineCanvasElem.addEventListener('mouseleave', mouseUp, false);
        bunnyImg.addEventListener('load', function () {
            submit();
        });
        bunnyImg.src = 'bunny.jpg';
        //t1Elem.focus();
    }, false);
}());