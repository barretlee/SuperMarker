var can = document.getElementById("can")
  , f = document.getElementById("f")
  , cols = document.getElementById("cols")
  , rows = document.getElementById("rows")
  , clear = document.getElementById("clear")
  , del = document.getElementById("del")
  , box = document.getElementById("box")
  , ctx = can.getContext("2d")
  , ready = false
  , delLines = []
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

	del.onclick = function(){
		if(delLines.length > 0){
			[].slice.call(delLines).forEach(function(item){
				try{item.remove();}catch(e){}
			});
		}
		delLines = [];
	}

	drawlinesInRectTag = false;
	Core.drawRectange(box, function(rect){
		if(!drawlinesInRectTag) return;
	    var clines = Core.getLines("col", rect);
	    //var rlines = getLines("row", rect);
	    Core.drawLinesWithDOM(clines, "col", rect);
	    //drawLinesWithDOM(rlines, "row", rect);
	});

	selectlinesInRectTag = false;
	Core.drawRectange(box, function(rect){
		if(!selectlinesInRectTag) return;
	    
	    Core.detectInRectange(document.querySelectorAll(".line"), rect, function(lines){
	    	[].slice.call(lines).forEach(function(item){
	    		item.style.borderColor = "green";
	    		item.setAttribute("data-del", true);
	    	});

	    	delLines = delLines.concat(lines);
	    });
	});

	drawInfoRectTag = true;
	Core.drawRectange(box, function(rect){
		if(!drawInfoRectTag) return;
	    
	    Core.getInfoRect(rect, function(rect){
	    	console.log(rect);
	    	Core.drawInfoRect(box, rect);
	    });
	});
};

