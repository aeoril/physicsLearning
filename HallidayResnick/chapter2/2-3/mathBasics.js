// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// BasicShapes.js - 1 motion: displacement and time interactive lesson

var mathBasics = {
    calcDistance: function(point1, point2) {
        'use strict';

        var deltaX = point2.x - point1.x,
            deltaY = point2.y - point1.y;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
};