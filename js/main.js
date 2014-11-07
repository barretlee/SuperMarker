var can = document.getElementById("can")
  , f = document.getElementById("f")
  , cols = document.getElementById("cols")
  , rows = document.getElementById("rows")
  , clear = document.getElementById("clear")
  , box = document.getElementById("box")
  , ctx = can.getContext("2d")
  , ready = false
  , width, height;


window.onload = function() {

	f.onchange = function(e){
	    var resultFile = e.target.files[0];

	    ready = false;
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

	                ready = true;
	            }
	        }; 
	    }
	};

	cols.onclick = function(){
	    if(!ready) return;

	    Core.config['MAX_STEPS'] = 8;

	    var lines = Core.getLines("col");
	    Core.drawLinesWithDOM(lines, "col");
	};

	rows.onclick = function(){
	    if(!ready) return;

	    Core.config['MAX_STEPS'] = 8;
	    
	    //var rect = [0, 213, width, 51];
	    var lines = Core.getLines("row");
	    Core.drawLinesWithDOM(lines, "row");
	};

	clear.onclick = Core.clearLines;

	drawRect = true;
	Core.drawRectange(box, function(rect){
	    var clines = Core.getLines("col", rect);
	    //var rlines = getLines("row", rect);
	    Core.drawLinesWithDOM(clines, "col", rect);
	    //drawLinesWithDOM(rlines, "row", rect);
	});
};

