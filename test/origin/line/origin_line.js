oCanvas.DOMready(function(){
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas',fps:30,background:"#000000"});
		
		var line = new c.Line(150,150,350,250,5,"#fff").draw(),
			functions = {},
			buttons = {},
			buttonIDs = {
				SetOrigin: 'setorigin',
				Rotate: 'rotate',
				Move: 'move',
				Resize: 'resize',
				ResizeAnimated: 'resizeanimated',
				Animate: 'animate',
				SetStartX: 'setstartx',
				SetStartY: 'setstarty',
				SetEndX: 'setendx',
				SetEndY: 'setendy',
				SetStart: 'setstart',
				SetEnd: 'setend',
				Draw: 'draw'
			};
		
		functions.SetOrigin = function(){ line.setOrigin(-100,-100); };
		functions.Rotate = function(){ line.rotate(45); };
		functions.Move = function(){ line.x += 10; };
		functions.Resize = function(){ line.length += 50; };
		functions.ResizeAnimated = function(){ line.stop().animate({length:50},500,'easeInEaseOut',true); };
		functions.Animate = function(){ line.stop().animate({length:20,rotation:45},500,'easeInEaseOut',true); };
		functions.SetStartX = function(){ line.startX = 20; };
		functions.SetStartY = function(){ line.startY = 20; };
		functions.SetEndX = function(){ line.endX = 600; };
		functions.SetEndY = function(){ line.endY = 400; };
		functions.SetStart = function(){ line.start = {x:20,y:20}; };
		functions.SetEnd = function(){ line.end = {x:600,y:400}; };
		functions.Draw = function(){ c.drawState.draw(); };

		for(var buttonID in buttonIDs)
		{
			buttons[buttonID] = document.getElementById(buttonIDs[buttonID]);
			if(typeof functions[buttonID] == "function")
				buttons[buttonID].addEventListener('click',functions[buttonID],false);
		}
		
	});
});