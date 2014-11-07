var can = document.getElementById("can")
  , f = document.getElementById("f")
  , cols = document.getElementById("cols")
  , rows = document.getElementById("rows")
  , clear = document.getElementById("clear")
  , box = document.getElementById("box")
  , ctx = can.getContext("2d")
  , ready = false
  , width, height;

var MAX_STEPS = 8
  , DECIMAL = 3;

f.onchange = function(e){
    var resultFile = e.target.files[0];

    clearLines();

    if (resultFile) {
        var reader = new FileReader();
        
        reader.readAsDataURL(resultFile);
        reader.onload = function (e) {
            var urlData = this.result;
            var img = new Image();
            img.src = urlData;
            img.onload = function(){

                can.width = width = this.width;
                can.height = height = this.height;
                ctx.drawImage(img, 0, 0);

                ready = true;
            }
        }; 
    }
};

cols.onclick = function(){
    if(!ready) return;

    MAX_STEPS = 8;

    var lines = getLines("col");
    drawLinesWithDOM(lines, "col");
};

rows.onclick = function(){
    if(!ready) return;

    MAX_STEPS = 8;
    
    var rect = [0, 213, width, 51];
    var lines = getLines("row", rect);
    drawLinesWithDOM(lines, "row", rect);
};

clear.onclick = clearLines;

drawRect = true;
drawRectange(box, function(rect){
    var clines = getLines("col", rect);
    //var rlines = getLines("row", rect);
    drawLinesWithDOM(clines, "col", rect);
    //drawLinesWithDOM(rlines, "row", rect);
}, true);


function clearLines(){
    var divs = document.querySelectorAll(".line");

    for(var i = 0, len = divs.length; i < len; i++){
        divs[i].remove();
    }
}

function getLines(direct, rect, bound){
    var rect = rect || [0, 0, width, height]
      , imageData = ctx.getImageData.apply(ctx, [0, 0, width, height])
      , direct = direct || "col"
      , pixels = imageData.data
      , lineArr = []
      , max, i, outer, inner, oBegin, iBegin;

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
            lineArr.push((max / rect[2]).toFixed(DECIMAL));
        }
    } else {
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
            lineArr.push((max / rect[3]).toFixed(DECIMAL));
        }
    }

    return getTagsFromLines(lineArr, direct, bound);
}


function getTagsFromLines(lineArr, direct, bound){
    var tags = []
      , start = 0
      , move = 0
      , i = 0, len;

    console.log(lineArr);

    for(len = lineArr.length; i < len; i++){
        if(lineArr[i] == lineArr[start] && i < len - 1){
            move++;
        } else {
            if(move >= MAX_STEPS || tags.length == 0){
                if(tags.length && (start - tags[tags.length - 1] <= MAX_STEPS)) {
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

    console.log(tags);

    return tags;

}


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
        } else {
            with(line.style){
                left = rect[0] + lines[i] + 1;
                top = rect[1] + 1;
                width = 0;
                height = rect[3];
                borderLeft = "1px solid red";
            }
        }
        box.appendChild(line);
    }
}

function drawRectange(area, cb){
    var rect = document.createElement("div");

    rect.className = 'area-rect';
    MAX_STEPS = 4;

    area.onmousedown = function(e){
        if(!ready) return;
        if(e.target.nodeName.toLowerCase() != "canvas") return;

        area.onmousemove = function(e){
            document.onkeydown = function(e){
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

                var ret = w <= 0 && h <= 0 ? [0, 0, width, height] : [left, top, w, h];
                cb && cb(ret);
            }

            with(rect.style){
                width = e.pageX - parseInt(left);
                height = e.pageY - parseInt(top);

                width = width < 0 ? 0 : width;
                height = height < 0 ? 0 : height;
            }
        };

        area.appendChild(rect);
        with(rect.style){
            display = "block";
            width = 0;
            height = 0;
            left = e.pageX - area.offsetLeft;
            top = e.pageY - area.offsetTop;
            cursor = "nw-resize";
        }
    };

}