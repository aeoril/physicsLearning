// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// MultiSegmentSpline.js - models and draws a multi-segment spline

var MultiSegmentSpline = {
    create: function(context, basicShapes, knots, closed, boundingParams, defaultTension, drawControlPoints,
                     segmentParams, knotParams, controlLineParams) {
        'use strict';

        return Object.create(multiSegmentSplinePrototype).init(context, basicShapes, knots, closed,
            boundingParams, defaultTension, drawControlPoints, segmentParams, knotParams, controlLineParams);
    }
};
// Set shared properties using prototype object
var multiSegmentSplinePrototype = {
    init: function(context, basicShapes, knots, closed, boundingParams, defaultTension, drawControlPoints,
                   segmentParams, knotParams, controlLineParams) {
        'use strict';

        this.context = context;
        this.basicShapes = basicShapes || BasicShapes.create(context);
        this.knots = knots;
        this.closed = closed;
        this.boundingParams = boundingParams || {startX: 0, endX: 0, startY: 0, endY: 0};
        this.defaultTension = defaultTension;
        this.tension = defaultTension;
        this.TENSION_LIMIT_DIVISOR = 4;
        this.drawControlPoints = drawControlPoints;
        this.segmentParams = segmentParams || {lineWidth: 4, segmentStrokeStyles:
            ['rgb(128, 209, 99)', 'rgb(231, 109, 128)', 'rgb(74, 158, 139)', 'rgb(245, 165, 115)']};
        this.knotParams = knotParams ||
            {minKnotDelta: 1, radius: 2.5, fillStyle: 'rgb(0, 0, 0', strokeStyle: 'rbg(0, 0, 0)'};
        this.controlLineParams = controlLineParams ||
            {lineWidth: 1, radius: 1.5, fillStyle: 'rgb(0, 0, 0', strokeStyle: 'rbg(0, 0, 0)'};
        return this;
    },
    updateTension: function() {
        var i,
            limit;

        this.tension = this.defaultTension;

        for (i = 0; i < this.knots.length - 1; i++) {
            limit = (this.knots[i + 1].x - this.knots[i].x) / this.TENSION_LIMIT_DIVISOR;
            if (limit < this.tension) {
                this.tension = limit;
            }
        }
    },
    setClosestKnotIndex: function(point) {
        var i;

        this.closestKnotIndex = 0;

        for (i = 0; i < this.knots.length - 1; i++) {
            if (mathBasics.calcDistance(this.knots[this.closestKnotIndex], point) >
                mathBasics.calcDistance(this.knots[i + 1], point)) {
                this.closestKnotIndex = i + 1;
            }
        }
    },
    knotInBounds: function(value, lowerBound, upperBound) {
        'use strict';
        if (value - this.knotParams.minKnotDelta <= lowerBound) {
            return false;
        } else if (value + this.knotParams.minKnotDelta >= upperBound) {
            return false;
        }
        return true;
    },
    changeX: function(x, closestKnotIndex) {
        'use strict';

        var maxKnotIndex = this.knots.length - 1;

        if (closestKnotIndex === 0) {
            return false;
        } else if (closestKnotIndex === 1 &&
            this.knotInBounds(x, this.boundingParams.startX, this.knots[2].x)) {
            return true;
        } else if (closestKnotIndex === maxKnotIndex &&
            this.knotInBounds(x, this.knots[this.knots.length - 2].x, this.boundingParams.endX)) {
            return true;
        } else if (closestKnotIndex > 1 && closestKnotIndex < maxKnotIndex &&
            this.knotInBounds(x, this.knots[closestKnotIndex - 1].x, this.knots[closestKnotIndex + 1].x)) {
            return true;
        }
        return false;
    },
    setKnot: function(point) {
        'use strict';

        if (this.changeX(point.x, this.closestKnotIndex)) {
            this.knots[this.closestKnotIndex].x = point.x;
            this.updateTension();
        }
        if (point.y <= this.boundingParams.startY && point.y >= this.boundingParams.endY) {
            this.knots[this.closestKnotIndex].y = point.y;
        }
    },
    calcControlPoints: function(prevKnot, currentKnot, nextKnot) {
        'use strict';

        var workingTension = this.tension / 100;

        var distancePC = mathBasics.calcDistance(prevKnot, currentKnot),
            distanceCN = mathBasics.calcDistance(currentKnot, nextKnot),
            fractionPC = workingTension * distancePC / (distancePC + distanceCN),
            fractionCN = workingTension - fractionPC,
            controlPointPrev2 = {x: currentKnot.x + fractionPC * (prevKnot.x - nextKnot.x),
                y: currentKnot.y + fractionPC * (prevKnot.y - nextKnot.y)},
            controlPointCurr1 = {x: currentKnot.x - fractionCN * (prevKnot.x - nextKnot.x),
                y: currentKnot.y - fractionCN * (prevKnot.y - nextKnot.y)};

        return {prev2: controlPointPrev2, curr1: controlPointCurr1};
    },
    drawControlLine: function(knot, controlPoint) {
        'use strict';

        this.context.save();
        this.context.beginPath();
        this.context.lineWidth = this.controlLineParams.lineWidth;
        this.context.strokeStyle = this.controlLineParams.strokeStyle;
        this.context.moveTo(knot.x, knot.y);
        this.context.lineTo(controlPoint.x, controlPoint.y);
        this.context.closePath();
        this.context.stroke();
        this.basicShapes.drawPoint(controlPoint, this.controlLineParams.radius,
            this.controlLineParams.strokeStyle, this.controlLineParams.fillStyle);
        this.context.restore();
    },
    drawInnerSegment: function(knot1, knot2, previousKnot, segmentColor) {
        'use strict';

        this.context.save();
        this.context.lineWidth = this.segmentParams.lineWidth;
        this.context.strokeStyle = segmentColor;
        this.context.beginPath();
        this.context.moveTo(knot1.x, knot1.y);
        this.context.bezierCurveTo(knot1.cp1.x, knot1.cp1.y,
            knot1.cp2.x, knot1.cp2.y,
            knot2.x, knot2.y);
        this.context.stroke();
        this.context.closePath();
        this.context.restore();
        if (this.drawControlPoints) {
            this.drawControlLine(knot1, knot1.cp1);
            this.drawControlLine(knot1, previousKnot.cp2);
        }
    },
    drawEndSegment: function(endKnot, innerKnot, cp, cpKnot, prevKnot, color) {
        'use strict';

        this.context.save();
        this.context.lineWidth = this.segmentParams.lineWidth;
        this.context.strokeStyle=color;
        this.context.beginPath();
        this.context.moveTo(endKnot.x, endKnot.y);
        this.context.quadraticCurveTo(cp.x, cp.y, innerKnot.x, innerKnot.y);
        this.context.stroke();
        //this.context.closePath();
        this.context.restore();
        if (this.drawControlPoints) {
            this.drawControlLine(cpKnot, cpKnot.cp1);
            this.drawControlLine(cpKnot, prevKnot.cp2);
        }
    },
    draw: function(){
        'use strict';

        var lastIndex = this.knots.length - 1;

        this.knots.forEach(function (knot, index, array) {
            var prevKnot = index === 0 ? array[array.length - 1] : array[index - 1],
                nextKnot = array[(index + 1) % array.length],
                controlPoints = this.calcControlPoints(prevKnot, knot, nextKnot);
            prevKnot.cp2 = controlPoints.prev2;
            knot.cp1 = controlPoints.curr1;
        }, this);
        this.knots.forEach(function (knot, index, array) {
            var prevKnot = index === 0 ? array[array.length - 1] : array[index - 1],
                nextKnot = array[(index + 1) % array.length];
            if (!this.closed && (index === 0 || index >= array.length - 2)) {
                return;
            }
            this.drawInnerSegment(knot, nextKnot, prevKnot,
                this.segmentParams.segmentStrokeStyles[index]);
        }, this);
        if (!this.closed) {
            this.drawEndSegment(this.knots[0], this.knots[1], this.knots[0].cp2, this.knots[0],
                this.knots[lastIndex], this.segmentParams.segmentStrokeStyles[0]);
            this.drawEndSegment(this.knots[lastIndex], this.knots[lastIndex - 1],
                this.knots[lastIndex - 1].cp1, this.knots[lastIndex - 1],
                this.knots[lastIndex - 2], this.segmentParams.segmentStrokeStyles[lastIndex - 1]);
        }
        if (this.drawControlPoints) {
            this.drawControlLine(this.knots[lastIndex], this.knots[lastIndex].cp1);
            this.drawControlLine(this.knots[lastIndex], this.knots[lastIndex - 1].cp2);
        }
        this.knots.forEach(function(knot) {
            this.basicShapes.drawPoint(knot, this.knotParams.radius, this.knotParams.strokeStyle,
                this.knotParams.fillStyle);
        }, this);
    }
};