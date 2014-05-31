// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// hallidayResnick-2-2.js - 1 dimensional position and displacement interactive lesson

(function () {
    'use strict';

    var SIG_DIGITS = 8,
        MARGIN = 80,
        SCALAR = 20,
        FONT = 'normal 8pt TimesNewRoman',
        MINOR_STEP = 1,
        MAJOR_STEP = 5,
        TICK_LENGTH = 5,
        MARKER_LENGTH = 50,
        AXIS_OFFSET = 30,
        AXIS_MARGIN = 10,
        STEP = 20,
        MARKER_TEXT_OFFSET_X = 5,
        MARKER_TEXT_OFFSET_Y = 15,
        MARKER_TEXT_OFFSET_Y_H = 4,
        X1_MARKER_TEXT_OFFSET = 40,
        X2_MARKER_TEXT_OFFSET = 55,
        DISPLACEMENT_OFFSET = -35,
        DISPLACEMENT_TEXT_OFFSET = DISPLACEMENT_OFFSET + 20,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        BLACK_COLOR = 'rgb(0, 0, 0)',
        X1_COLOR = 'rgb(240, 2, 101)',
        X2_COLOR = 'rgb(0, 0, 200)',
        DISPLACEMENT_COLOR = 'rgb(190, 0, 190)',
        MAGNITUDE_COLOR = 'rgb(0, 190, 0)',
        showDetails = true,
        pts,
        closed = false,
        canvasElem,
        formElem,
        x1Elem,
        y1Elem,
        x2Elem,
        y2Elem,
        x3Elem,
        y3Elem,
        x4Elem,
        y4Elem,
        tElem,
        t,
        ctx,
        width,
        height,
        linePos,
        max,
        min,
        x1 = NaN,
        x2 = NaN,
        inputDisplacement = NaN,
        inputMagnitude = NaN,
        actualDisplacement = NaN,
        actualMagnitude = NaN;

    function HSVtoRGB(h,s,v,opacity){
        // inputs h=hue=0-360, s=saturation=0-1, v=value=0-1
        // algorithm from Wikipedia on HSV conversion
        var toHex=function(decimalValue,places){
            if(places == undefined || isNaN(places))  places = 2;
            var hex = new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
            var next = 0;
            var hexidecimal = "";
            decimalValue=Math.floor(decimalValue);
            while(decimalValue > 0){
                next = decimalValue % 16;
                decimalValue = Math.floor((decimalValue - next)/16);
                hexidecimal = hex[next] + hexidecimal;
            }
            while (hexidecimal.length<places){
                hexidecimal = "0"+hexidecimal;
            }
            return hexidecimal;
        }
        var hi=Math.floor(h/60)%6;
        var f=h/60-Math.floor(h/60);
        var p=v*(1-s);
        var q=v*(1-f*s);
        var t=v*(1-(1-f)*s);
        var r=v;  // case hi==0 below
        var g=t;
        var b=p;
        switch(hi){
            case 1:r=q;g=v;b=p;break;
            case 2:r=p;g=v;b=t;break;
            case 3:r=p;g=q;b=v;break;
            case 4:r=t;g=p;b=v;break;
            case 5:r=v;g=p;b=q;break;
        }
        //  At this point r,g,b are in 0...1 range.  Now convert into rgba or #FFFFFF notation
        if(opacity){
            return "rgba("+Math.round(255*r)+","+Math.round(255*g)+","+Math.round(255*b)+","+opacity+")";
        }else{
            return "#"+toHex(r*255)+toHex(g*255)+toHex(b*255);
        }
    }
    function hexToCanvasColor(hexColor,opacity){
        // Convert #AA77CC to rbga() format for Firefox
        opacity=opacity || "1.0";
        hexColor=hexColor.replace("#","");
        var r=parseInt(hexColor.substring(0,2),16);
        var g=parseInt(hexColor.substring(2,4),16);
        var b=parseInt(hexColor.substring(4,6),16);
        return "rgba("+r+","+g+","+b+","+opacity+")";
    }
    function drawPoint(ctx,x,y,r,color){
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.fillStyle=hexToCanvasColor(color,1);
        ctx.arc(x,y,r,0.0,2*Math.PI,false);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    function getControlPoints(x0,y0,x1,y1,x2,y2,t){
        //  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
        //  x2,y2 is the next knot -- not connected here but needed to calculate p2
        //  p1 is the control point calculated here, from x1 back toward x0.
        //  p2 is the next control point, calculated here and returned to become the
        //  next segment's p1.
        //  t is the 'tension' which controls how far the control points spread.

        //  Scaling factors: distances from this knot to the previous and following knots.
        var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
        var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));

        var fa=t*d01/(d01+d12);
        var fb=t-fa;

        var p1x=x1+fa*(x0-x2);
        var p1y=y1+fa*(y0-y2);

        var p2x=x1-fb*(x0-x2);
        var p2y=y1-fb*(y0-y2);

        return [p1x,p1y,p2x,p2y]
    }
    function drawControlLine(ctx,x,y,px,py){
        //  Only for demo purposes: show the control line and control points.
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.strokeStyle="rgba(0,0,0,0.3)";
        ctx.moveTo(x,y);
        ctx.lineTo(px,py);
        ctx.closePath();
        ctx.stroke();
        drawPoint(ctx,px,py,1.5,"#000000");
        ctx.restore();
    }
    function drawSpline(){
        //showDetails=document.getElementById('details').checked;
        ctx.save();
        ctx.lineWidth=4;
        var cp=[];   // array of control points, as x0,y0,x1,y1,...
        var n=pts.length;

        if(closed){
            //   Append and prepend knots and control points to close the curve
            pts.push(pts[0],pts[1],pts[2],pts[3]);
            pts.unshift(pts[n-1]);
            pts.unshift(pts[n-1]);
            for(var i=0;i<n;i+=2){
                cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5],t));
            }
            cp=cp.concat(cp[0],cp[1]);
            for(var i=2;i<n+2;i+=2){
                var color=HSVtoRGB(Math.floor(240*(i-2)/(n-2)),0.8,0.8);
                if(!showDetails){color="#555555"}
                ctx.strokeStyle=hexToCanvasColor(color,0.75);
                ctx.beginPath();
                ctx.moveTo(pts[i],pts[i+1]);
                ctx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
                ctx.stroke();
                ctx.closePath();
                if(showDetails){
                    drawControlLine(ctx,pts[i],pts[i+1],cp[2*i-2],cp[2*i-1]);
                    drawControlLine(ctx,pts[i+2],pts[i+3],cp[2*i],cp[2*i+1]);
                }
            }
        }else{
            // Draw an open curve, not connected at the ends
            for(var i=0;i<n-4;i+=2){
                cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5],t));
            }
            for(var i=2;i<pts.length-5;i+=2){
                var color=HSVtoRGB(Math.floor(240*(i-2)/(n-2)),0.8,0.8);
                if(!showDetails){color="#555555"}
                ctx.strokeStyle=hexToCanvasColor(color,0.75);
                ctx.beginPath();
                ctx.moveTo(pts[i],pts[i+1]);
                ctx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
                ctx.stroke();
                ctx.closePath();
                if(showDetails){
                    drawControlLine(ctx,pts[i],pts[i+1],cp[2*i-2],cp[2*i-1]);
                    drawControlLine(ctx,pts[i+2],pts[i+3],cp[2*i],cp[2*i+1]);
                }
            }
            //  For open curves the first and last arcs are simple quadratics.
            var color=HSVtoRGB(40,0.4,0.4);  // brown
            if(!showDetails){color="#555555"}
            ctx.strokeStyle=hexToCanvasColor(color,0.75);
            ctx.beginPath();
            ctx.moveTo(pts[0],pts[1]);
            ctx.quadraticCurveTo(cp[0],cp[1],pts[2],pts[3]);
            ctx.stroke();
            ctx.closePath();

            var color=HSVtoRGB(240,0.8,0.8); // indigo
            if(!showDetails){color="#555555"}
            ctx.strokeStyle=hexToCanvasColor(color,0.75);
            ctx.beginPath();
            ctx.moveTo(pts[n-2],pts[n-1]);
            ctx.quadraticCurveTo(cp[2*n-10],cp[2*n-9],pts[n-4],pts[n-3]);
            ctx.stroke();
            ctx.closePath();
            if(showDetails){
                drawControlLine(ctx,pts[2],pts[3],cp[0],cp[1]);
                drawControlLine(ctx,pts[n-4],pts[n-3],cp[2*n-10],cp[2*n-9]);
            }
        }
        ctx.restore();

        if(showDetails){   //   Draw the knot points.
            for(var i=0;i<n;i+=2){
                drawPoint(ctx,pts[i],pts[i+1],2.5,"#ffff00");
            }
        }
    }
    function draw() {
        function drawAxis(start, end, offset, isHorizontal, step) {
            var i,
                numTicks = Math.abs((end - start) / step),
                posStart = {},
                posEnd = {},
                text,
                textStart = {},
                textEnd = {},
                textWidth,
                temp;
            step = end - start >= 0 ? step : -step;
            ctx.save();
            ctx.strokeStyle = BLACK_COLOR;
            ctx.fillStyle = BLACK_COLOR;
            ctx.font = FONT;
            ctx.beginPath();
            if (isHorizontal) {
                ctx.moveTo(start, offset);
                ctx.lineTo(end, offset);
            } else {
                ctx.moveTo(offset, start);
                ctx.lineTo(offset, end);
            }
            ctx.stroke();
            for (i = 1; i < numTicks; i++) {
                temp = start + i * step;
                posStart.x = (isHorizontal ? temp : offset);
                posStart.y = (!isHorizontal ? temp : offset);
                posEnd.x = (isHorizontal ? posStart.x : posStart.x + TICK_LENGTH);
                posEnd.y = (!isHorizontal ? posStart.y : posStart.y + TICK_LENGTH);
                ctx.beginPath();
                ctx.moveTo(posStart.x, posStart.y);
                ctx.lineTo(posEnd.x, posEnd.y);
                ctx.stroke();
                text = String(Math.abs(temp - start));
                textWidth = ctx.measureText(text).width;
                textStart.x = posStart.x - (isHorizontal ? textWidth / 2 : textWidth + MARKER_TEXT_OFFSET_X);
                textStart.y = posStart.y + (isHorizontal ? MARKER_TEXT_OFFSET_Y : MARKER_TEXT_OFFSET_Y_H);
                ctx.fillText(text, textStart.x, textStart.y);
            }
            ctx.restore();
        }
        ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
        drawAxis(AXIS_OFFSET, width - AXIS_MARGIN, height - AXIS_OFFSET, true, STEP);
        drawAxis(height - AXIS_OFFSET, AXIS_MARGIN, AXIS_OFFSET, false, STEP);
        drawSpline();
    }
    function drawMousePos(e) {

        var top = 0,
            left = 0,
            mousePos = {},
            obj = canvasElem,
            posText,
            posTextWidth,
            posTextHeight = 7,
            posTextX,
            posTextY;

        // get canvas position
        while (obj.tagName != 'BODY') {

            top += obj.offsetTop;
            left += obj.offsetLeft;

            obj = obj.offsetParent;
        }

        // return relative mouse position
        mousePos.x = e.clientX - left + window.pageXOffset;
        mousePos.y = e.clientY - top + window.pageYOffset;
        if (mousePos.x > width) {
            mousePos.x = width;
        }
        if (mousePos.y > height) {
            mousePos.y = height;
        }
        draw();
        posText = '{' + mousePos.x + ',' + mousePos.y + ')';
        posTextWidth = ctx.measureText(posText).width;
        posTextX = mousePos.x;
        posTextY = mousePos.y;
        if (mousePos.x + posTextWidth > width) {
            posTextX = mousePos.x - (posTextWidth - (width - mousePos.x));
        }

        if (mousePos.y - posTextHeight < 0) {
            posTextY = mousePos.y + (posTextHeight - mousePos.y);
        }
        ctx.fillText(posText,  posTextX, posTextY);
    };
    function submit(e) {
        pts = [];
        pts.push(Number(x1Elem.value) + AXIS_OFFSET);
        pts.push(height - (Number(y1Elem.value) + AXIS_OFFSET));
        pts.push(Number(x2Elem.value) + AXIS_OFFSET);
        pts.push(height - (Number(y2Elem.value) + AXIS_OFFSET));
        pts.push(Number(x3Elem.value) + AXIS_OFFSET);
        pts.push(height - (Number(y3Elem.value) + AXIS_OFFSET));
        pts.push(Number(x4Elem.value) + AXIS_OFFSET);
        pts.push(height - (Number(y4Elem.value) + AXIS_OFFSET));
        t = Number(tElem.value) / 100;
        draw();
        if (e) {
            e.preventDefault();
        }
    }
    window.addEventListener('load', function() {
        canvasElem = document.getElementById('canvas');
        formElem = document.getElementById('form');
        ctx = canvasElem.getContext('2d');
        x1Elem = document.getElementById('x1');
        y1Elem = document.getElementById('y1');
        x2Elem = document.getElementById('x2');
        y2Elem = document.getElementById('y2');
        x3Elem = document.getElementById('x3');
        y3Elem = document.getElementById('y3');
        x4Elem = document.getElementById('x4');
        y4Elem = document.getElementById('y4');
        tElem = document.getElementById('t');
        width = canvasElem.width;
        height = canvasElem.height;
        linePos = height / 2;
        max = (width / 2 - MARGIN) / SCALAR;
        min = -max;
        x1Elem.addEventListener('change', submit, false);
        y1Elem.addEventListener('change', submit, false);
        x2Elem.addEventListener('change', submit, false);
        y2Elem.addEventListener('change', submit, false);
        x3Elem.addEventListener('change', submit, false);
        y3Elem.addEventListener('change', submit, false);
        x4Elem.addEventListener('change', submit, false);
        y4Elem.addEventListener('change', submit, false);
        tElem.addEventListener('change', submit, false);
        formElem.addEventListener('submit', submit, false);
        //canvasElem.addEventListener('click', canvasMousePos, false);
        canvasElem.addEventListener('mousemove', drawMousePos, false);
        submit();
        x1Elem.focus();
    }, false);
}());