oCanvas.DOMready(function(){
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas',fps:30,background:"#000000"});
		
		var ellipse = new c.Ellipse(150,150,200,100,"fill","#fff").draw(),
			functions = {},
			buttons = {},
			buttonIDs = {
				SetOrigin: 'setorigin',
				Rotate: 'rotate',
				Move: 'move',
				Resize: 'resize',
				ResizeAnimated: 'resizeanimated',
				Animate: 'animate',
				Draw: 'draw'
			};
		
		functions.SetOrigin = function(){ ellipse.setOrigin('center','center'); };
		functions.Rotate = function(){ ellipse.rotate(45); };
		functions.Move = function(){ ellipse.x += 10; };
		functions.Resize = function(){ ellipse.width += 50; ellipse.height += 30; };
		functions.ResizeAnimated = function(){ ellipse.stop().animate({width:50,height:30},500,'easeInEaseOut',true); };
		functions.Animate = function(){ ellipse.stop().animate({width:200,height:100,rotation:360},1000,'easeInEaseOut',true); };
		functions.Draw = function(){ c.drawState.draw(); };

		for(var buttonID in buttonIDs)
		{
			buttons[buttonID] = document.getElementById(buttonIDs[buttonID]);
			if(typeof functions[buttonID] == "function")
				buttons[buttonID].addEventListener('click',functions[buttonID],false);
		}
		
	});
});