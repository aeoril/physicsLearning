// Copyright © 2019 by Xitalogy.  MIT License.  http://opensource.org/licenses/MIT

var BunnyBackground = {
    create: function(canvasElement, axisParams) {
        'use strict';

        return Object.create(bunnyBackgroundPrototype).init(canvasElement, axisParams);
    }
};
// Set shared properties using prototype object
var bunnyBackgroundPrototype = {
    init: function(canvasElement, axisParams) {
        'use strict';

        this.canvasElement = canvasElement;

        this.STYLE = 'rgb(100, 100, 100)';
        this.COORDINATE_FONT = 'normal 10pt "Droid Sans", sans-serif';
        this.AXIS_LABEL_FONT = 'normal 13pt "Droid Sans", sans-serif';
        this.ARROWHEAD_LENGTH = 7;
        this.ARROWHEAD_WIDTH = 5;

        this.axisParams = axisParams || {
            AXIS_MARGINS: 30,
            AXIS_MIN_COORDINATE_X: -10,
            AXIS_MAX_COORDINATE_X: 10,
            TICK_LENGTH: 5,
            LINE_WIDTH: 1,
            COORDINATE_STEP: 2,
            AXIS_LABELS_X: [
                {
                    text: '-x',
                    font: this.AXIS_LABEL_FONT,
                    color: this.STYLE,
                    relativeTo: "start",
                    offset: {x: 20, y: 40},
                    angle: 0,
                    widthMultiplier: 0.5
                },
                {
                    text: '+x',
                    font: this.AXIS_LABEL_FONT,
                    color: this.STYLE,
                    relativeTo: "end",
                    offset: {x: -20, y: 40},
                    angle: 0,
                    widthMultiplier: 0.5
                }
            ],
            COORDINATE_LABELS_X: [
                {
                    text: '',
                    font: this.COORDINATE_FONT,
                    fillStyle: this.STYLE,
                    relativeTo: "start",
                    offset: {x: -20, y: 0},
                    angle: Math.PI / 2,
                    widthMultiplier: 0.5
                }
            ],
            AXIS_ARROWHEADS_X: [
                {
                    arrowHeadLength: this.ARROWHEAD_LENGTH,
                    arrowHeadWidth: this.ARROWHEAD_WIDTH,
                    fill: true,
                    fillStyle: this.STYLE,
                    strokeStyle: this.STYLE,
                    relativeTo: "start",
                    offset: {x: 0, y: 0},
                    angle: 0
                },
                {
                    arrowHeadLength: this.ARROWHEAD_LENGTH,
                    arrowHeadWidth: this.ARROWHEAD_WIDTH,
                    fill: true,
                    fillStyle: this.STYLE,
                    strokeStyle: this.STYLE,
                    relativeTo: "end",
                    offset: {x: 0, y: 0},
                    angle: 0
                }
            ]
        };
        this.axisParams.AXIS_RANGE_X = this.axisParams.AXIS_MAX_COORDINATE_X -
            this.axisParams.AXIS_MIN_COORDINATE_X;
        this.context = this.canvasElement.getContext('2d');

        this.advancedShapes = AdvancedShapes.create(this.context);
        this.canvasWidth = this.canvasElement.width;
        this.canvasHeight = this.canvasElement.height;
        this.axisStartX = {x: this.axisParams.AXIS_MARGINS, y: this.canvasHeight / 2};
        this.axisEndX = {x: this.canvasWidth - this.axisParams.AXIS_MARGINS, y: this.canvasHeight / 2};
        this.axisLengthX = this.canvasWidth - this.axisParams.AXIS_MARGINS * 2;
        this.axisCoordinatesScalarX = this.axisParams.AXIS_RANGE_X / this.axisLengthX;
        this.advancedShapes.drawAxis(this.axisStartX, this.axisEndX, this.axisParams.LINE_WIDTH, this.STYLE,
            this.axisParams.AXIS_ARROWHEADS_X, this.axisParams.AXIS_LABELS_X, this.axisParams.AXIS_MIN_COORDINATE_X,
            this.axisParams.AXIS_MAX_COORDINATE_X, this.axisParams.COORDINATE_STEP, this.axisParams.LINE_WIDTH,
            this.axisParams.TICK_LENGTH, this.STYLE, this.axisParams.COORDINATE_LABELS_X, true);
        return this;
    }
};
