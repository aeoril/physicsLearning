// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

var defaultCircleParams = {
    radius: 3,
    strokeStyle: 'rgb(0, 0, 0)',
    fillStyle: 'rgb(0, 0, 0)',
    lineWidth: 1
};
function renderCircle(params) {
    'use strict';
    var context,
        startAngle = 0.0,
        endAngle = 2.0 * Math.PI,
        clockWise = false,
        canvas = document.createElement('canvas');
    params = simpleMixin(params, defaultCircleParams);
    canvas.width = (params.radius + params.lineWidth) * 2;
    canvas.height = canvas.width;
    context = canvas.getContext('2d');
    context.save();
    context.beginPath();
    context.lineWidth = params.lineWidth;
    context.strokeStyle = params.strokeStyle;
    context.fillStyle = params.fillStyle;
    context.arc(canvas.width / 2, canvas.height / 2, params.radius, startAngle, endAngle, clockWise);
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