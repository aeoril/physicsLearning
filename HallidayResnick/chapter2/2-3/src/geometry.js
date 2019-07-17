// Copyright © 2019 by Xitalogy.  MIT License.  http://opensource.org/licenses/MIT

var geometry = {
    calcDistance: function(point1, point2) {
        'use strict';

        var deltaX = point2.x - point1.x,
            deltaY = point2.y - point1.y;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
};
