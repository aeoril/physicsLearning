// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var canvas = document.getElementById('canvas'),
            bigCanvas = document.getElementById('bigCanvas'),
            context = canvas.getContext('2d'),
            bigContext = bigCanvas.getContext('2d'),
            circle2Params = {
                radius: 5,
                point: {x: canvas.width - 5, y: canvas.height - 5},
                fillStyle: 'rgb(255, 0, 0',
                strokeStyle: 'rgb(0, 255, 0)',
                lineWidth: 2,
            },
            renderDefaultCircle = renderCircleBind(null),
            circle3Params = simpleMixin({ point: {x: bigCanvas.width - 10, y: bigCanvas.height - 10},
                radius: 10, canvasWidth: bigCanvas.width, canvasHeight: bigCanvas.height}, circle2Params),
            renderCircle2 = renderCircleBind(circle2Params),
            renderCircle3 =  renderCircleBind(circle3Params);
        context.drawImage(renderDefaultCircle(), 0, 0);
        context.drawImage(renderCircle2(), 0, 0);
        bigContext.drawImage(renderDefaultCircle(), 0, 0);
        bigContext.drawImage(renderCircle2(), 0, 0)
        bigContext.drawImage(renderCircle3(), 0, 0);
    }, false);
}());
