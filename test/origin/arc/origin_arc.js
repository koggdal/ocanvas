oCanvas.DOMready(function(){
	oCanvas.newCanvas(function(c){
		c.setup({canvas:'canvas',fps:30,background:"#000000"});
		
		// pacman arc
		//var arc = new c.Arc(150,150,50,30,330,false,"stroke","#fff","#ff0",100).draw(),
		
		var arc = new c.Arc(150,150,100,30,330,false,"stroke","#fff","#ff0",10).draw(),
			functions = {},
			buttons = {},
			buttonIDs = {
				SetOrigin: 'setorigin',
				Rotate: 'rotate',
				Move: 'move',
				ConvertToPacMan: 'converttopacman',
				ConvertToArc: 'converttoarc',
				Resize: 'resize',
				ResizeAnimated: 'resizeanimated',
				Animate: 'animate',
				Draw: 'draw'
			},
			tempLineWidth = 10,
			tempRadius = 100;
		
		functions.SetOrigin = function(){ arc.setOrigin(0,0); };
		functions.Rotate = function(){ arc.rotate(45); };
		functions.Move = function(){ arc.x += 20; arc.y += 10; c.drawState.draw(); };
		functions.ConvertToPacMan = function(){ tempLineWidth = arc.lineWidth; tempRadius = arc.radius; arc.lineWidth = arc.radius; arc.radius /= 2; c.drawState.draw(); };
		functions.ConvertToArc = function(){ arc.lineWidth = tempLineWidth; arc.radius = tempRadius; c.drawState.draw(); };
		functions.Resize = function(){ arc.radius += 50; };
		functions.ResizeAnimated = function(){ arc.stop().animate({startAngle:(arc.startAngle > 0 ? 0 : 30),endAngle:(arc.endAngle > 330 ? 330 : 360)},500,'easeInEaseOut',false); };
		functions.Animate = function(){ arc.stop().animate({radius:arc.radius*1.5,lineWidth:arc.lineWidth*1.5,rotation:arc.rotation+360},1000,'easeInEaseOut',false); };
		functions.Draw = function(){ c.drawState.draw(); };

		for(var buttonID in buttonIDs)
		{
			buttons[buttonID] = document.getElementById(buttonIDs[buttonID]);
			if(typeof functions[buttonID] == "function")
				buttons[buttonID].addEventListener('click',functions[buttonID],false);
		}
	});
});