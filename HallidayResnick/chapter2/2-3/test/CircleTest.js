// Copyright © 2019 by Xitalogy.  MIT License.  http://opensource.org/licenses/MIT

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var smallCanvas = document.getElementById('smallCanvas'),
            bigCanvas = document.getElementById('bigCanvas'),
            context = smallCanvas.getContext('2d'),
            bigContext = bigCanvas.getContext('2d'),
            circle2Params = {
                radius: 5,
                fillStyle: 'rgb(255, 0, 0)',
                strokeStyle: 'rgb(0, 255, 0)',
                lineWidth: 4
            },
            circle3Params = simpleMixin({radius: 10}, circle2Params),
            defaultCircleCanvas = renderCircle(null),
            circle2Canvas = renderCircle(circle2Params),
            circle3Canvas = renderCircle3(circle3Params);
        context.drawImage(defaultCircleCanvas, 20, 20);
        context.drawImage(circle2Canvas, smallCanvas.width - circle2Canvas.width, smallCanvas.height - circle2Canvas.height);
        bigContext.drawImage(defaultCircleCanvas, 20, 20);
        bigContext.drawImage(circle2Canvas, 40, 40);
        bigContext.drawImage(circle3Canvas, bigCanvas.width - circle3Canvas.width, bigCanvas.height - circle3Canvas.height);
    }, false);
}());
