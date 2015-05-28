// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// simpleMixin.js - mixes in one object with another

function simpleMixin(from, to) {
    'use strict';
    return Object.keys(from).reduce(function (result, key) {
        if (typeof from[key] === 'object' && from[key] !== null) {
            result[key] = simpleClone(from[key]);
        } else {
            result[key] = from[key];
        }
        return result;
    }, to);
}
