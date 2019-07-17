// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// BasicShapes.js - 1 motion: displacement and time interactive lesson

var BasicShapes = {
    create: function(context) {
        'use strict';

        return Object.create(basicShapesPrototype).init(context);
    },
    drawPoint: function(context, point, radius, strokeStyle, fillStyle, lineWidth) {
        'use strict';

        return this.create(context).drawPoint(point, radius, strokeStyle, fillStyle, lineWidth);
    }
};

var basicShapesPrototype = {
    init: function(context) {
        'use strict';

        this.context = context;
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