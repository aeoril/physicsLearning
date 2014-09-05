// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// hallidayResnick-2-3.js - 1 motion: displacement and time interactive lesson

(function () {
    'use strict';

    var DISPLAY_DIGITS = 2,
        AXIS_TICK_LENGTH = 5,
        LINE_WIDTH = 1,
        STYLE = 'rgb(100, 100, 100)',
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        AXIS_COORDINATE_STEP = 2,
        AXIS_COORDINATES_FONT = 'normal 10pt "Droid Sans", sans-serif',
        AXIS_LABEL_FONT = 'normal 13pt "Droid Sans", sans-serif',
        AXIS_LABEL_OFFSET_X_X = 20,
        AXIS_LABEL_OFFSET_Y_X = 40,
        AXIS_LABEL_OFFSET_X_Y = 20,
        AXIS_LABEL_OFFSET_Y_Y = 50,
        COORDINATE_LABEL_OFFSET_X_X = -20,
        COORDINATE_LABEL_OFFSET_Y_X = 0,
        COORDINATE_LABEL_OFFSET_X_Y = 10,
        COORDINATE_LABEL_OFFSET_Y_Y = -4,
        COORDINATE_LABELS_X = [
            {
                text: '',
                font: AXIS_COORDINATES_FONT,
                fillStyle: STYLE,
                relativeTo: "start",
                offset: {x: COORDINATE_LABEL_OFFSET_X_X, y: COORDINATE_LABEL_OFFSET_Y_X},
                angle: Math.PI / 2,
                widthMultiplier: 0.5
            }
        ],
        COORDINATE_LABELS_Y = [
            {
                text: '',
                font: AXIS_COORDINATES_FONT,
                fillStyle: STYLE,
                relativeTo: "start",
                offset: {x: -COORDINATE_LABEL_OFFSET_X_Y, y: -COORDINATE_LABEL_OFFSET_Y_Y},
                angle: 0,
                widthMultiplier: 1
            }
        ],
        VELOCITY_ARROW_PARAMS = {
            ARROW_WIDTH: 1,
            AVERAGE_VELOCITY_DISPLAY_DIGITS: 2,
            ARROW_LABEL_FILL_STYLES: ['rgb(169, 229, 146)', 'rgb(245, 157, 171)', 'rgb(123, 192, 176)'],
            VELOCITY_ARROWS: [
                {
                    arrowHeadLength: ARROWHEAD_LENGTH * 1.5,
                    arrowHeadWidth: ARROWHEAD_WIDTH * 1.5,
                    fill: true,
                    fillStyle: STYLE,
                    strokeStyle: STYLE,
                    relativeTo: "end",
                    offset: {x: 0, y: 0},
                    angle: 0
                }
            ],
            VELOCITY_LABELS: [
                {
                    text: '',
                    font: 'normal 10pt "Droid Sans", sans-serif',
                    fillStyle: '',
                    relativeTo: "middle",
                    offset: {x: 0, y: -10},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ]
        },
        splineAxisParams = {
            SPLINE_AXIS_MARGINS: 30,
            SPLINE_AXIS_MIN_COORDINATE_X: -20,
            SPLINE_AXIS_MAX_COORDINATE_X: 20,
            SPLINE_AXIS_RANGE_X: 0,
            SPLINE_AXIS_MIN_COORDINATE_Y: -10,
            SPLINE_AXIS_MAX_COORDINATE_Y: 10,
            SPLINE_AXIS_RANGE_Y: 0,
            SPLINE_AXIS_LABELS_X: [
                {
                    text: '-t',
                    font: AXIS_LABEL_FONT,
                    fillStyle: STYLE,
                    relativeTo: "start",
                    offset: {x: AXIS_LABEL_OFFSET_X_X, y: AXIS_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                },
                {
                    text: '+t',
                    font: AXIS_LABEL_FONT,
                    fillStyle: STYLE,
                    relativeTo: "end",
                    offset: {x: -AXIS_LABEL_OFFSET_X_X, y: AXIS_LABEL_OFFSET_Y_X},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
            SPLINE_AXIS_LABELS_Y: [
                {
                    text: '-x',
                    font: AXIS_LABEL_FONT,
                    fillStyle: STYLE,
                    relativeTo: "start",
                    offset: {x: AXIS_LABEL_OFFSET_X_Y, y: -AXIS_LABEL_OFFSET_Y_Y},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                },
                {
                    text: '+x',
                    font: AXIS_LABEL_FONT,
                    fillStyle: STYLE,
                    relativeTo: "end",
                    offset: {x: -AXIS_LABEL_OFFSET_X_Y, y: -AXIS_LABEL_OFFSET_Y_Y},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                }
            ],
            SPLINE_AXIS_ARROWHEADS_X: [
                {
                    arrowHeadLength: ARROWHEAD_LENGTH,
                    arrowHeadWidth: ARROWHEAD_WIDTH,
                    fill: true,
                    fillStyle: STYLE,
                    strokeStyle: STYLE,
                    relativeTo: "start",
                    offset: {x: 0, y: 0},
                    angle: 0
                },
                {
                    arrowHeadLength: ARROWHEAD_LENGTH,
                    arrowHeadWidth: ARROWHEAD_WIDTH,
                    fill: true,
                    fillStyle: STYLE,
                    strokeStyle: STYLE,
                    relativeTo: "end",
                    offset: {x: 0, y: 0},
                    angle: 0
                }
            ],
            SPLINE_AXIS_ARROWHEADS_Y: [
                {
                    arrowHeadLength: ARROWHEAD_LENGTH,
                    arrowHeadWidth: ARROWHEAD_WIDTH,
                    fill: true,
                    fillStyle: STYLE,
                    strokeStyle: STYLE,
                    relativeTo: "start",
                    offset: {x: 0, y: 0},
                    angle: 0
                },
                {
                    arrowHeadLength: ARROWHEAD_LENGTH,
                    arrowHeadWidth: ARROWHEAD_WIDTH,
                    fill: true,
                    fillStyle: STYLE,
                    strokeStyle: STYLE,
                    relativeTo: "end",
                    offset: {x: 0, y: 0},
                    angle: 0
                }
            ],
            splineAxisStartX: 0,
            splineAxisEndX: 0,
            splineAxisStartY: 0,
            splineAxisEndY: 0,
            splineAxisLengthX: 0,
            splineAxisLengthY: 0,
            splineAxisCoordinatesScalarX: 0,
            splineAxisCoordinatesScalarY: 0
        },
        knotTextBoxElements = [],
        splineBasicShapes,
        splineAdvancedShapes,
        splineBackgroundAdvancedShapes,
        splineCanvasWidth,
        splineCanvasHeight,
        bunnyBackground,
        BUNNY_IMG_WIDTH = 48,
        BUNNY_IMG_HEIGHT = 48,
        BUNNY_IMG_MARGIN_TOP = 5,
        DRAW_CONTROL_POINTS = false,
        CLOSED = false,
        knots,
        mouseIsDown = false,
        mousePos = {},
        splineCanvasElem,
        splineBackgroundCanvasElem,
        bunnyCanvasElem,
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
        MAX_ANIMATION_TIME = 20, //seconds
        DELTA_T = 0,
        currentSegmentBunnyT,
        tTotal,
        currentSegmentBunnyXCoordinateOffset,
        bunnyXCoordinateTotal,
        currentVelIndex,
        showBunnyPoint = false,
        requestID = null;

    function drawSplineAll(ctx) {
        ctx.clearRect(0, 0, splineCanvasWidth, splineCanvasHeight);
        ctx.drawImage(splineBackgroundCanvasElem, 0, 0);
        multiSegmentSpline.draw();
        knots.averageVelocities.forEach(function(averageVelocity, index) {
            VELOCITY_ARROW_PARAMS.VELOCITY_LABELS[0].text = 'Average Velocity =  ' +
                knots.averageVelocities[index].toFixed(VELOCITY_ARROW_PARAMS.AVERAGE_VELOCITY_DISPLAY_DIGITS);
            VELOCITY_ARROW_PARAMS.VELOCITY_LABELS[0].fillStyle = VELOCITY_ARROW_PARAMS.ARROW_LABEL_FILL_STYLES[index];
            splineAdvancedShapes.drawLabeledLine(knots.knots[index], knots.knots[index + 1], VELOCITY_ARROW_PARAMS.ARROW_WIDTH, STYLE,
                VELOCITY_ARROW_PARAMS.VELOCITY_ARROWS, VELOCITY_ARROW_PARAMS.VELOCITY_LABELS);
        });
    }
    function calcMousePos(e, element, isTouch) {
        var top = 0,
            left = 0,
            canvasScale = element.width / element.clientWidth;

        if (isTouch) {
            mousePos.x = (e.targetTouches[0].pageX - element.offsetLeft) * canvasScale;
            mousePos.y = (e.targetTouches[0].pageY - element.offsetTop) * canvasScale;
            return;
        }
        // get canvas position
        while (element.tagName != 'BODY') {

            top += element.offsetTop;
            left += element.offsetLeft;

            element = element.offsetParent;
        }
        // return relative mouse position
        mousePos.x = (e.clientX - left + window.pageXOffset) * canvasScale;
        mousePos.y = (e.clientY - top + window.pageYOffset) * canvasScale;
    }
    function drawBunnyPoint() {
        splineBasicShapes.drawPoint({x: knots.calcSplineX(currentSegmentBunnyT + tTotal),
                y: knots.calcSplineY(currentSegmentBunnyXCoordinateOffset + bunnyXCoordinateTotal)},
            5.0, "rgb(0, 0, 0)", "rgb(255, 0, 255)");
    }
    function mouseMove(e, isTouch) {

        var posText,
            posTextWidth,
            posTextHeight = 7,
            posTextX,
            posTextY;

        if (requestID !== null) {
            return;
        }
        calcMousePos(e, splineCanvasElem, isTouch);
        mousePos.x = Math.min(mousePos.x, splineCanvasWidth);
        mousePos.y = Math.min(mousePos.y, splineCanvasHeight);
        if (mouseIsDown) {
            multiSegmentSpline.setKnot(mousePos);
            knots.updateKnotCoordinateValues();
            knots.updateTextBoxes();
            knots.updateAverageVelocities();
            tensionElem.value = multiSegmentSpline.tension.toFixed(DISPLAY_DIGITS);
            drawSplineAll(splineCtx);
            drawBunnyAll(bunnyCtx, knots.knots[0].coordinates.y, knots.averageVelocities[0]);
        }
        drawSplineAll(splineCtx);
        if (showBunnyPoint) {
            drawBunnyPoint();
        }
        posText = '(' + mousePos.x.toFixed(0) + ',' + mousePos.y.toFixed(0) + ')';
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
        splineCtx.fillStyle = STYLE;
        splineCtx.fillText(posText,  posTextX, posTextY);
        splineCtx.restore();
        if (isTouch) {
            e.preventDefault();
        }
    }
    function mouseDown(e, isTouch) {
        if (requestID !== null) {
            window.cancelAnimationFrame(requestID);
            requestID = null;
        }
        calcMousePos(e, splineCanvasElem, isTouch);
        multiSegmentSpline.setClosestKnotIndex(mousePos);
        multiSegmentSpline.setKnot(mousePos);
        tensionElem.value = multiSegmentSpline.tension.toFixed(DISPLAY_DIGITS);
        mouseIsDown = true;
        showBunnyPoint = false;
        mouseMove(e, isTouch);
    }
    function mouseUp(e, isTouch) {
        mouseIsDown = false;
        if (isTouch) {
            e.preventDefault();
        }
    }
    function calcBunnyX(xCoordinate) {
        return bunnyBackground.axisStartX.x + (xCoordinate - bunnyBackground.axisParams.AXIS_MIN_COORDINATE_X) /
            bunnyBackground.axisCoordinatesScalarX;
    }
    function drawBunny(ctx, bunnyXCoordinate, velocity) {
        ctx.drawImage(velocity < 0 ? bunnyLeftImg : bunnyRightImg,
            calcBunnyX(bunnyXCoordinate) - BUNNY_IMG_WIDTH / 2,
            BUNNY_IMG_MARGIN_TOP, BUNNY_IMG_WIDTH, BUNNY_IMG_HEIGHT);
    }
    function drawBunnyAll(ctx, bunnyXCoordinate, velocity) {
        ctx.clearRect(0, 0, bunnyBackground.canvasWidth, bunnyBackground.canvasHeight);
        ctx.drawImage(bunnyBackground.canvasElement, 0, 0);
        drawBunny(ctx, bunnyXCoordinate, velocity);
    }
    function bunnyRun() {

        function draw() {
            drawSplineAll(splineCtx);
            drawBunnyPoint();
            drawBunnyAll(bunnyCtx, currentSegmentBunnyXCoordinateOffset + bunnyXCoordinateTotal,
                knots.averageVelocities[currentVelIndex]);
        }
        currentSegmentBunnyXCoordinateOffset = knots.averageVelocities[currentVelIndex] * currentSegmentBunnyT;
        if (currentSegmentBunnyT + DELTA_T + tTotal > knots.knots[(currentVelIndex + 1)].coordinates.x) {
            currentVelIndex++;
            bunnyXCoordinateTotal = knots.knots[currentVelIndex].coordinates.y;
            tTotal = knots.knots[currentVelIndex].coordinates.x;
            currentSegmentBunnyT = 0;
            if (requestID === null || currentVelIndex + 1 === knots.knots.length) {
                currentSegmentBunnyXCoordinateOffset = 0;
                currentVelIndex--;
                draw();
                requestID = null;
                return;
            }
        }
        draw();
        currentSegmentBunnyT += DELTA_T;
        requestID = window.requestAnimationFrame(bunnyRun);
    }
    function animate() {
        if (requestID !== null) {
            return;
        }
        currentSegmentBunnyT = 0;
        tTotal = knots.knots[0].coordinates.x;
        bunnyXCoordinateTotal = knots.knots[0].coordinates.y;
        currentVelIndex = 0;
        showBunnyPoint = true;
        requestID = window.requestAnimationFrame(bunnyRun);
    }
    function bunnyImgLoaded(e) {
        knots = Knots.create(knotTextBoxElements, splineAxisParams, DISPLAY_DIGITS);
        multiSegmentSpline = MultiSegmentSpline.create(splineCtx, splineBasicShapes, knots.knots, CLOSED,
            {startX: splineAxisParams.splineAxisStartX.x, endX: splineAxisParams.splineAxisEndX.x,
                startY: splineAxisParams.splineAxisStartY.y, endY: splineAxisParams.splineAxisEndY.y},
            Number(tensionElem.value), DRAW_CONTROL_POINTS, null, null, null);
        multiSegmentSpline.updateTension();
        tensionElem.value = multiSegmentSpline.tension.toFixed(DISPLAY_DIGITS);
        drawSplineAll(splineCtx);
        drawBunnyAll(bunnyCtx, knots.knots[0].coordinates.y, knots.averageVelocities[0]);
        splineCanvasElem.addEventListener('mousedown', function(e) { mouseDown(e, false); }, false);
        splineCanvasElem.addEventListener('mousemove', function(e) { mouseMove(e, false); }, false);
        splineCanvasElem.addEventListener('mouseup', function(e) { mouseUp(e, false); }, false);
        splineCanvasElem.addEventListener('mouseleave', function(e) { mouseUp(e, false); }, false);
        splineCanvasElem.addEventListener('touchstart', function(e) { mouseDown(e, true); }, false);
        splineCanvasElem.addEventListener('touchmove', function(e) {mouseMove(e, true); }, false);
        splineCanvasElem.addEventListener('touchend', function (e) { mouseUp(e, true) }, false);
        animateElem.addEventListener('click', animate, false);
        if (e) {
            e.preventDefault();
        }
    }
    function drawSplineBackground() {
        splineBackgroundAdvancedShapes.drawAxis(splineAxisParams.splineAxisStartX, splineAxisParams.splineAxisEndX, LINE_WIDTH, STYLE,
            splineAxisParams.SPLINE_AXIS_ARROWHEADS_X, splineAxisParams.SPLINE_AXIS_LABELS_X,
            splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_X, splineAxisParams.SPLINE_AXIS_MAX_COORDINATE_X,
            AXIS_COORDINATE_STEP, LINE_WIDTH, AXIS_TICK_LENGTH, STYLE, COORDINATE_LABELS_X, false);
        splineBackgroundAdvancedShapes.drawAxis(splineAxisParams.splineAxisStartY, splineAxisParams.splineAxisEndY, LINE_WIDTH, STYLE,
            splineAxisParams.SPLINE_AXIS_ARROWHEADS_Y, splineAxisParams.SPLINE_AXIS_LABELS_Y,
            splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_Y, splineAxisParams.SPLINE_AXIS_MAX_COORDINATE_Y,
            AXIS_COORDINATE_STEP, LINE_WIDTH, -AXIS_TICK_LENGTH, STYLE, COORDINATE_LABELS_Y, false);
    }
    window.addEventListener('load', function() {
        splineCanvasElem = document.getElementById('splineCanvas');
        splineBackgroundCanvasElem = document.getElementById('splineBackgroundCanvas');
        bunnyCanvasElem = document.getElementById('bunnyCanvas');
        splineCtx = splineCanvasElem.getContext('2d');
        splineBackgroundCtx = splineBackgroundCanvasElem.getContext('2d');
        splineBasicShapes = BasicShapes.create(splineCtx);
        splineAdvancedShapes = AdvancedShapes.create(splineCtx);
        splineBackgroundAdvancedShapes = AdvancedShapes.create(splineBackgroundCtx);
        bunnyCtx = bunnyCanvasElem.getContext('2d');
        knotTextBoxElements.push({x: document.getElementById('t1'), y: document.getElementById('x1')});
        knotTextBoxElements.push({x: document.getElementById('t2'), y: document.getElementById('x2')});
        knotTextBoxElements.push({x: document.getElementById('t3'), y: document.getElementById('x3')});
        knotTextBoxElements.push({x: document.getElementById('t4'), y: document.getElementById('x4')});
        tensionElem = document.getElementById('tension');
        animateElem = document.getElementById('animate');
        splineCanvasWidth = splineCanvasElem.width;
        splineCanvasHeight = splineCanvasElem.height;
        splineAxisParams.SPLINE_AXIS_RANGE_X = splineAxisParams.SPLINE_AXIS_MAX_COORDINATE_X -
            splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_X;
        splineAxisParams.SPLINE_AXIS_RANGE_Y = splineAxisParams.SPLINE_AXIS_MAX_COORDINATE_Y -
            splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_Y;
        splineAxisParams.splineAxisStartX = {x: splineAxisParams.SPLINE_AXIS_MARGINS,
            y: splineCanvasHeight / 2};
        splineAxisParams.splineAxisEndX = {x: splineCanvasWidth - splineAxisParams.SPLINE_AXIS_MARGINS,
            y: splineCanvasHeight / 2};
        splineAxisParams.splineAxisStartY = {x: splineCanvasWidth / 2, y: splineCanvasHeight -
            splineAxisParams.SPLINE_AXIS_MARGINS};
        splineAxisParams.splineAxisEndY = {x: splineCanvasWidth / 2, y: splineAxisParams.SPLINE_AXIS_MARGINS};
        splineAxisParams.splineAxisLengthX = splineCanvasWidth - splineAxisParams.SPLINE_AXIS_MARGINS * 2;
        splineAxisParams.splineAxisLengthY = splineCanvasHeight - splineAxisParams.SPLINE_AXIS_MARGINS * 2;
        splineAxisParams.splineAxisCoordinatesScalarX = splineAxisParams.SPLINE_AXIS_RANGE_X /
            splineAxisParams.splineAxisLengthX;
        splineAxisParams.splineAxisCoordinatesScalarY = splineAxisParams.SPLINE_AXIS_RANGE_Y /
            splineAxisParams.splineAxisLengthY;
        DELTA_T = (splineAxisParams.SPLINE_AXIS_RANGE_X / 60) / MAX_ANIMATION_TIME;
        drawSplineBackground();
        bunnyBackground = BunnyBackground.create(document.getElementById('bunnyBackgroundCanvas'));
        bunnyLeftImg.addEventListener('load', function () {
            bunnyImgLoaded();
        }, false);
        bunnyRightImg.addEventListener('load', function () {
            bunnyLeftImg.src = BUNNY_LEFT_SRC;
        }, false);
        bunnyRightImg.src = BUNNY_RIGHT_SRC;
    }, false);
}());