oCanvas.DOMready(function(){
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas',fps:30,background:"#000000"});
		
		var txt = new c.Text(250,200,"Lorem ipsum dolor sit amet...","bold 3em Helvetica, Arial, sans-serif","center","alphabetic","fill","#fff").draw(),
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
		
		functions.SetOrigin = function(){ txt.setOrigin('center','center'); };
		functions.Rotate = function(){ /*txt.rotate(45);*/ txt.fontSize += 0.01; c.console.log('fontSize: '+txt.fontSize); c.drawState.draw(); };
		functions.Move = function(){ txt.fontSize = 40; };
		functions.Resize = function(){ txt.width += 50; txt.height += 30; };
		functions.ResizeAnimated = function(){ txt.stop().animate({fontSize:30},500,'easeInEaseOut',true); };
		functions.Animate = function(){ txt.stop().animate({fontSize:10},1000,'easeInEaseOut',true); };
		functions.Draw = function(){ c.drawState.draw(); };

		for(var buttonID in buttonIDs)
		{
			buttons[buttonID] = document.getElementById(buttonIDs[buttonID]);
			if(typeof functions[buttonID] == "function")
				buttons[buttonID].addEventListener('click',functions[buttonID],false);
		}
		
	});
});