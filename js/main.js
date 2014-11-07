/**
 * Main Part
 * @author Barret Lee(barret.china@gmail.com)
 * @date 11/07/2014
 */

var can = document.querySelector("#can")
  , file = document.querySelector("#file")
  , cols = document.querySelector("#cols")
  , rows = document.querySelector("#rows")
  , clear = document.querySelector("#clear")
  , net = document.querySelector("#net")
  , select = document.querySelector("#select")
  , info = document.querySelector("#info")
  , del = document.querySelector("#del")
  , box = document.querySelector("#box")
  , ctx = can.getContext("2d")
  , width, height;


window.onload = function() {
    var delLines = [];

    // Select File
    file.onchange = function(e){
        var resultFile = e.target.files[0];

        Core.config['ready'] = false;
        Core.clearLines();

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

                    Core.config['ready'] = true;
                }
            }; 
        }
    };

    // Cols draw
    cols.onclick = function(){
        Core.setTurnerTag('drawlinesInRectTag');
        tCls(this);

        Core.drawRectange(box, function(rect){
            var clines = Core.getLines("col", rect);

            Core.config['MAX_STEPS'] = 8;
            Core.drawLinesWithDOM(clines, "col", rect);
        });
    };

    // rows draw
    rows.onclick = function(){
        Core.setTurnerTag('drawlinesInRectTag');
        tCls(this);

        Core.drawRectange(box, function(rect){
            var rlines = Core.getLines("row", rect);

            Core.config['MAX_STEPS'] = 8;
            Core.drawLinesWithDOM(rlines, "row", rect);
        });
    };

    // Net draw
    net.onclick = function(){
        Core.setTurnerTag('drawlinesInRectTag');
        tCls(this);

        Core.drawRectange(box, function(rect){
            var clines = Core.getLines("col", rect);
            var rlines = Core.getLines("row", rect);
            Core.drawLinesWithDOM(clines, "col", rect);
            Core.drawLinesWithDOM(rlines, "row", rect);
        });
    };

    // info box 
    info.onclick = function(){
        Core.setTurnerTag('drawInfoRectTag');
        tCls(this);

        Core.drawRectange(box, function(rect){
            Core.getInfoRect(rect, function(rect){
                // console.log(rect);
                Core.drawInfoRect(box, rect);
            });
        });
    };

    // select to delete
    select.onclick = function(){
        Core.setTurnerTag('selectlinesInRectTag');
        tCls(this);

        Core.drawRectange(box, function(rect){
            Core.detectInRectange(document.querySelectorAll(".line"), rect, function(lines){
                [].slice.call(lines).forEach(function(item){
                    if(item.getAttribute("data-del") == "yes"){
                        item.removeAttribute("data-del");
                    } else {
                        item.setAttribute("data-del", 'yes');
                    }
                });

                delLines = delLines.concat(lines);
            });
        });
    };
    // cancal delete for some lines
    document.addEventListener("click", function(e){
        var $this = e.target;
        if($this.getAttribute("data-del") == "yes"){
            $this.removeAttribute("data-del");
        }

        delLines = [];
        [].slice.call(document.querySelectorAll(".line")).forEach(function(item){
            if(item.getAttribute("data-del") == 'yes'){
                delLines.push(item);
            }
        });

    }, true);

    // delete selected lines
    del.onclick = function(){
        if(delLines.length > 0){
            [].slice.call(delLines).forEach(function(item){
                try{item.remove();}catch(e){}
            });
        }
        delLines = [];
    };

    // clear all lines
    clear.onclick = function(){
        Core.clearLines();
    };


    // toggle class "on"
    function tCls(that){
        [].slice.call(document.querySelectorAll("#control div")).forEach(function(item){
            item.className = "";
        });
        Core.toggleClass("on", that);
    }
};

