/**
 * Core Part
 * @author Barret Lee(barret.china@gmail.com)
 * @date 11/07/2014
 */

;(function(window, undefined){

    var Core = {};
    var config = {
        MAX_STEPS: 8,
        DECIMAL: 3,
        drawlinesInRectTag: false,
        selectlinesInRectTag: false,
        drawInfoRectTag: false,
        moveObjTag: false,
        colorTag: false,
        ready: false
    };

    /**
     * clearLines: clear all lines drawed with DOM.
     */
    function clearLines(){
        var divs = document.querySelectorAll(".box div");

        for(var i = 0, len = divs.length; i < len; i++){
            divs[i].remove();
        }
    }

    /**
     * setTurnerTag Turner for operation
     * @param {String} tag Tag for operation.
     */
    function setTurnerTag(tag){

        try{
            can.onmousemove = box.onmousemove = 
            can.onmousedown = box.onmousedown = 
            can.onmouseup = box.onmouseup = null;

            can.style.cursor = box.style.cursor = "default";
            document.querySelector(".color-info-box").remove();
        }catch(e){}

        for(var key in config){
            if(/tag/i.test(key)){
                config[key] = false;
            }
        }

        if(tag) config[tag] = true;
    }

    /**
     * toggleClass toggle class
     * @param  {Sting} cls   classname
     * @param  {DOM} context context
     */
    function toggleClass(cls, context){
        var n = context.className
          , regHasCls = new RegExp("(^|\\s)" + cls + "($|\\s)");

        context = context.length > 0 ? context : [context];

        [].slice.call(context).forEach(function(item){
            if(!regHasCls.test(n)){
                item.className += cls;
            } else {
                item.className = item.className.replace(regHasCls, "");
            }
        });
    }

    /**
     * getLines: Analysis all colunms/rows, and return the largest pecentage of each line.
     * @param  {String} direct the direction of line. 'col' / 'row', 'col' by default .
     * @param  {Array} rect   [startLeft, startTop, width, height]
     * @param  {Boolean} bound  preserve the boundary or not.
     * @return {Array}        the largest pecentage of each line.
     */
    function getLines(direct, rect, bound){
        var rect = rect || [0, 0, width, height]
          , imageData = ctx.getImageData.apply(ctx, [0, 0, width, height])
          , direct = direct || "col"
          , pixels = imageData.data
          , lineArr = []
          , max, i, outer, inner, oBegin, iBegin;

        /**
         * +-----------------------------+
         * |                             |
         * |     ==========              |
         * |     ==========              |
         * |     ==========              |
         * |     ==========              |
         * |                             |
         * +-----------------------------+
         */

        if(direct == "col"){
            oBegin = rect[1];
            iBegin = rect[0];
            outer = imageData.height;
            inner = imageData.width;

            for(i = oBegin; i < rect[3] + oBegin; i++){
                var iStart = width * i + iBegin
                  , rate = {}
                  , rgba = ""
                  , j, v;

                for(j = iStart; j < iStart + rect[2]; j++) {
                    rgba = pixels[j * 4] + "-" +
                           pixels[j * 4 + 1] + "-" + 
                           pixels[j * 4 + 2] + "-" + 
                           pixels[j * 4 + 3];

                    if(!rate[rgba]){
                        rate[rgba] = 1;
                    } else {
                        rate[rgba] += 1;
                    }
                }

                max = 0;
                for(v in rate){
                    max = Math.max(max, rate[v]);
                }
                lineArr.push((max / rect[2]).toFixed(config['DECIMAL']));
            }
        } else {

        /**
         * +-----------------------------+
         * |                             |
         * |     ||||||||||              |
         * |     ||||||||||              |
         * |     ||||||||||              |
         * |     ||||||||||              |
         * |                             |
         * +-----------------------------+
         */
            oBegin = rect[0];
            iBegin = rect[1];
            outer = imageData.width;
            inner = imageData.height;

            for(i = oBegin; i < rect[2] + oBegin; i++) {
                var rate = {}
                  , rgba = ""
                  , j, v, point;

                for(j = iBegin; j < iBegin + rect[3]; j++) {
                    point = (j * width + i) * 4;
                    rgba = pixels[point] + "-" +
                           pixels[point + 1] + "-" + 
                           pixels[point + 2] + "-" + 
                           pixels[point + 3];

                    if(!rate[rgba]){
                        rate[rgba] = 1;
                    } else {
                        rate[rgba] += 1;
                    }
                }

                max = 0;
                for(v in rate){
                    max = Math.max(max, rate[v]);
                }
                lineArr.push((max / rect[3]).toFixed(config['DECIMAL']));
            }
        }

        return _getTagsFromLines(lineArr, direct, bound);
    }

    /**
     * [_getTagsFromLines description]
     * @param  {Array} lines  list of lines position
     * @param  {String} direct 'col' / 'row', 'col' by default. 
     * @param  {Boolean} bound  preserve the boundary or not.
     * @return {Array}
     */
    function _getTagsFromLines(lineArr, direct, bound){
        var tags = []
          , start = 0
          , move = 0
          , i = 0, len;

        // console.log(lineArr);

        for(len = lineArr.length; i < len; i++){
            if(lineArr[i] == lineArr[start] && i < len - 1){
                move++;
            } else {
                if(move >= config['MAX_STEPS'] || tags.length == 0){
                    if(tags.length && (start - tags[tags.length - 1] <= config['MAX_STEPS'])) {
                        tags.push(start + move - 1);
                    } else {
                        tags = tags.concat([start - 1, start + move - 1]);
                    }
                }
                start = i + 1;
                move = 0;
            }
        }

        tags = tags.slice(1, -1);

        // console.log(tags);

        return tags;

    }


    /**
     * drawLines: draw lines with canvas api
     * @param  {Array} lines  list of lines position
     * @param  {String} direct 'col' / 'row', 'col' by default. 
     * @param  {Array} rect   [startLeft, startTop, width, height]
     */
    function drawLines(lines, direct, rect){

        var rect = rect || [0, 0, width, height];

        ctx.lineWidth = "1";
        ctx.strokeStyle = "red";

        for(var i = 0, len = lines.length; i < len; i++){
            ctx.beginPath();

            if(direct == "col"){
                ctx.moveTo(rect[0], lines[i] + rect[1]);
                ctx.lineTo(rect[0] + rect[2], lines[i] + rect[1]);
            } else {
                ctx.moveTo(lines[i] + rect[0], rect[1]);
                ctx.lineTo(lines[i] + rect[0], rect[1] + rect[3]);
            }
            
            ctx.stroke();
        }
    }

    /**
     * drawLinesWithDOM: draw lines with DOM
     * @param  {Array} lines  list of lines position
     * @param  {String} direct 'col' / 'row', 'col' by default. 
     * @param  {Array} rect   [startLeft, startTop, width, height]
     */
    function drawLinesWithDOM(lines, direct, rect){

        var rect = rect || [0, 0, width, height];

        for(var i = 0, len = lines.length; i < len; i++){

            var line = document.createElement("div");
            line.className = "line";

            if(direct == "col"){
                with(line.style){
                    left = rect[0] + 1;
                    top = rect[1] + lines[i] + 1;
                    width = rect[2];
                    height = 0;
                    borderTop = "1px solid red";
                }
                line.setAttribute("data-direct", "col");
            } else {
                with(line.style){
                    left = rect[0] + lines[i] + 1;
                    top = rect[1] + 1;
                    width = 0;
                    height = rect[3];
                    borderLeft = "1px solid red";
                }
                line.setAttribute("data-direct", "row");
            }
            box.appendChild(line);
        }
    }

    /**
     * drawRectange: draw rectange with a div
     * @param  {Array} rect   [startLeft, startTop, width, height]
     * @param  {Function} cb  callback function.
     */
    function drawRectange(area, cb){
        var rect = document.createElement("div");

        if(!config['ready']) return;

        rect.className = 'area-rect';
        config['MAX_STEPS'] = 4;

        area.onmousedown = function(e){
            if(e.target.nodeName.toLowerCase() != "canvas") return;

            area.onmousemove = function(e){
                document.onkeydown = function(e){
                    // Press ESC to exit.
                    if(e.keyCode == 27){
                        document.onkeydown = area.onmousemove = area.onmouseup = null;

                        with(rect.style){
                            display = "none";
                            width = 0;
                            height = 0;
                            cursor = "default";
                        }
                    }
                };
                area.onmouseup = function(){
                    rect.style.cursor = "default";
                    rect.style.display = "none";
                    area.onmousemove = area.onmouseup = null;

                    var left = parseInt(rect.style.left)
                      , top = parseInt(rect.style.top)
                      , w = parseInt(rect.style.width)
                      , h = parseInt(rect.style.height);

                    w = w + left > width ? width - left : w;
                    h = h + top > height ? height - top : h;

                    // if size is too small, return.
                    var ret = w <= 3 && h <= 3 ? false : [left, top, w, h];

                    if(ret != false){
                        cb && cb(ret);
                    }

                    return ret;
                }

                var delta = _getOffset(area);
                with(rect.style){
                    width = e.pageX - parseInt(left) - delta.left;
                    height = e.pageY - parseInt(top) - delta.top;
                    width = width < 0 ? 0 : width;
                    height = height < 0 ? 0 : height;
                }
            };

            area.appendChild(rect);

            var delta = _getOffset(area);
            with(rect.style){
                display = "block";
                width = 0;
                height = 0;
                left = e.pageX - delta.left;
                top = e.pageY - delta.top;
                cursor = "nw-resize";
            }
        };
    }

    /**
     * _getOffset get object offsetTop and offsetLeft
     * @param {DOM} obj
     * @return {Object} left and top
     */
    function _getOffset(obj){
        var l = 0, t = 0;

        while(obj){
            t += parseInt(obj.offsetTop);
            l += parseInt(obj.offsetLeft);
            obj = obj.offsetParent;
        }

        return {
            left: l,
            top: t
        }
    }

    /**
     * detectInRectange detect the line in rectange or not
     * @param  {Array} lines lines to be detected. 
     * @param  {Array} rect   [startLeft, startTop, width, height]
     * @return {Array}
     */
    function detectInRectange(lines, rect, cb){

        var ret = [], style, l, t, w, h, direct;

        if(!rect) throw new Error("Please input the second param.");

        for(var i = 0, len = lines.length; i < len; i++){
            style = lines[i].style;
            l = parseInt(style.left);
            t = parseInt(style.top);
            w = parseInt(style.width);
            h = parseInt(style.height);
            direct = lines[i].getAttribute("data-direct");

            if(direct == "col"){
                if(
                    (t >= rect[1]) && (t <= rect[1] + rect[3]) && 
                    (
                        (l >= rect[0]) && (l <= rect[0] + rect[2]) || 
                        (l + w >= rect[0]) && (l + w <= rect[0] + rect[2]) || 
                        (l <= rect[0]) && (l + w >= rect[0] + rect[2])
                    )
                ) {
                    ret.push(lines[i]);
                }
            } else {
                if(
                    (l >= rect[0]) && (l <= rect[0] + rect[2]) && 
                    (
                        (t >= rect[1]) && (t <= rect[1] + rect[3]) || 
                        (t + h >= rect[1]) && (t + h <= rect[1] + rect[3]) || 
                        (t <= rect[1]) && (t + h >= rect[1] + rect[3])
                    )
                ) {
                    ret.push(lines[i]);
                }
            }
        }

        cb && cb(ret);

        return ret;
    }

    /**
     * getInfoRect
     * @param  {Array} rect   [startLeft, startTop, width, height] / [x, y]
     * @param  {Function} cb   [description]
     * @return {Array}        [startLeft, startTop, width, height]
     */
    function getInfoRect(rect, cb){
        var rect = rect.length == 2 ? rect.concat([0, 0]) : rect
          , rows = document.querySelectorAll("[data-direct=row]")
          , cols = document.querySelectorAll("[data-direct=col]")
          , ret = [];

        rows = [].slice.call(rows).map(function(item){
            return parseInt(item.style.left);
        }).sort(function(a, b){ return a - b});
        cols = [].slice.call(cols).map(function(item){
            return parseInt(item.style.top);
        }).sort(function(a, b){ return a - b});

        var t, l, r, b, i, len;
        for(i = 0, len = rows.length; i < len; i++){
            if(l && r) break;

            if(!l && (rows[i] >= rect[0])){
                l = rows[i - 1];
            }
            if(!r && (rows[i] >= rect[0] + rect[2])){
                r = rows[i];
            }
        }
        !l && (l = 0), !r && (r = width);

        for(i = 0, len = cols.length; i < len; i++){
            if(t && b) break;

            if(!t && (cols[i] >= rect[1])){
                t = cols[i - 1];
            }
            if(!b && (cols[i] >= rect[1] + rect[3])){
                b = cols[i];
            }
        }
        !t && (t = 0), !b && (b = height);
        ret = [l, t, r - l - 3, b - t - 3];

        cb && cb(ret);

        return ret;
    }

    /**
     * drawInfoRect
     * @param  {Array} rect   [startLeft, startTop, width, height] / [x, y]
     */
    function drawInfoRect(area, rect){
        var infoRectL = document.createElement("div")
          , infoRectR = document.createElement("div")
          , infoRectT = document.createElement("div")
          , infoRectB = document.createElement("div");

        try{
            [].slice.call(document.querySelectorAll(".info-rect")).forEach(function(item){
                item.remove();
            });
        }catch(e){}

        infoRectL.className = infoRectR.className = 
            infoRectT.className = infoRectB.className = 'info-rect';

        infoRectL.style.top   = infoRectR.style.top   = rect[1];
        infoRectL.style.height  = infoRectR.style.height  = rect[3] + 4;
        infoRectL.style.width = infoRectR.style.width = 0;
        infoRectL.style.borderRight = "2px solid blue";
        infoRectR.style.borderLeft = "2px solid blue"
        infoRectL.style.left    = rect[0];
        infoRectR.style.left    = rect[0] + rect[2] + 2;

        infoRectT.style.left   = infoRectB.style.left   = rect[0];
        infoRectT.style.width  = infoRectB.style.width  = rect[2] + 4;
        infoRectT.style.height = infoRectB.style.height = 0;
        infoRectT.style.borderBottom = '2px solid blue';
        infoRectB.style.borderTop = '2px solid blue'
        infoRectT.style.top    = rect[1];
        infoRectB.style.top    = rect[1] + rect[3] + 2;

        area.appendChild(infoRectT);
        area.appendChild(infoRectL);
        area.appendChild(infoRectR);
        area.appendChild(infoRectB);
    }

    /**
     * moveObj move the paint obj
     */
    function moveObj(obj, tag){

        obj.style.cursor = "move";  

        if(!config['ready'] && config['moveObjTag'] && tag) {
            obj.onmousedown = null;
            obj.style.cursor = "default";  
            return;
        }

        obj.onmousedown = function(e){

            var sX = e.pageX - parseInt(obj.style.left||0)
              , sY = e.pageY - parseInt(obj.style.top||0);

            obj.onmousemove = function(e){

                obj.onmouseup = function(e){
                    obj.onmousemove = obj.onmouseup = null;
                }

                with(obj.style){
                    left = e.pageX - sX;
                    top = e.pageY - sY;
                }
            }
        }
    }

    /**
     * [getColor description]
     */
    function getColor(){
        can.style.cursor = "pointer";

        if(!config['ready'] && config['colorTag']) {
            can.onmousedown = null;
            can.style.cursor = "default";  
            return;
        }

        var colorInfo = document.createElement("div");

        colorInfo.className = "color-info-box";


        var bDelta = _getOffset(document.querySelector(".wrapper"));
        var delta = _getOffset(box);
        can.onmousemove = function(e){
              var x = e.pageX 
                , y = e.pageY;

            var pixel = ctx.getImageData(x - delta.left, y - delta.top, 1, 1).data;

            var ret = "rgba(", c = "#";

            [].slice.call(pixel).forEach(function(item, index){
                if(index == pixel.length - 1){
                    ret += ((item / 255).toFixed(8) + ")");
                    return;
                }
                ret += item + ",";

                var s = item.toString(16);
                c += (s < 10 ? "0" + s : s);
            });

            with(colorInfo.style){
                top = y - 20  - delta.top;
                left = x + 20  - delta.left;

                top = Math.max(bDelta.top, top);
                left = Math.min(bDelta.left + box.offsetWidth, left);
            }

            colorInfo.innerHTML = "<span></span>" + c.toUpperCase();

            box.appendChild(colorInfo);

            colorInfo.getElementsByTagName("span").item(0).style.backgroundColor = c;
        }
    }

    return window.Core = Core = {
        config:            config,
        clearLines:        clearLines,
        getLines:          getLines,
        drawLines:         drawLines,
        drawLinesWithDOM:  drawLinesWithDOM,
        drawRectange:      drawRectange,
        detectInRectange:  detectInRectange,
        getInfoRect:       getInfoRect,
        drawInfoRect:      drawInfoRect,
        setTurnerTag:      setTurnerTag,
        toggleClass:       toggleClass,
        moveObj:           moveObj,
        getColor:          getColor
    }

})(window, undefined);