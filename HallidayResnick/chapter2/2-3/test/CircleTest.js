// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var context = document.getElementById('canvas').getContext('2d'),
            drawDefaultCircle = drawCircleBindParams(null),
            mutatingParams = drawDefaultCircle(context),
            drawCircle2,
            drawCircle3;
        mutatingParams.radius = 5;
        mutatingParams.point = {x: 40, y: 40};
        mutatingParams.fillStyle = 'rgb(255, 0, 0)';
        mutatingParams.strokeStyle = 'rgb(0, 255, 0)';
        mutatingParams.lineWidth = 2;
        drawCircle2 = drawCircleBindParams(mutatingParams);
        drawCircle2(context);
        mutatingParams.point = {x: 60, y: 60};
        mutatingParams.radius = 10;
        drawCircle3 = drawCircleBindAll(mutatingParams, context);
        drawCircle3();
    }, false);
}());
