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
  , open2 = document.querySelector("#open2")
  , net = document.querySelector("#net")
  , move = document.querySelector("#move")
  , select = document.querySelector("#select")
  , info = document.querySelector("#info")
  , del = document.querySelector("#del")
  , box = document.querySelector("#box")
  , color = document.querySelector("#color")
  , ctx = can.getContext("2d")
  , width, height;

var githubURL = "http://ghbtns.com/github-btn.html?user=barretlee&repo=SuperMarker&type=watch&count=true&size=middle";

// Toggle class "on"
function tCls(that){
    [].slice.call(document.querySelectorAll("#control div")).forEach(function(item){
        item.className = "";
    });
    if(that) Core.toggleClass("on", that);
}

window.onload = function() {
    var delLines = [];

    // Select File
    file.onchange = function(e){
        var resultFile = e.target.files[0];

        if(open2){
            open2.setAttribute("loading", "yes");
            open2.innerHTML = "Loading...";
        }

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

                    file.blur();
                    open2 && open2.remove();

                    can.width = width = this.width;
                    can.height = height = this.height;
                    ctx.drawImage(img, 0, 0);

                    Core.config['ready'] = true;
                }
            }; 
        }
    };

    open2.onclick = function(){
        if(open2.getAttribute("loading") == "yes") return;
        file.click();
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

    // Rows draw
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

    // move
    move.onclick = function(){
        Core.setTurnerTag('moveObjTag');
        tCls(this);

        Core.moveObj(box, true);
    };    

    // Info box 
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

    // Select to delete
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
    // Cancal / reselect delete for some lines
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

    // Delete selected lines
    del.onclick = function(){
        this.className = "on";
        setTimeout(function(){
            del.className = "";
        }, 200);

        if(delLines.length > 0){
            [].slice.call(delLines).forEach(function(item){
                try{item.remove();}catch(e){}
            });
        }
        delLines = [];
    };

    // Clear all lines
    clear.onclick = function(){
        Core.clearLines();
    };

    color.onclick = function(){
        Core.setTurnerTag('colorTag');
        tCls(this);

        Core.getColor();
    }

    document.addEventListener("keyup", function(e){

        switch(e.keyCode) {
            case 32: // space
            case 77: // M
                move.click();
                break;
            case 83: // S
                select.click();
                break;
            case 73: // I
                info.click();
                break;
            case 72: // H
                cols.click();
                break;
            case 86: // V
                rows.click();
                break;
            case 78: // N
                net.click();
                break;
            case 68: // D
                del.click();
                break;
            case 67: // C
                color.click();
                break;
            case 27: // ESC
                Core.setTurnerTag();
                tCls();
                break;
            case 79: // O
                file.click();
                break;
        }
    }, false);

    // document.documentElement.onkeypress = function(e){
    //     var cb, tmp;

    //     if(e.keyCode == 32){
    //         tmp = document.querySelector(".on");
    //         move.onclick();
    //         document.documentElement.addEventListener("keyup", cb = function(){
    //             Core.setTurnerTag();
    //             tCls();
    //             tmp && tmp.click();

    //             document.documentElement.removeEventListener("keyup", cb, false);
    //         }, false);
    //     }
    // };

    document.querySelector(".github-star").setAttribute("src", githubURL);
};

