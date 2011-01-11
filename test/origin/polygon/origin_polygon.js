oCanvas.DOMready(function(){
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas',fps:30,background:"#000000"});
		c.console.enabled = false;
		
		var poly = new c.Polygon(150,150,5,100,"fill","#fff").draw(),
			functions = {},
			buttons = {},
			buttonIDs = {
				SetOrigin: 'setorigin',
				Rotate: 'rotate',
				Move: 'move',
				ResizeRadius: 'resizeradius',
				ResizeSide: 'resizeside',
				ResizeRadiusAnimated: 'resizeradiusanimated',
				ResizeSideAnimated: 'resizesideanimated',
				Animate: 'animate',
				Draw: 'draw'
			};
		
		functions.SetOrigin = function(){ poly.setOrigin(0,0); };
		functions.Rotate = function(){ poly.rotate(10); };
		functions.Move = function(){ poly.x += 10; };
		functions.ResizeRadius = function(){ poly.radius += 50; };
		functions.ResizeSide = function(){ poly.side += 50; };
		functions.ResizeRadiusAnimated = function(){ poly.stop().animate({radius:30},500,'easeInEaseOut',true); };
		functions.ResizeSideAnimated = function(){ poly.stop().animate({side:30},500,'easeInEaseOut',true); };
		functions.Animate = function(){ poly.stop().animate({radius:200,rotation:360},1000,'easeInEaseOut',true); };
		functions.Draw = function(){ c.drawState.draw(); };

		for(var buttonID in buttonIDs)
		{
			buttons[buttonID] = document.getElementById(buttonIDs[buttonID]);
			if(typeof functions[buttonID] == "function")
				buttons[buttonID].addEventListener('click',functions[buttonID],false);
		}
		
		c.mainLoop = function(){
			poly.rotation++;
		};
		

	});
});