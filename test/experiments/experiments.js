oCanvas.DOMready(function(){
	var C = oCanvas.newCanvas();
	
	var cW, cH, frames = 0;
	var lines = new Array();
	var rectangles = new Array();
	var ellipses = new Array();
	var polygons = new Array();
	var objects = new Array();
	C.setup({
		canvas: "canvas",
		fps: 30,
		background: "#000",
		clearEachFrame: true,
		drawEachFrame: true,
		disableScrolling: true
	});
	
	cW = C.canvas.width;
	cH = C.canvas.height;
	
	$("#framerate").val(C.timeline.fps);
	
	drawInit();
	
	function drawInit()
	{
		if(!C.background.loaded)
			return setTimeout(function(){ drawInit(); },100);
		
		/*objects.push(new C.Rectangle(50,50,200,100,"fill","#fff").draw());
		objects.push(new C.Rectangle(250,250,200,100,"fill","#fff").draw());
		
		objects.push(new C.Line(50,100,150,100,50,"#fff").draw());
		objects.push(new C.Line(400,300,500,300,50,"#fff").draw());*/
		
		//objects.push(new C.Ellipse(289,200,250,125,"fill","#fff").draw());
		
		//objects.push(new C.Ellipse(50,100,150,150,"fill","#fff").draw());
		//objects.push(new C.Ellipse(400,300,500,300,"fill","#fff").draw());
		
		//objects.push(new C.Polygon(289,200,7,50,"fill","#fff").draw());
		
		//objects.push(new C.Arc(289,200,100,0,220,false,"fill","#fff").draw());
		
		/*
		objects[0].mousedown(function(){
			objects[0].startDrag();
		}).mouseup(function(){
			objects[0].stopDrag();
		}).mouseover(function(){
			objects[0].fillColor = "#ff0000";
		}).mouseout(function(){
			objects[0].fillColor = "#ffffff";
		});
		
		objects[1].mousedown(function(){
			objects[1].startDrag();
		}).mouseup(function(){
			objects[1].stopDrag();
		}).mouseover(function(){
			objects[1].fillColor = "#00ff00";
		}).mouseout(function(){
			objects[1].fillColor = "#ffffff";
		});*/
		
		/*objects[0].isRotating = true;
		objects[0].isPendulum = true;*/
		/*objects[1].isRotating = true;
		objects[1].isPendulum = true;*/
		
		/*objects[0].click(function(){
			objects[1].sides++;
		}).mouseover(function(){
			if(C.mouse.buttonState == "up")
				objects[0].fillColor = "#ff0000";
		}).mouseout(function(){
			if(C.mouse.buttonState == "up")
				objects[0].fillColor = "#ffffff";
		});*/
	
		/*objects[1].click(function(){
			objects[1].rotate(-10);
		}).mouseover(function(){
			objects[1].fillColor = "#ff0000";
		}).mouseout(function(){
			objects[1].fillColor = "#ffffff";
		});*/
		/*
		var player = new C.Rectangle(C.canvas.width/2-15,C.canvas.height/2,30,30,"fill","#ffffff").draw();
		var obstacle1 = new C.Rectangle(C.canvas.width/2-75,C.canvas.height/2-150,150,10,"fill","#ffffff").draw();
		var obstacle2 = new C.Rectangle(C.canvas.width/2-75,C.canvas.height/2-100,150,10,"fill","#ffffff").draw();
		
		C.keyPress(C.keyboard.SPACE,function(e){
			player.rotate(-5);
		});
		C.keyPress(C.keyboard.ARROW_LEFT,function(e){
			player.move(-5,0);
		});
		C.keyPress(C.keyboard.ARROW_RIGHT,function(e){
			player.move(5,0);
		});
		C.keyPress(C.keyboard.ARROW_DOWN,function(e){
			player.move(0,5);
			obstacle1.move(-5,0);
			obstacle2.move(5,0);
		});
		C.keyPress(C.keyboard.ARROW_UP,function(e){
			player.move(0,-5);
			obstacle1.move(5,0);
			obstacle2.move(-5,0);
		});*/
		
		
		var button1 = new C.Rectangle(50,50,80,40,"fill","#fff").draw(),
			button2 = new C.Rectangle(50,100,80,40,"fill","#fff").draw(),
			button3 = new C.Rectangle(50,150,80,40,"fill","#fff").draw(),
			button4 = new C.Rectangle(50,200,80,40,"fill","#fff").draw(),
			button5 = new C.Rectangle(50,250,80,40,"fill","#fff").draw(),
			box1 = new C.Rectangle(300,50,100,50,"fill","#fff").draw(),
		
			animationSpeed = 500,
			easing = 'easeInEaseOut';
			
		var dir = 'down';
		button1.mouseover(function(){
			button1.fillColor = "#ff0000";
		}).mouseout(function(){
			button1.fillColor = "#ffffff";
		}).click(function(){
			if(dir == 'down'){
				box1.stop().animate({y:100},animationSpeed,'easeInEaseOut');
				dir = 'up';
			}else{
				box1.stop().animate({y:-50},animationSpeed,'easeInEaseOut');
				dir = 'down';
			}
		});
		button2.mouseover(function(){
			button2.fillColor = "#ff0000";
		}).mouseout(function(){
			button2.fillColor = "#ffffff";
		}).click(function(){
			//box1.setOrigin(box1.x+box1.width,box1.y);
			//box1.animate({x:box1.x+100},animationSpeed,'linear');
			box1.setOrigin(box1.x-20,box1.y-20);
			box1.animate({rotation:90},animationSpeed,'easeInEaseOut',true);
		});
		button3.mouseover(function(){
			button3.fillColor = "#ff0000";
		}).mouseout(function(){
			button3.fillColor = "#ffffff";
		}).click(function(){
			box1.setOrigin(box1.x+box1.width,box1.y+box1.height);
			box1.animate({width:box1.width+100,height:box1.height+50},animationSpeed,easing);
		});
		button4.mouseover(function(){
			button4.fillColor = "#ff0000";
		}).mouseout(function(){
			button4.fillColor = "#ffffff";
		}).click(function(){
			box1.setOrigin(box1.x,box1.y+box1.height);
			box1.animate({width:box1.width+100,height:box1.height+50},animationSpeed,easing);
		});
		button5.mouseover(function(){
			button5.fillColor = "#ff0000";
		}).mouseout(function(){
			button5.fillColor = "#ffffff";
		}).click(function(){
			box1.setOrigin(box1.centerX,box1.centerY);
			box1.animate({width:box1.width+100,height:box1.height+50},animationSpeed,easing);
		});
	}
	
	function calcFPS()
	{
		$("#calculated_fps").html(frames);
		frames = 0;
	}
	setInterval(function(){ calcFPS(); },1000);
	
	var followCursor = false;
	
	C.mainLoop = function()
	{
		rotateOneFrame();
		frames++;
	}
	
	var lastMx = C.mouse.x,
		lastMy = C.mouse.y;
	
	function rotateOneFrame()
	{
		for(var i = 0; i < objects.length; i++)
		{
			if(followCursor && C.mouse.canvasHovered){
				objects[i].move((C.mouse.x-objects[i].centerX)/20,(C.mouse.y-objects[i].centerY)/20);
				lastMx = C.mouse.x;
				lastMy = C.mouse.y;
			}else if(followCursor){
				objects[i].move((lastMx-objects[i].centerX)/20,(lastMy-objects[i].centerY)/20);
			}
			if(objects[i].isPendulum)
			{
				if(objects[i].radius)
					objects[i].pendulum(25,210,0.01,0.01);
				else
					objects[i].pendulum(50,400,0.01,0.01);
			}else if(objects[i].isScaling)
				objects[i].scale(1.01);
			if(objects[i].isRotating)
				objects[i].rotate(1);
		}
	}
	
	function reset()
	{
		C.pause();
		C.clear();
		for(var x in objects)
			delete objects[x];
		objects = new Array();
		init();
		if($("#start").html() == "Start"){
			C.play();
			$("#start").html("Stop");
		}else{
			C.pause();
			$("#start").html("Start");
		}
	}
	
	function newObject(type)
	{
		switch(type)
		{
			case "line":
				objects.push(new C.Line(cW/2-50,cH/2,cW/2+50,cH/2,2,"random").draw());
			break;
			
			case "rectangle":
				objects.push(new C.Rectangle(cW/2-100,cH/2-50,200,100,(C.timeline.currentFrame % 2 ? "stroke" : "fill"),"random","random",2).draw());
			break;
			
			case "polygon":
				objects.push(new C.Polygon(cW/2,cH/2,5,100,(C.timeline.currentFrame % 2 ? "stroke" : "fill"),"random","random",2).draw());
			break;
			
			case "ellipse":
				objects.push(new C.Ellipse(cW/2,cH/2,150,150,(C.timeline.currentFrame % 2 ? "stroke" : "fill"),"random","random",2).draw());
			break;
			
			case "arc":
				objects.push(new C.Arc(cW/2,cH/2,100,90,225,false,"stroke","#000","random",2).draw());
			break;
			
			case "point":
				objects.push(new C.Point(Math.random()*cW,Math.random()*cH,"random").draw());
			break;
			
			case "image":
				objects.push(new C.Image('twitter.png',cW/2-33.5,cH/2-26).draw());
			break;
		}
		if(type != "point")
		{
			var o = objects.length-1;
			objects[o].isPendulum = true;
			objects[o].isScaling = false;
			objects[o].isRotating = true;
		}
	}
		
	$("#start").click(function(){ if($(this).html() == "Start"){ C.play(); $(this).html("Stop"); }else{ C.pause(); $(this).html("Start"); } });
	$("#reset").click(reset);
	$("#rotate").click(function(){ rotateOneFrame(); C.drawState.draw(); });
	$("#follow_cursor").change(function(){ if($(this).is(":checked")){ followCursor = true; }else{ followCursor = false; } });
	$("#update_framerate").click(function(){ C.timeline.setFPS($("#framerate").val()); });
		
	$("#newLine").click(function(){ newObject("line"); });
	$("#newRectangle").click(function(){ newObject("rectangle"); });
	$("#newPolygon").click(function(){ newObject("polygon"); });
	$("#newEllipse").click(function(){ newObject("ellipse"); });
	$("#newArc").click(function(){ newObject("arc"); });
	$("#newPoint").click(function(){ newObject("point"); });
	$("#newImage").click(function(){ newObject("image"); });
});