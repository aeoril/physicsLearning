// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var context = document.getElementById('canvas').getContext('2d'),
            drawDefaultCircle = drawCircleBindParams(null),
            drawCircle2 = drawCircleBindParams({
                radius: 5,
                x: 40,
                y: 40,
                fillStyle: 'rgb(255, 0, 0',
                strokeStyle: 'rgb(0, 255, 0)',
                lineWidth: 2
            }),
            params3 = drawCircle2(context, 'returnParams'),
            drawCircle3 =  drawCircleBindAll({
                x: 60,
                y: 60,
                radius: 10
            }, context);
        drawCircle3();
    }, false);
}());
