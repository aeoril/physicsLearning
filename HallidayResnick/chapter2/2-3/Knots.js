// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// hallidayResnick-2-3.js - 1 motion: displacement and time interactive lesson

var Knots = {
    create: function(textBoxElements, splineAxisParams, displayDigits) {
        'use strict';

        return Object.create(knotsPrototype).init(textBoxElements, splineAxisParams, displayDigits);
    }
};
// Set shared properties using prototype object
var knotsPrototype = {
    init: function(textBoxElementsArray, splineAxisParams, displayDigits) {
        'use strict';

        this.textBoxElementsArray = textBoxElementsArray;
        this.splineAxisParams = splineAxisParams;
        this.displayDigits = displayDigits;
        this.knots = [];
        this.textBoxElementsArray.forEach(function(textBoxElements, index) {
            this.knots.push({coordinates: {x: Number(textBoxElements.x.value),
                y: Number(textBoxElements.y.value)}});
            this.knots[index].x = this.calcSplineX(this.knots[index].coordinates.x);
            this.knots[index].y = this.calcSplineY(this.knots[index].coordinates.y)
        }, this);
        this.updateAverageVelocities();
        return this;
    },
    calcSplineX: function(xCoordinate) {
        return this.splineAxisParams.splineAxisStartX.x +
            (xCoordinate - this.splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_X) /
                this.splineAxisParams.splineAxisCoordinatesScalarX;
    },
    calcSplineY: function(yCoordinate) {
        return this.splineAxisParams.splineAxisStartY.y -
            (yCoordinate - this.splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_Y) /
                this.splineAxisParams.splineAxisCoordinatesScalarY;
    },
    calcSplineXCoordinate: function(x) {
        return ((x - this.splineAxisParams.splineAxisStartX.x) *
            this.splineAxisParams.splineAxisCoordinatesScalarX) + this.splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_X;
    },
    calcSplineYCoordinate: function(y) {
        return ((this.splineAxisParams.splineAxisStartY.y - y)  *
            this.splineAxisParams.splineAxisCoordinatesScalarY) + this.splineAxisParams.SPLINE_AXIS_MIN_COORDINATE_Y;
    },
    updateKnotCoordinateValues: function() {
        this.knots.forEach(function (knot) {
            knot.coordinates = {x: this.calcSplineXCoordinate(knot.x),
                y: this.calcSplineYCoordinate(knot.y)};
        }, this);
    },
    updateTextBoxes: function() {
        this.textBoxElementsArray.forEach(function(textBoxElements, index) {
            textBoxElements.x.value = this.knots[index].coordinates.x.toFixed(this.displayDigits);
            textBoxElements.y.value = this.knots[index].coordinates.y.toFixed(this.displayDigits);
        }, this);
    },
    updateAverageVelocities: function () {
        var i;
        this.averageVelocities = [];
        function calculateVelocity(p1, p2) {
            return (p2.y - p1.y) / (p2.x - p1.x);
        }
        for (i = 0; i < this.knots.length - 1; i++) {
            this.averageVelocities.push(calculateVelocity(this.knots[i].coordinates, this.knots[i + 1].coordinates));
        }
    }
};
