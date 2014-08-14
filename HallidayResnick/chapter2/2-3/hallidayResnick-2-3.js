// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// hallidayResnick-2-3.js - 1 motion: displacement and time interactive lesson

(function () {
    'use strict';

    var DISPLAY_DIGITS = 2,
        AVERAGE_VELOCITY_DISPLAY_DIGITS = 2,
        TICK_DISPLACEMENT = 5,
        LINE_WIDTH = 1,
        COLOR = 'rgb(100, 100, 100)',
        ARROW_LABEL_COLORS = ['rgb(169, 229, 146)',
            'rgb(245, 157, 171)', 'rgb(123, 192, 176)'], // Light green-blue pastel
        SEGMENT_COLORS = ['rgb(128, 209, 99)', 'rgb(231, 109, 128)',
            'rgb(74, 158, 139)', 'rgb(245, 165, 115)'],
        AXIS_COORDINATE_STEP = 2,
        AXIS_COORDINATES_FONT = 'normal 10pt "Droid Sans", sans-serif',
        AXIS_LABEL_FONT = 'normal 13pt "Droid Sans", sans-serif',
        AXIS_LABEL_OFFSET_X_X = 20,
        AXIS_LABEL_OFFSET_Y_X = 40,
        AXIS_LABEL_OFFSET_X_Y = 20,
        AXIS_LABEL_OFFSET_Y_Y = 50,
        COORDINATE_LABEL_OFFSET_X_X = 0,
        COORDINATE_LABEL_OFFSET_Y_X = 20,
        COORDINATE_LABEL_OFFSET_X_Y = 4,
        COORDINATE_LABEL_OFFSET_Y_Y = 10,
        COORDINATE_LABELS_X =
            [
                {
                    text: '',
                    font: AXIS_COORDINATES_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {x: COORDINATE_LABEL_OFFSET_X_X, y: COORDINATE_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
        COORDINATE_LABELS_Y =
            [
                {
                    text: '',
                    font: AXIS_COORDINATES_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {x: -COORDINATE_LABEL_OFFSET_X_Y, y: -COORDINATE_LABEL_OFFSET_Y_Y},
                    angle: Math.PI / 2,
                    widthMultiplier: 1
                }
            ],
        SPLINE_AXIS_MARGINS = 30,
        SPLINE_AXIS_MIN_COORDINATE_X = -20,
        SPLINE_AXIS_MAX_COORDINATE_X = 20,
        SPLINE_AXIS_RANGE_X = SPLINE_AXIS_MAX_COORDINATE_X - SPLINE_AXIS_MIN_COORDINATE_X,
        SPLINE_AXIS_MIN_COORDINATE_Y = -10,
        SPLINE_AXIS_MAX_COORDINATE_Y = 10,
        SPLINE_AXIS_RANGE_Y = SPLINE_AXIS_MAX_COORDINATE_Y - SPLINE_AXIS_MIN_COORDINATE_Y,
        SPLINE_AXIS_LABELS_X =
            [
                {
                    text: '-t',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {x: AXIS_LABEL_OFFSET_X_X, y: AXIS_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                },
                {
                    text: '+t',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "end",
                    offset: {x: -AXIS_LABEL_OFFSET_X_X, y: AXIS_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
        SPLINE_AXIS_LABELS_Y =
            [
                {
                    text: '-x',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {x: AXIS_LABEL_OFFSET_X_Y, y: -AXIS_LABEL_OFFSET_Y_Y},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                },
                {
                    text: '+x',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "end",
                    offset: {x: -AXIS_LABEL_OFFSET_X_Y, y: -AXIS_LABEL_OFFSET_Y_Y},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                }
            ],
        splineBasicShapes,
        splineCanvasWidth,
        splineCanvasHeight,
        splineAxisStartX,
        splineAxisEndX,
        splineAxisStartY,
        splineAxisEndY,
        splineAxisLengthX,
        splineAxisLengthY,
        splineAxisCoordinatesScalarX,
        splineAxisCoordinatesScalarY,
        BUNNY_AXIS_MARGINS = 30,
        BUNNY_AXIS_MIN_COORDINATE_X = SPLINE_AXIS_MIN_COORDINATE_Y,
        BUNNY_AXIS_MAX_COORDINATE_X = SPLINE_AXIS_MAX_COORDINATE_Y,
        BUNNY_AXIS_RANGE_X = BUNNY_AXIS_MAX_COORDINATE_X - BUNNY_AXIS_MIN_COORDINATE_X,
        BUNNY_AXIS_LABELS_X =
            [
                {
                    text: '-x',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "start",
                    offset: {x: AXIS_LABEL_OFFSET_X_X, y: AXIS_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                },
                {
                    text: '+x',
                    font: AXIS_LABEL_FONT,
                    color: COLOR,
                    relativeTo: "end",
                    offset: {x: -AXIS_LABEL_OFFSET_X_X, y: AXIS_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
        bunnyCanvasWidth,
        bunnyCanvasHeight,
        bunnyAxisStartX,
        bunnyAxisEndX,
        bunnyAxisLengthX,
        bunnyAxisCoordinatesScalarX,
        BUNNY_IMG_WIDTH = 48,
        BUNNY_IMG_HEIGHT = 48,
        BUNNY_IMG_MARGIN_TOP = 5,
        ARROW_LABEL_FONT = 'normal 10pt "Droid Sans", sans-serif',
        ARROW_LABEL_OFFSET_Y = 10,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        DRAW_CONTROL_POINTS = false,
        CLOSED = false,
        knots = [],
        mouseIsDown = false,
        mousePos = {},
        splineCanvasElem,
        splineBackgroundCanvasElem,
        bunnyCanvasElem,
        bunnyBackgroundCanvasElem,
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
        splineCtx,
        splineBackgroundCtx,
        multiSegmentSpline,
        BUNNY_RIGHT_SRC = 'bunnyRight.png',
        BUNNY_LEFT_SRC = 'bunnyLeft.png',
        bunnyRightImg = new Image(),
        bunnyLeftImg = new Image(),
        bunnyCtx,
        bunnyBackgroundCtx,
        averageVelocities = [],
        MAX_ANIMATION_TIME = 20, //seconds
        DELTA_T = (SPLINE_AXIS_RANGE_X / 60) / MAX_ANIMATION_TIME,
        currentSegmentBunnyT,
        tTotal,
        currentSegmentBunnyXCoordinateOffset,
        bunnyXCoordinateTotal,
        currentVelIndex,
        showBunnyPoint = false,
        requestID = null;

    function drawArrow(ctx, p1, p2, text, arrowColor, labelColor) {
        var length = mathBasics.calcDistance(p1, p2),
            angle = Math.atan2(p2.y - p1.y, p2.x - p1.x),
            end = {x: length, y: 0};
        ctx.save();
        ctx.font = ARROW_LABEL_FONT;
        ctx.strokeStyle = arrowColor;
        ctx.fillStyle = arrowColor;
        ctx.lineWidth = 1;
        ctx.translate(p1.x, p1.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(end.x - ARROWHEAD_LENGTH, end.y + ARROWHEAD_WIDTH / 2);
        ctx.lineTo(end.x - ARROWHEAD_LENGTH, end.y - ARROWHEAD_WIDTH / 2);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = labelColor;
        ctx.fillText(text, end.x / 2 - ctx.measureText(text).width / 2, end.y - ARROW_LABEL_OFFSET_Y);
        ctx.restore();
    }
    function drawAxis(ctx, start, end, width, color, axisLabels,
                      minCoordinate, maxCoordinate, step,
                      tickWidth, tickLength, tickColor, coordinateLabels, drawOrigin) {
        var length = mathBasics.calcDistance(start, end),
            angle = Math.atan2(end.y - start.y, end.x - start.x),
            numCoordinates = (maxCoordinate - minCoordinate) / step,
            tickStart = {y: 0},
            tickEnd = {y: -tickLength},
            i;

        function drawLabeledLine(ctx, start, end, width, color, labels) {
            var length = mathBasics.calcDistance(start, end),
                angle = Math.atan2(end.y - start.y, end.x - start.x);
            ctx.save();
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.translate(start.x, start.y);
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(length, 0);
            ctx.stroke();
            ctx.restore();
            labels.forEach(function (label) {
                var labelX;
                ctx.save();
                ctx.font = label.font;
                ctx.fillStyle = label.color;
                switch (label.relativeTo) {
                    case 'start' :
                        labelX = label.offset.x;
                        break;
                    case 'middle' :
                        labelX = length / 2 + label.offset.x;
                        break;
                    case 'end' :
                        labelX = length + label.offset.x;
                        break;
                }
                ctx.translate(labelX, label.offset.y);
                ctx.rotate(label.angle);
                ctx.fillText(label.text, -ctx.measureText(label.text).width * label.widthMultiplier, 0);
                ctx.restore();
            });
            ctx.restore();
        }
        ctx.save();
        ctx.translate(start.x, start.y);
        ctx.rotate(angle);
        drawLabeledLine(ctx, {x: 0, y: 0}, {x: length, y: 0}, width, color, axisLabels);
        for (i = 0; i <= numCoordinates; i++) {
            tickStart.x = i * length / numCoordinates;
            tickEnd.x = tickStart.x;
            coordinateLabels[0].text = minCoordinate + step * i;
            if (coordinateLabels[0].text !== 0 || drawOrigin) {
                drawLabeledLine(ctx, tickStart, tickEnd, tickWidth, tickColor, coordinateLabels);
            }
        }
        ctx.restore();
    }
    function drawSplineAll(ctx) {
        ctx.clearRect(0, 0, splineCanvasWidth, splineCanvasHeight);
        ctx.drawImage(splineBackgroundCanvasElem, 0, 0);
        multiSegmentSpline.draw();
        drawArrow(ctx, knots[0], knots[1], 'Average Velocity =  ' + averageVelocities[0].toFixed(AVERAGE_VELOCITY_DISPLAY_DIGITS), COLOR, ARROW_LABEL_COLORS[0]);
        drawArrow(ctx, knots[1], knots[2], 'Average Velocity =  ' + averageVelocities[1].toFixed(AVERAGE_VELOCITY_DISPLAY_DIGITS), COLOR, ARROW_LABEL_COLORS[1]);
        drawArrow(ctx, knots[2], knots[3], 'Average Velocity =  ' + averageVelocities[2].toFixed(AVERAGE_VELOCITY_DISPLAY_DIGITS), COLOR, ARROW_LABEL_COLORS[2]);
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
        mousePos.x = e.clientX - left + window.pageXOffset;
        mousePos.y = e.clientY - top + window.pageYOffset;
    }
    function calcSplineX(xCoordinate) {
        return splineAxisStartX.x + (xCoordinate - SPLINE_AXIS_MIN_COORDINATE_X) / splineAxisCoordinatesScalarX;
    }
    function calcSplineY(yCoordinate) {
        return splineAxisStartY.y - (yCoordinate - SPLINE_AXIS_MIN_COORDINATE_Y) / splineAxisCoordinatesScalarY;
    }
    function calcSplineXCoordinate(x) {
        return ((x - splineAxisStartX.x) * splineAxisCoordinatesScalarX) + SPLINE_AXIS_MIN_COORDINATE_X;
    }
    function calcSplineYCoordinate(y) {
        return ((splineAxisStartY.y - y)  * splineAxisCoordinatesScalarY) + SPLINE_AXIS_MIN_COORDINATE_Y;
    }
    function updateKnotCoordinateValues() {
        knots.forEach(function (value) {
            value.coordinates = {x: calcSplineXCoordinate(value.x),
                y: calcSplineYCoordinate(value.y)};
        });
    }
    function updateTextBoxes() {
        t1Elem.value = knots[0].coordinates.x.toFixed(DISPLAY_DIGITS);
        x1Elem.value = knots[0].coordinates.y.toFixed(DISPLAY_DIGITS);
        t2Elem.value = knots[1].coordinates.x.toFixed(DISPLAY_DIGITS);
        x2Elem.value = knots[1].coordinates.y.toFixed(DISPLAY_DIGITS);
        t3Elem.value = knots[2].coordinates.x.toFixed(DISPLAY_DIGITS);
        x3Elem.value = knots[2].coordinates.y.toFixed(DISPLAY_DIGITS);
        t4Elem.value = knots[3].coordinates.x.toFixed(DISPLAY_DIGITS);
        x4Elem.value = knots[3].coordinates.y.toFixed(DISPLAY_DIGITS);
    }
    function updateAverageVelocities() {
        function calculateVelocity(p1, p2) {
            return (p2.y - p1.y) / (p2.x - p1.x);
        }
        averageVelocities[0] = calculateVelocity(knots[0].coordinates, knots[1].coordinates);
        averageVelocities[1] = calculateVelocity(knots[1].coordinates, knots[2].coordinates);
        averageVelocities[2] = calculateVelocity(knots[2].coordinates, knots[3].coordinates);
    }
    function drawBunnyPoint() {
        splineBasicShapes.drawPoint({x: calcSplineX(currentSegmentBunnyT + tTotal),
                y: calcSplineY(currentSegmentBunnyXCoordinateOffset + bunnyXCoordinateTotal)},
            5.0, "rgb(0, 0, 0)", "rgb(255, 0, 255)");
    }
    function mouseMove(e) {

        var posText,
            posTextWidth,
            posTextHeight = 7,
            posTextX,
            posTextY;

        if (requestID !== null) {
            return;
        }
        calcMousePos(e);
        mousePos.x = Math.min(mousePos.x, splineCanvasWidth);
        mousePos.y = Math.min(mousePos.y, splineCanvasHeight);
        if (mouseIsDown) {
            multiSegmentSpline.setKnot(mousePos);
            updateKnotCoordinateValues();
            updateTextBoxes();
            updateAverageVelocities();
            tensionElem.value = multiSegmentSpline.tension.toFixed(DISPLAY_DIGITS);
            drawSplineAll(splineCtx);
            drawBunnyAll(bunnyCtx, knots[0].coordinates.y, averageVelocities[0]);
        }
        drawSplineAll(splineCtx);
        if (showBunnyPoint) {
            drawBunnyPoint();
        }
        if (mouseIsDown) {
        }
        posText = '(' + mousePos.x + ',' + mousePos.y + ')';
        posTextWidth = splineCtx.measureText(posText).width;
        posTextX = mousePos.x;
        posTextY = mousePos.y;
        if (mousePos.x + posTextWidth > splineCanvasWidth) {
            posTextX = mousePos.x - (posTextWidth - (splineCanvasWidth - mousePos.x));
        }

        if (mousePos.y - posTextHeight < 0) {
            posTextY = mousePos.y + (posTextHeight - mousePos.y);
        }
        splineCtx.save();
        splineCtx.fillStyle = COLOR;
        splineCtx.fillText(posText,  posTextX, posTextY);
        splineCtx.restore();
    }
    function mouseDown(e) {
        if (requestID !== null) {
            window.cancelAnimationFrame(requestID);
            requestID = null;
        }
        calcMousePos(e);
        multiSegmentSpline.setClosestKnotIndex(mousePos);
        multiSegmentSpline.setKnot(mousePos);
        tensionElem.value = multiSegmentSpline.tension.toFixed(DISPLAY_DIGITS);
        mouseIsDown = true;
        showBunnyPoint = false;
        mouseMove(e);
    }
    function mouseUp() {
        mouseIsDown = false;
    }
    function calcBunnyX(xCoordinate) {
        return bunnyAxisStartX.x + (xCoordinate - BUNNY_AXIS_MIN_COORDINATE_X) / bunnyAxisCoordinatesScalarX;
    }
    function drawBunny(ctx, bunnyXCoordinate, velocity) {
        ctx.drawImage(velocity < 0 ? bunnyLeftImg : bunnyRightImg,
            calcBunnyX(bunnyXCoordinate) - BUNNY_IMG_WIDTH / 2,
            BUNNY_IMG_MARGIN_TOP, BUNNY_IMG_WIDTH, BUNNY_IMG_HEIGHT);
    }
    function drawBunnyAll(ctx, bunnyXCoordinate, velocity) {
        ctx.clearRect(0, 0, bunnyCanvasWidth, bunnyCanvasHeight);
        ctx.drawImage(bunnyBackgroundCanvasElem, 0, 0);
        drawBunny(ctx, bunnyXCoordinate, velocity);
    }
    function bunnyRun() {

        function draw() {
            drawSplineAll(splineCtx);
            drawBunnyPoint();
            drawBunnyAll(bunnyCtx, currentSegmentBunnyXCoordinateOffset + bunnyXCoordinateTotal,
                averageVelocities[currentVelIndex]);
        }

        currentSegmentBunnyXCoordinateOffset = averageVelocities[currentVelIndex] * currentSegmentBunnyT;
        draw();
        if (currentSegmentBunnyT + DELTA_T + tTotal > knots[(currentVelIndex + 1)].coordinates.x) {
            currentVelIndex++;
            bunnyXCoordinateTotal = knots[currentVelIndex].coordinates.y;
            tTotal = knots[currentVelIndex].coordinates.x;
            currentSegmentBunnyT = 0;
            if (requestID === null || currentVelIndex + 1 === knots.length) {
                currentSegmentBunnyXCoordinateOffset = 0;
                currentVelIndex--;
                draw();
                requestID = null;
                return;
            }
        }
        currentSegmentBunnyT += DELTA_T;
        requestID = window.requestAnimationFrame(bunnyRun);
    }
    function animate() {
        if (requestID !== null) {
            return;
        }
        currentSegmentBunnyT = 0;
        tTotal = knots[0].coordinates.x;
        bunnyXCoordinateTotal = knots[0].coordinates.y;
        currentVelIndex = 0;
        showBunnyPoint = true;
        requestID = window.requestAnimationFrame(bunnyRun);
     }
    function bunnyImgLoaded(e) {
        knots = [];
        knots.push({coordinates: {x: Number(t1Elem.value), y: Number(x1Elem.value)}, color: SEGMENT_COLORS[0]});
        knots.push({coordinates: {x: Number(t2Elem.value), y: Number(x2Elem.value)}, color: SEGMENT_COLORS[1]});
        knots.push({coordinates: {x: Number(t3Elem.value), y: Number(x3Elem.value)}, color: SEGMENT_COLORS[2]});
        knots.push({coordinates: {x: Number(t4Elem.value), y: Number(x4Elem.value)}, color: SEGMENT_COLORS[3]});
        knots.forEach(function (knot) {
            knot.x = (knot.coordinates.x - SPLINE_AXIS_MIN_COORDINATE_X) / splineAxisCoordinatesScalarX + splineAxisStartX.x;
            knot.y = splineAxisStartY.y - (knot.coordinates.y - SPLINE_AXIS_MIN_COORDINATE_Y) / splineAxisCoordinatesScalarY;
        });
        //tension = Number(tensionElem.value) / 100;
        updateKnotCoordinateValues();
        updateTextBoxes();
        updateAverageVelocities();
        multiSegmentSpline = MultiSegmentSpline.create(splineCtx, splineBasicShapes, knots, CLOSED,
            {startX: splineAxisStartX.x, endX: splineAxisEndX.x, startY: splineAxisStartY.y, endY: splineAxisEndY.y},
            Number(tensionElem.value), DRAW_CONTROL_POINTS, null, null, null);
        multiSegmentSpline.updateTension();
        tensionElem.value = multiSegmentSpline.tension.toFixed(DISPLAY_DIGITS);
        drawSplineAll(splineCtx);
        drawBunnyAll(bunnyCtx, knots[0].coordinates.y, averageVelocities[0]);
        splineCanvasElem.addEventListener('mousemove', mouseMove, false);
        splineCanvasElem.addEventListener('mousedown', mouseDown, false);
        splineCanvasElem.addEventListener('mouseup', mouseUp, false);
        splineCanvasElem.addEventListener('mouseleave', mouseUp, false);
        animateElem.addEventListener('click', animate, false);
        if (e) {
            e.preventDefault();
        }
    }
    function drawSplineBackground(ctx) {
        drawAxis(ctx, splineAxisStartX, splineAxisEndX, LINE_WIDTH, COLOR, SPLINE_AXIS_LABELS_X,
            SPLINE_AXIS_MIN_COORDINATE_X, SPLINE_AXIS_MAX_COORDINATE_X, AXIS_COORDINATE_STEP, LINE_WIDTH,
            TICK_DISPLACEMENT, COLOR, COORDINATE_LABELS_X, false);
        drawAxis(ctx, splineAxisStartY, splineAxisEndY, LINE_WIDTH, COLOR, SPLINE_AXIS_LABELS_Y,
            SPLINE_AXIS_MIN_COORDINATE_Y, SPLINE_AXIS_MAX_COORDINATE_Y, AXIS_COORDINATE_STEP, LINE_WIDTH,
            -TICK_DISPLACEMENT, COLOR, COORDINATE_LABELS_Y, false);
    }
    function drawBunnyBackground(ctx) {
        drawAxis(ctx, bunnyAxisStartX, bunnyAxisEndX, LINE_WIDTH, COLOR, BUNNY_AXIS_LABELS_X,
            BUNNY_AXIS_MIN_COORDINATE_X, BUNNY_AXIS_MAX_COORDINATE_X, AXIS_COORDINATE_STEP, LINE_WIDTH,
            TICK_DISPLACEMENT, COLOR, COORDINATE_LABELS_X, true);
    }
    window.addEventListener('load', function() {
        splineCanvasElem = document.getElementById('splineCanvas');
        splineBackgroundCanvasElem = document.getElementById('splineBackgroundCanvas');
        bunnyCanvasElem = document.getElementById('bunnyCanvas');
        bunnyBackgroundCanvasElem = document.getElementById('bunnyBackgroundCanvas');
        formElem = document.getElementById('form');
        splineCtx = splineCanvasElem.getContext('2d');
        splineBackgroundCtx = splineBackgroundCanvasElem.getContext('2d');
        splineBasicShapes = BasicShapes.create(splineCtx);
        bunnyBackgroundCtx = bunnyBackgroundCanvasElem.getContext('2d');
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
        splineCanvasWidth = splineCanvasElem.width;
        splineCanvasHeight = splineCanvasElem.height;
        splineAxisStartX = {x: SPLINE_AXIS_MARGINS, y: splineCanvasHeight / 2};
        splineAxisEndX = {x: splineCanvasWidth - SPLINE_AXIS_MARGINS, y: splineCanvasHeight / 2};
        splineAxisStartY = {x: splineCanvasWidth / 2, y: splineCanvasHeight - SPLINE_AXIS_MARGINS};
        splineAxisEndY = {x: splineCanvasWidth / 2, y: SPLINE_AXIS_MARGINS};
        splineAxisLengthX = splineCanvasWidth - SPLINE_AXIS_MARGINS * 2;
        splineAxisLengthY = splineCanvasHeight - SPLINE_AXIS_MARGINS * 2;
        splineAxisCoordinatesScalarX = SPLINE_AXIS_RANGE_X / splineAxisLengthX;
        splineAxisCoordinatesScalarY = SPLINE_AXIS_RANGE_Y / splineAxisLengthY;
        bunnyCanvasWidth = bunnyCanvasElem.width;
        bunnyCanvasHeight = bunnyCanvasElem.height;
        bunnyAxisStartX = {x: BUNNY_AXIS_MARGINS, y: bunnyCanvasHeight / 2};
        bunnyAxisEndX = {x: bunnyCanvasWidth - BUNNY_AXIS_MARGINS, y: bunnyCanvasHeight / 2};
        bunnyAxisLengthX = bunnyCanvasWidth - BUNNY_AXIS_MARGINS * 2;
        bunnyAxisCoordinatesScalarX = BUNNY_AXIS_RANGE_X / bunnyAxisLengthX;
        drawSplineBackground(splineBackgroundCtx);
        drawBunnyBackground(bunnyBackgroundCtx);
        bunnyLeftImg.addEventListener('load', function () {
            bunnyImgLoaded();
        }, false);
        bunnyRightImg.addEventListener('load', function () {
            bunnyLeftImg.src = BUNNY_LEFT_SRC;
        }, false);
        bunnyRightImg.src = BUNNY_RIGHT_SRC;
        //t1Elem.focus();
    }, false);
}());