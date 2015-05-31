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
                fillStyle: 'rgb(255, 0, 0',
                strokeStyle: 'rgb(0, 255, 0)',
                lineWidth: 4
            },
            circle3Params = simpleMixin({radius: 10}, circle2Params),
            renderDefaultCircle = renderCircleBind(null),
            renderCircle2 = renderCircleBind(circle2Params),
            renderCircle3 =  renderCircleBind(circle3Params),
            defaultCircleCanvas = renderDefaultCircle(),
            circle2Canvas = renderCircle2(),
            circle3Canvas = renderCircle3();
        context.drawImage(defaultCircleCanvas, 20, 20);
        context.drawImage(circle2Canvas, canvas.width - circle2Canvas.width, canvas.height - circle2Canvas.height);
        bigContext.drawImage(defaultCircleCanvas, 20, 20);
        bigContext.drawImage(circle2Canvas, 40, 40);
        bigContext.drawImage(circle3Canvas,
            bigCanvas.width - circle3Canvas.width, bigCanvas.height - circle3Canvas.height);
    }, false);
}());
