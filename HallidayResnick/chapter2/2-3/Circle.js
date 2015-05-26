// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

function drawCircle(params, context) {
    'use strict';
    var startAngle = 0.0,
        endAngle = 2 * Math.PI,
        clockWise = false;
    params = params || {
        point: {
            x: 20,
            y: 20
        },
        radius: 2.5,
        strokeStyle: 'rgb(0, 0, 0)',
        fillStyle: 'rgb(0, 0, 0)',
        lineWidth: 0
    };
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
    return params;
}
function drawCircleBindParams(params) {
    'use strict';
    return drawCircle.bind(null, params);
}
function drawCircleBindAll(params, context) {
    return drawCircle.bind(null, params, context);
}