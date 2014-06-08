// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// hallidayResnick-2-3.js - 1 motion: displacement and time interactive lesson

(function () {
    'use strict';

    var SCALAR = 20,
        BUNNY_SCALAR = 20,
        FONT = 'normal 8pt TimesNewRoman',
        NAME_FONT = 'normal 12pt TimesNewRoman',
        TICK_LENGTH = 5,
        CLOSEST_X = 220,
        AXIS_OFFSET = 40,
        AXIS_OFFSET_LEFT,
        AXIS_OFFSET_RIGHT,
        AXIS_OFFSET_TOP,
        AXIS_OFFSET_BOTTOM,
        AXIS_CLOSEST_X = 20,
        AXIS_CLOSEST_Y = 80,
        BUNNY_AXIS_OFFSET_LEFT,
        BUNNY_AXIS_OFFSET_RIGHT,
        BUNNY_AXIS_OFFSET_BOTTOM,
        AXIS_MARGIN = 10,
        BUNNY_AXIS_MARGIN = (960 - 720) / 2,
        bunnyXScalar,
        BUNNY_IMG_WIDTH = 48,
        BUNNY_IMG_HEIGHT = 48,
        BUNNY_IMG_OFFSET_TOP = 5,
        stepX,
        stepY,
        bunnyStep,
        MARKER_TEXT_OFFSET_X = 5,
        MARKER_TEXT_OFFSET_Y = 15,
        MARKER_TEXT_OFFSET_Y_H = 4,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        BLACK_COLOR = 'rgb(0, 0, 0)',
        SHOW_DETAILS = true,
        CLOSED = false,
        pts,
        mouseIsDown = false,
        mousePoint = 0,
        mousePos = {},
        splineCanvasElem,
        bunnyCanvasElem,
        bunnyImg = new Image(),
        formElem,
        x1Elem,
        y1Elem,
        x2Elem,
        y2Elem,
        x3Elem,
        y3Elem,
        x4Elem,
        y4Elem,
        tElem,
        animateElem,
        t,
        splineCtx,
        bunnyCtx,
        width,
        height,
        splineAxisCoordsScalarX,
        splineAxisCoordsScalarY,
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
        var delta = {x: point2.x - point1.x, y: point2.y - point1.y};
        return Math.sqrt(delta.x * delta.x + delta.y * delta.y);
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
        ctx.arc(knot.x, knot.y, r, 0.0, 2*Math.PI, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    function getControlPoints(prevKnot, currentKnot, nextKnot, t){
        //  knot1 and knot2 are the end (knot) pts of this segment
        //  knot3 is the next knot -- not connected here but needed to calculate controlPoint2
        //  controlPoint1 is the control point calculated here, from knot1 back toward knot0.
        //  controlPoint2 is the next control point, calculated here and returned to become the
        //  next segment's controlPoint1.
        //  t is the 'tension' which controls how far the control points spread.

        //  Scaling factors: distances from this knot to the previous and following knots.
        var distancePC= calcDistance(prevKnot, currentKnot),
            distanceCN = calcDistance(currentKnot, nextKnot),
            fractionPC = t * distancePC / (distancePC + distanceCN),
            fractionCN = t - fractionPC,
            controlPointPrev2 = {x: currentKnot.x + fractionPC * (prevKnot.x - nextKnot.x),
                y: currentKnot.y + fractionPC * (prevKnot.y - nextKnot.y)},
            controlPointCurr1 = {x: prevKnot.x - fractionCN * (prevKnot.x - nextKnot.x),
                y: currentKnot.y - fractionCN * (prevKnot.y - nextKnot.y)};

        return {prev2: controlPointPrev2, curr1: controlPointCurr1};
    }
    function drawControlLine(ctx, knot, controlPoint, color){
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.moveTo(knot.x, knot.y);
        ctx.lineTo(controlPoint.x, controlPoint.y);
        ctx.closePath();
        ctx.stroke();
        drawPoint(ctx, controlPoint, 1.5, ctx.strokeStyle, ctx.strokeStyle);
        ctx.restore();
    }
    function drawInnerSegment(ctx, knot1, knot2, showControlPoints) {
        ctx.strokeStyle = knot1.color;
        ctx.beginPath();
        ctx.moveTo(knot1.x, knot2.y);
        ctx.bezierCurveTo(knot1.cp1.x, knot1.cp1.y, knot1.cp2.x, knot1.cp2.y,
            knot2.x, knot2.y);
        ctx.stroke();
        ctx.closePath();
        if(showControlPoints){
            drawControlLine(ctx, knot1, knot1.cp1, BLACK_COLOR);
            drawControlLine(ctx, knot1, knot1.cp2, BLACK_COLOR);
        }
    }
    function drawEndSegment(ctx, endKnot, innerKnot, color, showControlPoints) {
        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.moveTo(endKnot.x, endKnot.y);
        ctx.quadraticCurveTo(innerKnot.cp2.x, innerKnot.cp2.y, innerKnot.x, innerKnot.y);
        ctx.stroke();
        ctx.closePath();
        if(showControlPoints){
            drawControlLine(ctx, innerKnot, innerKnot.cp1, BLACK_COLOR);
            drawControlLine(ctx, innerKnot, innerKnot.cp2, BLACK_COLOR);
        }
    }
    function drawSpline(ctx, knots, closed, drawControlPoints){
        var lastIndex = knots.length - 1;

        ctx.save();
        ctx.lineWidth=4;
        knots.forEach(function (knot, index, array) {
            var prevKnot = index === 0 ? array[array.length - 1] : array[index - 1],
                nextKnot = array[(index + 1) % array.length],
                controlPoints = getControlPoints(prevKnot, knot, nextKnot);
            prevKnot.cp2 = controlPoints.prev2;
            knot.cp1 = controlPoints.curr1;
        });
        knots.forEach(function (knot, index, array) {
            var nextKnot = array[(index + 1) % array.length];
            if (!closed && index === 1 || index === array.length) {
                return;
            }
            drawInnerSegment(ctx, knot, nextKnot, drawControlPoints);
        });
        if (!closed) {
            drawEndSegment(knots[0], knots[1], knots[0].color, drawControlPoints);
            drawEndSegment(knots[lastIndex], knots[lastIndex - 1],
                knots[lastIndex - 1].color, drawControlPoints);
        }
        knots.forEach(function(knot) {
            drawPoint(ctx, knot, 2.5, "rgb(0, 0, 0)", "rgb(255, 255, 0)");
        });
        ctx.restore();
    }

// *******************************************************************************************
// End Rob Spencer Code from http://scaledinnovation.com/analytics/splines/aboutSplines.html
// Heavily refactored by QuarksCode
// *******************************************************************************************

    function drawArrow(p1, p2, text) {
        var length = calcDistance(p1.x, p1.y, p2.x, p2.y),
            angle = Math.atan2(p2.y - p1.y, p2.x - p1.x),
            end = {x: length, y: 0};
        splineCtx.save();
        splineCtx.font = NAME_FONT;
        splineCtx.strokeStyle = BLACK_COLOR;
        splineCtx.fillStyle = BLACK_COLOR;
        splineCtx.lineWidth = 1;
        splineCtx.translate(p1.x, p1.y);
        splineCtx.rotate(angle);
        splineCtx.beginPath();
        splineCtx.moveTo(0, 0);
        splineCtx.lineTo(end.x, end.y);
        splineCtx.lineTo(end.x - ARROWHEAD_LENGTH, end.y + ARROWHEAD_WIDTH / 2);
        splineCtx.lineTo(end.x - ARROWHEAD_LENGTH, end.y - ARROWHEAD_WIDTH / 2);
        splineCtx.lineTo(end.x, end.y);
        splineCtx.stroke();
        splineCtx.fill();
        splineCtx.fillText(text, end.x / 2 - splineCtx.measureText(text).width / 2, end.y - MARKER_TEXT_OFFSET_X);
        splineCtx.restore();
    }
    function drawBunny(x) {
        bunnyCtx.drawImage(bunnyImg, x + BUNNY_AXIS_OFFSET_LEFT - BUNNY_IMG_WIDTH / 2, BUNNY_IMG_OFFSET_TOP, BUNNY_IMG_WIDTH, BUNNY_IMG_HEIGHT);
    }
    function drawAxis(ctx, start, end, offset, name, step, isHorizontal, scalar) {
        var i,
            numTicks = Math.abs((end - start) / step),
            posStart = {},
            posEnd = {},
            text,
            textStart = {},
            textWidth,
            temp;
        step = end - start >= 0 ? step : -step;
        ctx.save();
        ctx.strokeStyle = BLACK_COLOR;
        ctx.fillStyle = BLACK_COLOR;
        ctx.font = FONT;
        ctx.beginPath();
        if (isHorizontal) {
            ctx.moveTo(start, offset);
            ctx.lineTo(end, offset);
        } else {
            ctx.moveTo(offset, start);
            ctx.lineTo(offset, end);
        }
        ctx.stroke();
        for (i = 1; i < numTicks; i++) {
            temp = start + i * step;
            posStart.x = (isHorizontal ? temp : offset);
            posStart.y = (!isHorizontal ? temp : offset);
            posEnd.x = (isHorizontal ? posStart.x : posStart.x + TICK_LENGTH);
            posEnd.y = (!isHorizontal ? posStart.y : posStart.y - TICK_LENGTH);
            ctx.beginPath();
            ctx.moveTo(posStart.x, posStart.y);
            ctx.lineTo(posEnd.x, posEnd.y);
            ctx.stroke();
            text = String(i * scalar / 10);
            textWidth = ctx.measureText(text).width;
            textStart.x = posStart.x - (isHorizontal ? textWidth / 2 : textWidth + MARKER_TEXT_OFFSET_X);
            textStart.y = posStart.y + (isHorizontal ? MARKER_TEXT_OFFSET_Y : MARKER_TEXT_OFFSET_Y_H);
            ctx.fillText(text, textStart.x, textStart.y);
        }
        textWidth = ctx.measureText(name).width;
        textStart.x = isHorizontal ? start + (end - start - textWidth) / 2 : offset - (textWidth + MARKER_TEXT_OFFSET_X * 5);
        textStart.y = isHorizontal ? offset + MARKER_TEXT_OFFSET_Y * 2 : end + Math.abs(end - start) / 2;
        ctx.font = NAME_FONT;
        ctx.fillText(name, textStart.x, textStart.y);
        ctx.restore();
    }
    function draw() {
        splineCtx.clearRect(0, 0, splineCanvasElem.width, splineCanvasElem.height);
        drawAxis(splineCtx, AXIS_OFFSET_LEFT, AXIS_OFFSET_RIGHT, AXIS_OFFSET_BOTTOM, 't', stepX, true, SCALAR);
        drawAxis(splineCtx, AXIS_OFFSET_BOTTOM, AXIS_OFFSET_TOP, AXIS_OFFSET_LEFT, 'x', stepY, false, SCALAR);
        drawSpline();
        drawArrow({x: pts[0], y: pts[1]}, {x: pts[2], y: pts[3]}, 'Avg Vel  ' + avgVels[0].toFixed(3));
        drawArrow({x: pts[2], y: pts[3]}, {x: pts[4], y: pts[5]}, 'Avg Vel  ' + avgVels[1].toFixed(3));
        drawArrow({x: pts[4], y: pts[5]}, {x: pts[6], y: pts[7]}, 'Avg Vel  ' + avgVels[2].toFixed(3));
    }
    function drawBunnyAll() {
        bunnyCtx.clearRect(0, 0, splineCanvasElem.width, splineCanvasElem.height);
        drawBunny((AXIS_OFFSET_BOTTOM - pts[1]) * bunnyXScalar);
        drawAxis(bunnyCtx, BUNNY_AXIS_OFFSET_LEFT, BUNNY_AXIS_OFFSET_RIGHT, BUNNY_AXIS_OFFSET_BOTTOM, 'x', bunnyStep, true, BUNNY_SCALAR);
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
    function calcClosestPoint() {
        var i;

        mousePoint = 0;

        for (i = 0; i < pts.length - 2; i += 2) {
           if (calcDistance(pts[i], pts[i + 1], mousePos.x, mousePos.y) >
               calcDistance(pts[i + 2], pts[i + 3], mousePos.x, mousePos.y)) {
               mousePoint = i + 2;
           }
        }
    }
    function updateTextBoxes() {
        function calcTDisplayVal(t) {
            return ((t - AXIS_OFFSET) * splineAxisCoordsScalarX).toFixed(4);
        }
        function calcXDisplayVal(x) {
            return ((height - (x + AXIS_OFFSET))  * splineAxisCoordsScalarY).toFixed(4);
        }
        x1Elem.value = calcTDisplayVal(pts[0]);
        y1Elem.value = calcXDisplayVal(pts[1]);
        x2Elem.value = calcTDisplayVal(pts[2]);
        y2Elem.value = calcXDisplayVal(pts[3]);
        x3Elem.value = calcTDisplayVal(pts[4]);
        y3Elem.value = calcXDisplayVal(pts[5]);
        x4Elem.value = calcTDisplayVal(pts[6]);
        y4Elem.value = calcXDisplayVal(pts[7]);
            }
    function updateAvgVels() {
        function calcVel(p1, p2) {
            return (p2.x - p1.x) / (p2.t - p1.t);
        }
        avgVels[0] = calcVel({t: Number(x1Elem.value), x: Number(y1Elem.value)},
            {t: Number(x2Elem.value), x: Number(y2Elem.value)});
        avgVels[1] = calcVel({t: Number(x2Elem.value), x: Number(y2Elem.value)},
            {t: Number(x3Elem.value), x: Number(y3Elem.value)});
        avgVels[2] = calcVel({t: Number(x3Elem.value), x: Number(y3Elem.value)},
            {t: Number(x4Elem.value), x: Number(y4Elem.value)});
    }
    function mouseMove(e) {

        var posText,
            posTextWidth,
            posTextHeight = 7,
            posTextX,
            posTextY;

        calcMousePos(e);

        if (mousePos.x > width) {
            mousePos.x = width;
        }
        if (mousePos.y > height) {
            mousePos.y = height;
        }
        if (mouseIsDown) {
            if (mousePoint !== 0 &&
                ((mousePoint === pts.length - 2 &&
                  (mousePos.x >= pts[mousePoint - 2] + CLOSEST_X && mousePos.x <= AXIS_OFFSET_RIGHT)) ||
                 ((mousePos.x >= pts[mousePoint - 2] + CLOSEST_X && mousePos.x < pts[mousePoint + 2] - CLOSEST_X) &&
                  (mousePos.x >= AXIS_OFFSET_LEFT + AXIS_CLOSEST_X && mousePos.x <= AXIS_OFFSET_RIGHT - AXIS_CLOSEST_X)))) {
                pts[mousePoint] = mousePos.x;
            }
            if (((mousePoint === 0 || mousePoint === pts.length - 2) &&
                 mousePos.y <= AXIS_OFFSET_BOTTOM && mousePos.y >= AXIS_OFFSET_TOP) ||
                (mousePos.y <= AXIS_OFFSET_BOTTOM - AXIS_CLOSEST_Y && mousePos.y >= AXIS_OFFSET_TOP + AXIS_CLOSEST_Y)) {
                pts[mousePoint + 1] = mousePos.y;
            }
        }
        updateTextBoxes();
        updateAvgVels();
        draw();
        if (mousePoint === 0 && mouseIsDown) {
            drawBunnyAll();
        }
        posText = '{' + mousePos.x + ',' + mousePos.y + ')';
        posTextWidth = splineCtx.measureText(posText).width;
        posTextX = mousePos.x;
        posTextY = mousePos.y;
        if (mousePos.x + posTextWidth > width) {
            posTextX = mousePos.x - (posTextWidth - (width - mousePos.x));
        }

        if (mousePos.y - posTextHeight < 0) {
            posTextY = mousePos.y + (posTextHeight - mousePos.y);
        }
        splineCtx.fillText(posText,  posTextX, posTextY);
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
            return Number(tElem.value) / splineAxisCoordsScalarX + AXIS_OFFSET;
        }
        function calcXPoint(xElem) {
            return height - (Number(xElem.value) / splineAxisCoordsScalarY + AXIS_OFFSET);
        }
        pts = [];
        pts.push(calcTPoint(x1Elem));
        pts.push(calcXPoint(y1Elem));
        pts.push(calcTPoint(x2Elem));
        pts.push(calcXPoint(y2Elem));
        pts.push(calcTPoint(x3Elem));
        pts.push(calcXPoint(y3Elem));
        pts.push(calcTPoint(x4Elem));
        pts.push(calcXPoint(y4Elem));
        t = Number(tElem.value) / 100;
        updateAvgVels();
        updateTextBoxes();
        draw();
        drawBunnyAll();
        if (e) {
            e.preventDefault();
        }
    }
    function bunnyRun() {
        var bunnyX;

        bunnyX = avgVels[currentVelIndex] * delT * splineAxisCoordsScalarRatio + bunnyXTotal;
        bunnyCtx.clearRect(0, 0, bunnyWidth, bunnyHeight);
        drawAxis(bunnyCtx, BUNNY_AXIS_OFFSET_LEFT, BUNNY_AXIS_OFFSET_RIGHT, BUNNY_AXIS_OFFSET_BOTTOM, 'x', bunnyStep, true, BUNNY_SCALAR);
        drawBunny(bunnyX * bunnyXScalar);
        delT++;
        if (delT + delTTotal > pts[(currentVelIndex + 1) * 2] - AXIS_OFFSET_LEFT) {
            bunnyXTotal += avgVels[currentVelIndex] * (delT - 1) * splineAxisCoordsScalarRatio;
            currentVelIndex++;
            delTTotal += delT - 1;
            delT = 1;
            if (currentVelIndex + 1 === pts.length / 2) {
                //window.cancelAnimationFrame(requestID);
                return;
            }
        }
        window.requestAnimationFrame(bunnyRun);
    }
    function animate() {
        delT = 0;
        delTTotal = 0;
        bunnyXTotal = AXIS_OFFSET_BOTTOM - pts[1];
        currentVelIndex = 0;
        requestID = window.requestAnimationFrame(bunnyRun);
    }
    window.addEventListener('load', function() {
        splineCanvasElem = document.getElementById('splineCanvas');
        bunnyCanvasElem = document.getElementById('bunnyCanvas');
        formElem = document.getElementById('form');
        splineCtx = splineCanvasElem.getContext('2d');
        bunnyCtx = bunnyCanvasElem.getContext('2d');
        x1Elem = document.getElementById('x1');
        y1Elem = document.getElementById('y1');
        x2Elem = document.getElementById('x2');
        y2Elem = document.getElementById('y2');
        x3Elem = document.getElementById('x3');
        y3Elem = document.getElementById('y3');
        x4Elem = document.getElementById('x4');
        y4Elem = document.getElementById('y4');
        tElem = document.getElementById('t');
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
        splineAxisCoordsScalarX = (width / (AXIS_OFFSET_RIGHT - AXIS_OFFSET_LEFT)) / SCALAR;
        splineAxisCoordsScalarY = (height / (AXIS_OFFSET_BOTTOM - AXIS_OFFSET_TOP)) / SCALAR;
        splineAxisCoordsScalarRatio = splineAxisCoordsScalarX / splineAxisCoordsScalarY;
        bunnyAxisCoordsScalar = (bunnyWidth / (BUNNY_AXIS_OFFSET_RIGHT - BUNNY_AXIS_OFFSET_LEFT)) / BUNNY_SCALAR;
        bunnyXScalar = (BUNNY_AXIS_OFFSET_RIGHT - BUNNY_AXIS_OFFSET_LEFT) / (AXIS_OFFSET_BOTTOM - AXIS_OFFSET_TOP);
        stepX = 2 / splineAxisCoordsScalarX;
        stepY = 2 / splineAxisCoordsScalarY;
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
        x1Elem.focus();
    }, false);
}());