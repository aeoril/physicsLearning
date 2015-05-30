// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

var defaultCircleParams = {
    point: {x: 20, y: 20},
    radius: 2.5,
    strokeStyle: 'rgb(0, 0, 0)',
    fillStyle: 'rgb(0, 0, 0)',
    lineWidth: 0,
    canvasWidth: 300,
    canvasHeight: 150
};
function renderCircle(params) {
    'use strict';
    var context,
        startAngle = 0.0,
        endAngle = 2 * Math.PI,
        clockWise = false,
        canvas = document.createElement('canvas');
    params = simpleMixin(params, defaultCircleParams);
    canvas.width = params.canvasWidth;
    canvas.height = params.canvasHeight;
    context = canvas.getContext('2d');
    context.save();
    context.beginPath();
    context.lineWidth = params.lineWidth;
    context.strokeStyle = params.strokeStyle;
    context.fillStyle = params.fillStyle;
    context.arc(params.point.x, params.point.y, params.radius, startAngle, endAngle, clockWise);
    context.closePath();
    context.stroke();
    context.fill();
    context.restore();
    return canvas;
}
function renderCircleBind(params) {
    'use strict';
    return Function.prototype.bind.call(renderCircle, null, simpleClone(params));
}