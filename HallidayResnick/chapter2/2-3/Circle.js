// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

var Circle = {
    create: function (context, params) {
        'use strict';
        return Object.create(circlePrototype).init(context, params);
    },
    draw: function (context, params) {
        'use strict';
        return this.create(context, params).draw();
    }
};

var circlePrototype = {
    init: function (context, params) {
        'use strict';
        this.context = context;
        this.params = params || {
            point: {
                x: 20,
                y: 20
            },
            radius: 2.5,
            strokeStyle: 'rgb(0, 0, 0)',
            fillStyle: 'rgb(0, 0, 0)',
            lineWidth: 0
        };
        return this;
    },
    draw: function () {
        'use strict';
        var startAngle = 0.0,
            endAngle = 2 * Math.PI,
            clockWise = false;
        this.context.save();
        this.context.beginPath();
        this.context.lineWidth = this.params.lineWidth;
        this.context.strokeStyle = this.params.strokeStyle;
        this.context.fillStyle = this.params.fillStyle;
        this.context.arc(this.params.point.x, this.params.point.y, this.params.radius, startAngle, endAngle, clockWise);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
        this.context.restore();
        return this;
    }
};