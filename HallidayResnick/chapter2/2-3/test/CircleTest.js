// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var canvas = document.getElementById('canvas'),
            context = canvas.getContext('2d'),
            circle2Params = {
                radius: 5,
                point: {x: 40, y: 40},
                fillStyle: 'rgb(255, 0, 0',
                strokeStyle: 'rgb(0, 255, 0)',
                lineWidth: 2
            },
            renderDefaultCircle = renderCircleBind(null),
            circle3Params = simpleMixin({ point: {x: 60, y: 60}, radius: 10 }, circle2Params),
            renderCircle2 = renderCircleBind(circle2Params),
            renderCircle3 =  renderCircleBind(circle3Params, canvas);
        context.drawImage(renderDefaultCircle(canvas), 0, 0);
        context.drawImage(renderCircle2(canvas), 0, 0);
        context.drawImage(renderCircle3(), 0, 0);
    }, false);
}());
