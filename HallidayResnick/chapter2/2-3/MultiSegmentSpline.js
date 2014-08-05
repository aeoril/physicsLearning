// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// MultiSegmentSpline.js - models and draws a multi-segment spline

var MultiSegmentSpline = {
    create: function(context, basicShapes, knots, closed, drawControlLines,
                     segmentStrokeStyles, knotParams, controlLineParams) {
        return Object.create(multiSegmentSplinePrototype).init(context, numberOfSegments);
    },
    calcControlPoints: function(prevKnot, currentKnot, nextKnot, tension) {
        var distancePC = calcDistance(prevKnot, currentKnot),
            distanceCN = calcDistance(currentKnot, nextKnot),
            fractionPC = tension * distancePC / (distancePC + distanceCN),
            fractionCN = tension - fractionPC,
            controlPointPrev2 = {x: currentKnot.x + fractionPC * (prevKnot.x - nextKnot.x),
                y: currentKnot.y + fractionPC * (prevKnot.y - nextKnot.y)},
            controlPointCurr1 = {x: currentKnot.x - fractionCN * (prevKnot.x - nextKnot.x),
                y: currentKnot.y - fractionCN * (prevKnot.y - nextKnot.y)};

        return {prev2: controlPointPrev2, curr1: controlPointCurr1};
    }
};
// Set shared properties using prototype object
var multiSegmentSplinePrototype = {
    init: function(context, basicShapes, knots, closed, drawControlLines,
                   segmentStrokeStyles, knotParams, controlLineParams) {
        this.context = context;
        this.basicShapes = basicShapes || BasicShapes.create(context);
        this.knots = knots;
        this.closed = closed;
        this.drawControlLines = drawControlLines;
        this.segmentStrokeStyles = segmentStrokeStyles
            || ['rgb(128, 209, 99)', 'rgb(231, 109, 128)', 'rgb(74, 158, 139)', 'rgb(245, 165, 115)']
        this.knotParams = knotParams
            || {radius: 2.5, fillStyle: 'rgb(0, 0, 0', strokeStyle: 'rbg(0, 0, 0)'};
        this.controlLineParams = controlLineParams
            || {lineWidth: 1, radius: 1.5, fillStyle: 'rgb(0, 0, 0', strokeStyle: 'rbg(0, 0, 0)'};
    },
    drawControlLine: function(knot, controlPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = this.controlLineParams.lineWidth;
        ctx.strokeStyle = this.controlLineParams.strokeStyle;
        ctx.moveTo(knot.x, knot.y);
        ctx.lineTo(controlPoint.x, controlPoint.y);
        ctx.closePath();
        ctx.stroke();
        this.basicShapes.drawPoint(controlPoint, this.controlLineParams.radius,
            this.controlLineParams.strokeStyle, this.controlLineParams.fillStyle);
        ctx.restore();
    },
    drawInnerSegment: function(knot1Index, knot2Index, previousKnotIndex, drawControlPoints) {
        ctx.strokeStyle = this.segmentStrokeStyles[knot1Index];
        ctx.beginPath();
        ctx.moveTo(knots[knot1Index].x, knots[knot1Index].y);
        ctx.bezierCurveTo(knots[knot1Index].cp1.x, knots[knot1Index].cp1.y,
            knots[knot1Index].cp2.x, knots[knot1Index].cp2.y,
            knots[knot2Index].x, knots[knot2Index].y);
        ctx.stroke();
        ctx.closePath();
        if (drawControlPoints) {
            drawControlLine(ctx, this.knots[knot1Index], this.knots[knot1Index].cp1);
            drawControlLine(ctx, this.knots[knot1Index], this.knots[previousKnotIndex].cp2);
        }
    },
    drawEndSegment: function(ctx, endKnot, innerKnot, cp, cpKnot, prevKnot, color, drawControlPoints) {
        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.moveTo(endKnot.x, endKnot.y);
        ctx.quadraticCurveTo(cp.x, cp.y, innerKnot.x, innerKnot.y);
        ctx.stroke();
        ctx.closePath();
        if (drawControlPoints) {
            drawControlLine(ctx, cpKnot, cpKnot.cp1, COLOR);
            drawControlLine(ctx, cpKnot, prevKnot.cp2, COLOR);
        }
    },
    draw: function(ctx, knots, closed, drawControlPoints){
        var lastIndex = knots.length - 1;

        ctx.save();
        ctx.lineWidth=4;
        knots.forEach(function (knot, index, array) {
            var prevKnot = index === 0 ? array[array.length - 1] : array[index - 1],
                nextKnot = array[(index + 1) % array.length],
                controlPoints = calcControlPoints(prevKnot, knot, nextKnot, tension / 100);
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
        if (drawControlPoints) {
            drawControlLine(ctx, knots[lastIndex], knots[lastIndex].cp1, COLOR);
            drawControlLine(ctx, knots[lastIndex], knots[lastIndex - 1].cp2, COLOR);
        }
        knots.forEach(function(knot) {
            drawPoint(ctx, knot, 2.5, COLOR, KNOT_POINT_FILL_COLOR);
        });
        ctx.restore();
    }
};