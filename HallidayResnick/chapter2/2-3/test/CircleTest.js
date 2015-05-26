// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// Circle.js - Manages a circle

(function () {
    'use strict';
    window.addEventListener('load', function () {
        var context = document.getElementById('canvas').getContext('2d'),
            circle = Circle.create(context);
        circle.draw();
        circle.params.radius = 5;
        circle.params.point = {x: 40, y: 40};
        circle.params.fillStyle = 'rgb(255, 0, 0)';
        circle.params.strokeStyle = 'rgb(0, 255, 0)';
        circle.params.lineWidth = 2;
        circle.draw();
        circle.params.point = {x: 60, y: 60};
        circle.params.radius = 10;
        Circle.draw(context, circle.params);
    }, false);
}());
