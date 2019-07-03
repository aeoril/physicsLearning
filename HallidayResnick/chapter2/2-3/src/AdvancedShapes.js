// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT or LICENSE.md file
// Original Author:  aeoril
//
// BasicShapes.js - 1 motion: displacement and time interactive lesson

var AdvancedShapes = {
    create: function(context) {
        'use strict';

        return Object.create(advancedShapesPrototype).init(context);
    },
    drawLabeledLine: function(context, start, end, width, color, arrowHeads, labels) {
        'use strict';

        return this.create(context).drawLabeledLine(start, end, width, color, arrowHeads, labels);
    },
    drawAxis: function(context, start, end, width, color, axisArrowHeads, axisLabels, minCoordinate,
                       maxCoordinate, step, tickWidth, tickLength, tickColor, coordinateLabels, drawOrigin) {
        'use strict';

        return this.create(context).drawAxis(start, end, width, color, axisArrowHeads, axisLabels,
            minCoordinate, maxCoordinate, step, tickWidth, tickLength, tickColor, coordinateLabels, drawOrigin);
    }
};

var advancedShapesPrototype = {
    init: function(context) {
        'use strict';

        this.context = context;
        return this;
    },
    drawLabeledLine: function(start, end, width, color, arrowHeads, labels) {
        var length = geometry.calcDistance(start, end),
            angle = Math.atan2(end.y - start.y, end.x - start.x);
        this.context.save();
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this.context.translate(start.x, start.y);
        this.context.rotate(angle);
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(length, 0);
        this.context.stroke();
        arrowHeads.forEach(function(arrowHead) {
            var arrowHeadX,
                arrowHeadAngle = arrowHead.angle;
            switch (arrowHead.relativeTo) {
                case 'start' :
                    arrowHeadX = arrowHead.offset.x;
                    arrowHeadAngle += Math.PI;
                    break;
                case 'end' :
                    arrowHeadX = length + arrowHead.offset.x;
                    break;
            }
            this.context.save();
            this.context.strokeStyle = arrowHead.strokeStyle;
            this.context.translate(arrowHeadX, arrowHead.offset.y);
            this.context.rotate(arrowHeadAngle);
            this.context.beginPath();
            this.context.moveTo(0, 0);
            this.context.lineTo(-arrowHead.arrowHeadLength, arrowHead.arrowHeadWidth / 2);
            this.context.lineTo(-arrowHead.arrowHeadLength, -arrowHead.arrowHeadWidth / 2);
            this.context.lineTo(0, 0);
            this.context.stroke();
            if (arrowHead.fill) {
                this.context.fillStyle = arrowHead.fillStyle;
                this.context.fill();
            }
            this.context.restore();
        }, this);
        labels.forEach(function (label) {
            var labelX;
            switch (label.relativeTo) {
                case 'start' :
                    labelX = label.offset.x;
                    break;
                case 'middle' :
                    labelX = length / 2 + label.offset.x;
                    break;
                case 'end' :
                    labelX = length + label.offset.x;
                    break;
            }
            this.context.save();
            this.context.font = label.font;
            this.context.fillStyle = label.fillStyle;
            this.context.translate(labelX, label.offset.y);
            this.context.rotate(label.angle);
            this.context.fillText(label.text, -this.context.measureText(label.text).width * label.widthMultiplier, 0);
            this.context.restore();
        }, this);
        this.context.restore();
    },
    drawAxis: function(start, end, width, color, axisArrowHeads, axisLabels,
                       minCoordinate, maxCoordinate, step,
                       tickWidth, tickLength, tickColor, coordinateLabels, drawOrigin) {
        var length = geometry.calcDistance(start, end),
            angle = Math.atan2(end.y - start.y, end.x - start.x),
            numCoordinates = (maxCoordinate - minCoordinate) / step,
            tickStart = {y: 0},
            tickEnd = {y: -tickLength},
            i;

        this.context.save();
        this.context.translate(start.x, start.y);
        this.context.rotate(angle);
        this.drawLabeledLine({x: 0, y: 0}, {x: length, y: 0}, width, color, axisArrowHeads, axisLabels);
        for (i = 0; i <= numCoordinates; i++) {
            tickStart.x = i * length / numCoordinates;
            tickEnd.x = tickStart.x;
            coordinateLabels[0].text = minCoordinate + step * i;
            if (coordinateLabels[0].text !== 0 || drawOrigin) {
                this.drawLabeledLine(tickStart, tickEnd, tickWidth, tickColor, [], coordinateLabels);
            }
        }
        this.context.restore();
    }
};