// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// BasicShapes.js - 1 motion: displacement and time interactive lesson

var mathBasics = {
    calcDistance: function(point1, point2) {
        var delta = {x: point2.x - point1.x, y: point2.y - point1.y};
        return Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    }
};