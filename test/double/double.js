oCanvas.DOMready(function(){
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas',fps:30,background:"#000000"});
		var line = new c.Line((c.canvas.width-300)/2,c.canvas.height/2,(c.canvas.width-300)/2+300,c.canvas.height/2,2,"random").draw();
		c.mainLoop = function(){
			line.rotate(-1);
		};
		c.play();
	});
	
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas_second',fps:30,background:"#000000"});
		var line = new c.Line((c.canvas.width-300)/2,c.canvas.height/2,(c.canvas.width-300)/2+300,c.canvas.height/2,2,"random").draw();
		c.mainLoop = function(){
			line.rotate(1);
		};
		c.play();
	});
});