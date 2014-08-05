// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// BasicShapes.js - 1 motion: displacement and time interactive lesson

var BasicShapes = {
    create: function(context) {
        return Object.create(basicShapesPrototype).init(context);
    },
    drawPoint: function(context) {
        return this.drawPoint();
    }
};

var basicShapesPrototype = {
    init: function(context) {
        this.context = context;
        return this;
    },
    drawPoint: function(point, r, strokeStyle, fillStyle, lineWidth){
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = lineWidth || 1;
        ctx.strokeStyle = strokeStyle || 'rgb(0, 0, 0)';
        ctx.fillStyle = fillStyle || 'rgb(0, 0, 0)';
        ctx.arc(point.x, point.y, r, 0.0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        return this;
    }
};