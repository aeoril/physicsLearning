// Copyright © 2014 QuarksCode.  MIT License - see http://opensource.org/licenses/MIT and see COPYRIGHT.md
// Original Author:  aeoril
//
// hallidayResnick-2-2.js - 1 dimensional position and displacement interactive lesson

(function () {
    'use strict';

    var SCALAR = 20,
        BUNNY_SCALAR = 40,
        FONT = 'normal 8pt TimesNewRoman',
        NAME_FONT = 'normal 12pt TimesNewRoman',
        TICK_LENGTH = 5,
        CLOSEST_X = 220,
        AXIS_OFFSET = 40,
        AXIS_OFFSET_LEFT,
        AXIS_OFFSET_RIGHT,
        AXIS_OFFSET_TOP,
        AXIS_OFFSET_BOTTOM,
        AXIS_CLOSEST_X = 20,
        AXIS_CLOSEST_Y = 80,
        BUNNY_AXIS_OFFSET_LEFT,
        BUNNY_AXIS_OFFSET_RIGHT,
        BUNNY_AXIS_OFFSET_BOTTOM,
        AXIS_MARGIN = 10,
        BUNNY_AXIS_MARGIN = (960 - 720) / 2,
        BUNNY_X_SCALAR = 720 / 350,
        BUNNY_IMG_WIDTH = 48,
        BUNNY_IMG_HEIGHT = 48,
        BUNNY_IMG_OFFSET_TOP = 10,
        STEP = 40,
        MARKER_TEXT_OFFSET_X = 5,
        MARKER_TEXT_OFFSET_Y = 15,
        MARKER_TEXT_OFFSET_Y_H = 4,
        ARROWHEAD_LENGTH = 7,
        ARROWHEAD_WIDTH = 5,
        BLACK_COLOR = 'rgb(0, 0, 0)',
        showDetails = true,
        pts,
        closed = false,
        mouseIsDown = false,
        mousePoint = 0,
        mousePos = {},
        splineCanvasElem,
        bunnyCanvasElem,
        bunnyImg = new Image(),
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
        splineCtx,
        bunnyCtx,
        width,
        height,
        bunnyWidth,
        bunnyHeight,
        x1 = NaN,
        x2 = NaN;

// *******************************************************************************************
// Start Rob Spencer Code from http://scaledinnovation.com/analytics/splines/aboutSplines.html
// This code is copyrighted with all rights reserved - see his site for details.  Thanks, Rob!
// *******************************************************************************************

    function convertHSVtoRGB(h,s,v,opacity){
        // inputs h=hue=0-360, s=saturation=0-1, v=value=0-1
        // algorithm from Wikipedia on HSV conversion
        var toHex=function(decimalValue,places){
            if(places == undefined || isNaN(places))  places = 2;
            var hex = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
            var next = 0;
            var hexadecimal = "";
            decimalValue=Math.floor(decimalValue);
            while(decimalValue > 0){
                next = decimalValue % 16;
                decimalValue = Math.floor((decimalValue - next)/16);
                hexadecimal = hex[next] + hexadecimal;
            }
            while (hexadecimal.length<places){
                hexadecimal = "0"+hexadecimal;
            }
            return hexadecimal;
        };
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
        splineCtx.save();
        splineCtx.lineWidth=4;
        var cp=[];   // array of control points, as x0,y0,x1,y1,...
        var n=pts.length;
        var color, i;

        if(closed){
            //   Append and prepend knots and control points to close the curve
            pts.push(pts[0],pts[1],pts[2],pts[3]);
            pts.unshift(pts[n-1]);
            pts.unshift(pts[n-1]);
            for(i=0;i<n;i+=2){
                cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5],t));
            }
            cp=cp.concat(cp[0],cp[1]);
            for(i=2;i<n+2;i+=2){
                color=convertHSVtoRGB(Math.floor(240*(i-2)/(n-2)),0.8,0.8);
                if(!showDetails){color="#555555"}
                splineCtx.strokeStyle=hexToCanvasColor(color,0.75);
                splineCtx.beginPath();
                splineCtx.moveTo(pts[i],pts[i+1]);
                splineCtx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
                splineCtx.stroke();
                splineCtx.closePath();
                if(showDetails){
                    drawControlLine(splineCtx,pts[i],pts[i+1],cp[2*i-2],cp[2*i-1]);
                    drawControlLine(splineCtx,pts[i+2],pts[i+3],cp[2*i],cp[2*i+1]);
                }
            }
        }else{
            // Draw an open curve, not connected at the ends
            for(i=0;i<n-4;i+=2){
                cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5],t));
            }
            for(i=2;i<pts.length-5;i+=2){
                color=convertHSVtoRGB(Math.floor(240*(i-2)/(n-2)),0.8,0.8);
                if(!showDetails){color="#555555"}
                splineCtx.strokeStyle=hexToCanvasColor(color,0.75);
                splineCtx.beginPath();
                splineCtx.moveTo(pts[i],pts[i+1]);
                splineCtx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
                splineCtx.stroke();
                splineCtx.closePath();
                if(showDetails){
                    drawControlLine(splineCtx,pts[i],pts[i+1],cp[2*i-2],cp[2*i-1]);
                    drawControlLine(splineCtx,pts[i+2],pts[i+3],cp[2*i],cp[2*i+1]);
                }
            }
            //  For open curves the first and last arcs are simple quadratics.
            color=convertHSVtoRGB(40,0.4,0.4);  // brown
            if(!showDetails){color="#555555"}
            splineCtx.strokeStyle=hexToCanvasColor(color,0.75);
            splineCtx.beginPath();
            splineCtx.moveTo(pts[0],pts[1]);
            splineCtx.quadraticCurveTo(cp[0],cp[1],pts[2],pts[3]);
            splineCtx.stroke();
            splineCtx.closePath();

            color=convertHSVtoRGB(240,0.8,0.8); // indigo
            if(!showDetails){color="#555555"}
            splineCtx.strokeStyle=hexToCanvasColor(color,0.75);
            splineCtx.beginPath();
            splineCtx.moveTo(pts[n-2],pts[n-1]);
            splineCtx.quadraticCurveTo(cp[2*n-10],cp[2*n-9],pts[n-4],pts[n-3]);
            splineCtx.stroke();
            splineCtx.closePath();
            if(showDetails){
                drawControlLine(splineCtx,pts[2],pts[3],cp[0],cp[1]);
                drawControlLine(splineCtx,pts[n-4],pts[n-3],cp[2*n-10],cp[2*n-9]);
            }
        }
        splineCtx.restore();

        if(showDetails){   //   Draw the knot points.
            for(i=0;i<n;i+=2){
                drawPoint(splineCtx,pts[i],pts[i+1],2.5,"#ffff00");
            }
        }
    }

// *******************************************************************************************
// End Rob Spencer Code from http://scaledinnovation.com/analytics/splines/aboutSplines.html
// *******************************************************************************************

    function draw() {
        function drawAxis(ctx, start, end, offset, name, step, isHorizontal, scalar) {
            var i,
                numTicks = Math.abs((end - start) / step),
                posStart = {},
                posEnd = {},
                text,
                textStart = {},
                textWidth,
                temp    ;
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
                posEnd.y = (!isHorizontal ? posStart.y : posStart.y - TICK_LENGTH);
                ctx.beginPath();
                ctx.moveTo(posStart.x, posStart.y);
                ctx.lineTo(posEnd.x, posEnd.y);
                ctx.stroke();
                text = String(Math.abs(temp - start) / scalar);
                textWidth = ctx.measureText(text).width;
                textStart.x = posStart.x - (isHorizontal ? textWidth / 2 : textWidth + MARKER_TEXT_OFFSET_X);
                textStart.y = posStart.y + (isHorizontal ? MARKER_TEXT_OFFSET_Y : MARKER_TEXT_OFFSET_Y_H);
                ctx.fillText(text, textStart.x, textStart.y);
            }
            textWidth = ctx.measureText(name).width;
            textStart.x = isHorizontal ? start + (end - start - textWidth) / 2 : offset - (textWidth + MARKER_TEXT_OFFSET_X * 5);
            textStart.y = isHorizontal ? offset + MARKER_TEXT_OFFSET_Y * 2 : end + Math.abs(end - start) / 2;
            ctx.font = NAME_FONT;
            ctx.fillText(name, textStart.x, textStart.y);
            ctx.restore();
        }
        splineCtx.clearRect(0, 0, splineCanvasElem.width, splineCanvasElem.height);
        drawAxis(splineCtx, AXIS_OFFSET_LEFT, AXIS_OFFSET_RIGHT, AXIS_OFFSET_BOTTOM, 't', STEP, true, SCALAR);
        drawAxis(splineCtx, AXIS_OFFSET_BOTTOM, AXIS_OFFSET_TOP, AXIS_OFFSET_LEFT, 'x', STEP, false, SCALAR);
        drawSpline();
        bunnyCtx.clearRect(0, 0, splineCanvasElem.width, splineCanvasElem.height);
        drawAxis(bunnyCtx, BUNNY_AXIS_OFFSET_LEFT, BUNNY_AXIS_OFFSET_RIGHT, BUNNY_AXIS_OFFSET_BOTTOM, 'x', STEP, true, BUNNY_SCALAR);
        bunnyCtx.drawImage(bunnyImg, (AXIS_OFFSET_BOTTOM - pts[1]) * BUNNY_X_SCALAR + BUNNY_AXIS_OFFSET_LEFT - BUNNY_IMG_WIDTH / 2, BUNNY_IMG_OFFSET_TOP, BUNNY_IMG_WIDTH, BUNNY_IMG_HEIGHT);
    }
    function calcMousePos(e) {
        var top = 0,
            left = 0,
            obj = splineCanvasElem;

        // get canvas position
        while (obj.tagName != 'BODY') {

            top += obj.offsetTop;
            left += obj.offsetLeft;

            obj = obj.offsetParent;
        }

        // return relative mouse position
        mousePos.x = e.clientX - left + window.pageXOffset;
        mousePos.y = e.clientY - top + window.pageYOffset;
    }
    function calcClosestPoint() {
        var i;

        function calcDistanceSquared(x1, y1, x2, y2) {
            return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        }

        mousePoint = 0;

        for (i = 0; i < pts.length - 2; i += 2) {
           if (calcDistanceSquared(pts[i], pts[i + 1], mousePos.x, mousePos.y) >
               calcDistanceSquared(pts[i + 2], pts[i + 3], mousePos.x, mousePos.y)) {
               mousePoint = i + 2;
           }
        }
    }
    function updateTextBoxes() {
        x1Elem.value = pts[0];
        y1Elem.value = pts[1];
        x2Elem.value = pts[2];
        y2Elem.value = pts[3];
        x3Elem.value = pts[4];
        y3Elem.value = pts[5];
        x4Elem.value = pts[6];
        y4Elem.value = pts[7];
    }
    function mouseMove(e) {

        var posText,
            posTextWidth,
            posTextHeight = 7,
            posTextX,
            posTextY;

        calcMousePos(e);

        if (mousePos.x > width) {
            mousePos.x = width;
        }
        if (mousePos.y > height) {
            mousePos.y = height;
        }
        if (mouseIsDown) {
            if (mousePoint !== 0 &&
                ((mousePoint === pts.length - 2 &&
                  (mousePos.x >= pts[mousePoint - 2] + CLOSEST_X && mousePos.x <= AXIS_OFFSET_RIGHT)) ||
                 ((mousePos.x >= pts[mousePoint - 2] + CLOSEST_X && mousePos.x < pts[mousePoint + 2] - CLOSEST_X) &&
                  (mousePos.x >= AXIS_OFFSET_LEFT + AXIS_CLOSEST_X && mousePos.x <= AXIS_OFFSET_RIGHT - AXIS_CLOSEST_X)))) {
                pts[mousePoint] = mousePos.x;
            }
            if (((mousePoint === 0 || mousePoint === pts.length - 2) &&
                 mousePos.y <= AXIS_OFFSET_BOTTOM && mousePos.y >= AXIS_OFFSET_TOP) ||
                (mousePos.y <= AXIS_OFFSET_BOTTOM - AXIS_CLOSEST_Y && mousePos.y >= AXIS_OFFSET_TOP + AXIS_CLOSEST_Y)) {
                pts[mousePoint + 1] = mousePos.y;
            }
        }
        updateTextBoxes();
        draw();
        posText = '{' + mousePos.x + ',' + mousePos.y + ')';
        posTextWidth = splineCtx.measureText(posText).width;
        posTextX = mousePos.x;
        posTextY = mousePos.y;
        if (mousePos.x + posTextWidth > width) {
            posTextX = mousePos.x - (posTextWidth - (width - mousePos.x));
        }

        if (mousePos.y - posTextHeight < 0) {
            posTextY = mousePos.y + (posTextHeight - mousePos.y);
        }
        splineCtx.fillText(posText,  posTextX, posTextY);
    }
    function mouseDown(e) {
        calcMousePos(e);
        calcClosestPoint();
        mouseIsDown = true;
        mouseMove(e);
    }
    function mouseUp() {
        mouseIsDown = false;
    }
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
    bunnyImg.width = 24;
    bunnyImg.height = 24;
    bunnyImg.addEventListener('load', function () {
        submit();
    });
    window.addEventListener('load', function() {
        splineCanvasElem = document.getElementById('splineCanvas');
        bunnyCanvasElem = document.getElementById('bunnyCanvas');
        formElem = document.getElementById('form');
        splineCtx = splineCanvasElem.getContext('2d');
        bunnyCtx = bunnyCanvasElem.getContext('2d');
        x1Elem = document.getElementById('x1');
        y1Elem = document.getElementById('y1');
        x2Elem = document.getElementById('x2');
        y2Elem = document.getElementById('y2');
        x3Elem = document.getElementById('x3');
        y3Elem = document.getElementById('y3');
        x4Elem = document.getElementById('x4');
        y4Elem = document.getElementById('y4');
        tElem = document.getElementById('t');
        width = splineCanvasElem.width;
        height = splineCanvasElem.height;
        bunnyWidth = bunnyCanvasElem.width;
        bunnyHeight = bunnyCanvasElem.height;
        AXIS_OFFSET_LEFT = AXIS_OFFSET;
        AXIS_OFFSET_RIGHT = width - AXIS_MARGIN;
        AXIS_OFFSET_TOP = AXIS_MARGIN;
        AXIS_OFFSET_BOTTOM = height - AXIS_OFFSET;
        BUNNY_AXIS_OFFSET_LEFT = BUNNY_AXIS_MARGIN;
        BUNNY_AXIS_OFFSET_RIGHT = bunnyWidth - BUNNY_AXIS_MARGIN;
        BUNNY_AXIS_OFFSET_BOTTOM = bunnyHeight - AXIS_OFFSET;
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
        splineCanvasElem.addEventListener('mousemove', mouseMove, false);
        splineCanvasElem.addEventListener('mousedown', mouseDown, false);
        splineCanvasElem.addEventListener('mouseup', mouseUp, false);
        splineCanvasElem.addEventListener('mouseleave', mouseUp, false);
        bunnyImg.src = 'bunny.jpg';
        //submit();
        x1Elem.focus();
    }, false);
}());