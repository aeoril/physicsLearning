// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

var Circle = {
    create: function (params) {
        'use strict';
        return Object.create(circlePrototype).init(params);
    },
    drawPoint: function(params) {
        'use strict';
        return this.create(params).drawPoint();
    }
};

var basicShapesPrototype = {
    init: function (params) {
        'use strict';
        params = params || {
            context: null,
            point: {
                x: 0,
                y: 0
            },
            radius: 1,
            strokeStyle: 'rgb(0, 0, 0)',
            fillStyle: 'rgb(0, 0, 0)',
            lineWidth: 0
        };
        return this;
    },
    drawPoint: function(point, radius, strokeStyle, fillStyle, lineWidth){
        'use strict';

        var startAngle = 0.0,
            endAngle = 2 * Math.PI,
            clockWise = false;

        this.context.save();
        this.context.beginPath();
        this.context.lineWidth = lineWidth || 1;
        this.context.strokeStyle = strokeStyle || 'rgb(0, 0, 0)';
        this.context.fillStyle = fillStyle || 'rgb(0, 0, 0)';
        this.context.arc(point.x, point.y, radius || 2.5, startAngle, endAngle, clockWise);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.restore();
        return this;
    }
};