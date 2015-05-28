// Copyright © 2015 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT
// Original Author:  aeoril
//
// simpleClone.js - clone only array elements and own properties of an object with recursion
//                  cannot handle circular references

function simpleClone(obj) {
    'use strict';
    return Object.keys(obj).reduce(function (result, key) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = simpleClone(obj[key]);
        } else {
            result[key] = obj[key];
        }
        return result;
    }, Array.isArray(obj) ? [] : {});
}
