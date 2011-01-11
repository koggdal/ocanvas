(function(window,document,undefined){
	var oCanvas = {
	
		DOMready: function(func){
			if(!document.body)
				return setTimeout("oCanvas.DOMready("+func+")",10);
			else
				func();
		},
		canvasList: [],
		newCanvas: function(func){
			var canvasID = oCanvas.canvasList.push(new oCanvas.classConstructor())-1,
				canvas = oCanvas.canvasList[canvasID];
			canvas.settings.canvasID = canvasID;
			if(typeof func == 'function')
				func(canvas);
			
			return canvas;
		},
		classConstructor: function(){
			var _class = this;
		
			_class.settings = {
				fps: 30,
				background: "transparent",
				clearEachFrame: false,
				drawEachFrame: true,
				disableScrolling: false
			};
			
			_class.setup = function(options){
				_class.extend(_class.settings,options);
				
				_class.canvasElement = (_class.settings.canvas.nodeName == "CANVAS") ? _class.settings.canvas : ((typeof _class.settings.canvas == "string") ? document.getElementById(_class.settings.canvas) : undefined);
				
				_class.canvas = _class.canvasElement.getContext('2d');
				_class.canvas.width = _class.canvasElement.width;
				_class.canvas.height = _class.canvasElement.height;
				
				_class.scenes = new _class.scenesCanvas();
				_class.timeline.init();
				_class.mouse.init();
				_class.keyboard.init();
				_class.play = _class.timeline.start;
				_class.pause = _class.timeline.stop;
				_class.background.set(_class.settings.background);
				
				if(_class.settings.plugins !== undefined)
					oCanvas.addPluginsToCanvas(_class.settings.plugins,_class.settings.canvasID);
			};
			
			/*
				Base functions
			*/
			
			_class.extend = function(settings,options){
				for(var x in options){
					settings[x] = options[x];
				}
			};
			
			_class.clear = function(keepBackground){
				if(keepBackground == undefined || keepBackground == true)
					_class.background.draw();
				else
					_class.canvas.clearRect(0,0,_class.canvas.width,_class.canvas.height);
			};
			_class.save = function(){
				_class.canvas.save();
			};
			_class.restore = function(){
				_class.canvas.restore();
			};
			
			_class.drawState = {
				objects: new Array(),
				drawn: new Array(),
				lastObjectID: 0,
				nextObjectID: function(){
					this.lastObjectID++;
					return this.lastObjectID;
				},
				add: function(obj){
					this.objects[obj.objectID-1] = obj;
					this.drawn[obj.objectID-1] = false;
				},
				remove: function(id){
					this.objects[id-1] = null;
				},
				draw: function(triggerID){
					_class.clear();
					var objects = this.objects,
						length = objects.length;
					
					for(var i = 0; i < length; i++)
					{
						if(objects[i] != null){
							if(typeof objects[i].drawObject == "function"){
								if(typeof objects[i].update == "function")
									objects[i].update();
								_class.transform.transformCanvas(objects[i].x,objects[i].y,objects[i].rotation);
								objects[i].drawObject();
								this.drawn[i] = true;
								_class.transform.transformCanvas(0,0,0);
							}
						}
					}
				}
			};
			
			_class.background = {
				bg: "",
				type: "transparent",
				loaded: false,
				
				set: function(value){
					this.type = (value == "transparent" ? "transparent" : (_class.style.isColor(value) ? "color" : "image"));
					
					if(this.type == "color"){
						this.bg = value;
						this.draw();
						this.loaded = true;
					}else if(this.type == "image"){
						this.bg = new Image();
						var that = this;
						this.bg.onload = function(){ that.loaded = true; that.draw(); };
						this.bg.src = value;
					}else{
						this.draw();
						this.loaded = true;
					}
				},
				
				get: function(){
					return {type:this.type, value:this.bg};
				},
				
				draw: function(){
					_class.canvas.clearRect(0,0,_class.canvas.width,_class.canvas.height);
					
					if(_class.background.type == "color" && _class.background.bg != ""){
						_class.canvas.fillStyle = _class.background.bg;
						_class.canvas.fillRect(0,0,_class.canvas.width,_class.canvas.height);
					}else if(_class.background.type == "image"){
						_class.canvas.drawImage(_class.background.bg,0,0);
					}
					
					
				}
			}
			
		
			_class.viewMode = {
				mode: "original",
				origStyles: "none",
			
				set: function(mode){
					this.mode = mode;
					var style = _class.canvasElement.style;
					if(this.origStyles == "none")
						this.origStyles = {position:style.position, top:style.top, left:style.left, padding:style.padding, margin:style.margin, border:style.border, zIndex:style.zIndex, width:_class.canvasElement.width, height:_class.canvasElement.height, overflow:document.body.style.overflow};
					
					if(mode == "fullscreen")
					{
						style.position = "absolute";
						style.top = 0;
						style.left = 0;
						style.padding = '0';
						style.margin = '0';
						style.zIndex = 1000000;
						_class.canvasElement.width = window.innerWidth;
						_class.canvasElement.height = window.innerHeight;
						document.body.style.overflow = 'hidden';
					}
					else
					{
						var origStyles = this.origStyles;
						
						style.position = origStyles.position;
						style.top = origStyles.top;
						style.left = origStyles.left;
						style.padding = origStyles.padding;
						style.margin = origStyles.margin;
						style.zIndex = origStyles.zIndex;
						_class.canvasElement.width = origStyles.width;
						_class.canvasElement.height = origStyles.height;
						document.body.style.overflow = origStyles.overflow;
					}
				}
			};
			
			_class.timeline = {
			
				init: function(){
					this.currentFrame = 1;
					this.fps = _class.settings.fps;
					this.timeline = 0;
					this.running = false;
				},
				
				loop: function(){
					if(typeof _class.mainLoop == "function")
					{
						if(_class.settings.clearEachFrame == true)
							_class.clear();
						_class.mainLoop();
						if(_class.settings.drawEachFrame == true)
							_class.drawState.draw();
						this.currentFrame++;
					}
				},
			
				start: function(){
					clearInterval(_class.timeline.timeline);
					_class.timeline.timeline = setInterval(function(){ _class.timeline.loop(); },1000/_class.timeline.fps);
					_class.timeline.running = true;
				},
				
				stop: function(){
					clearInterval(_class.timeline.timeline);
					_class.timeline.running = false;
				},
				
				setFPS: function(fps){
					_class.settings.fps = fps;
					_class.timeline.fps = fps;
					if(_class.timeline.running)
						_class.timeline.start();
				}
			};
			
			_class.transform = {
				rotation: 0,
				translation: {x:0,y:0},
				
				rotate: function(angle,rotation){
					if(angle < 0)
						rotation += 360+angle;
					else
						rotation += angle;
					
					
					return rotation;
				},
				
				transformCanvas: function(centerX,centerY,angle){
					if(angle !== undefined)
						this.rotation = -this.rotation+angle;
					if(angle === 0){
						centerX = 0;
						centerY = 0;
					}
					this.translation = {x:-this.translation.x+centerX, y:-this.translation.y+centerY};
					var translationX = this.translation.x,
						translationY = this.translation.y,
						rotation = this.rotation;
					
					if((translationX < 0 || translationY < 0)){
						if(centerX < 0 && centerY < 0)
						{
							if(angle !== undefined){
								_class.canvas.rotate(rotation * Math.PI/180);
							}
							_class.canvas.translate(translationX,translationY);
						}
						else if(centerX < 0 || centerY < 0)
						{
							_class.canvas.translate(translationX,translationY);
							if(angle !== undefined){
								_class.canvas.rotate(rotation * Math.PI/180);
							}
						}
						else
						{
							if(angle !== undefined){
								_class.canvas.rotate(rotation * Math.PI/180);
								this.rotation = 0;
							}
							_class.canvas.translate(translationX,translationY);
							this.translation = {x:0,y:0};
						}
					}else{
						if(centerX < 0 && centerY < 0)
						{
							if(angle !== undefined)
								_class.canvas.rotate(rotation * Math.PI/180);
							_class.canvas.translate(translationX,translationY);
						}
						else
						{
							_class.canvas.translate(translationX,translationY);
							if(angle !== undefined)
								_class.canvas.rotate(rotation * Math.PI/180);
						}
					}
				},
				
				scale: function(changeX,changeY,valueX,valueY){
					if(changeY == undefined || changeX == changeY){
						valueX *= changeX;
						valueY *= changeX;
					}else{
						valueX *= changeX;
						valueY *= changeY;
					}
					
					return {x:valueX,y:valueY};
				}
			};
			
			_class.animation = {
				settings: {
					defaultDuration: 1000,
					defaultEasing: 'easeInEaseOut'
				},
				
				animationQueue: {
					activeAnimations: {},
					timer: 0
				},
				
				easing: {
					linear: function(currentValue,endValue,startValue,duration,currentTime){
						var value = (endValue-startValue)/(duration/1000*_class.settings.fps)+currentValue;
						return (value > endValue) ? endValue : value;
					},
					easeInEaseOut: function(currentValue,endValue,startValue,duration,currentTime){
						var factor = (Math.sin(currentTime/duration*Math.PI-Math.PI/2)+1)/2;
						return factor*(endValue-startValue)+startValue;
					}
				},
				
				animate: function(parameters,duration,easingMethod,object,runFromQueue,increment){
					if(duration === undefined) var duration = this.settings.defaultDuration;
					if(easingMethod === undefined) var easingMethod = this.settings.defaultEasing;
					if(increment === undefined) var increment = false;
					
					var queue = this.animationQueue,
						objectID = object.objectID;
					if(objectID in queue === false) queue[objectID] = [];
					var objectQueue = queue[objectID];
					if(runFromQueue !== true){
						objectQueue.push(function(){ _class.animation.animate(parameters,duration,easingMethod,object,true,increment); });
						var length = objectQueue.length, i;
						for(i = 0; i < length; i++)
						{
							if(typeof objectQueue[i] == 'function' && queue.activeAnimations[objectID] !== true){
								objectQueue[i]();
								queue.activeAnimations[objectID] = true;
								objectQueue[i] = null;
								return;
							}
						}
						return;
					}
				
					var parameter, startValues={}, runMore, currentTime = 0;
					
					
					for(parameter in parameters)
					{
						startValues[parameter] = object[parameter];
					}
					
					
					queue.timer = setInterval(function(){
						var parameter, endValue, startValue, change, newValue, currentValue;
						_class.clear();
						runMore = 0;
						for(parameter in parameters)
						{
							endValue = parameters[parameter];
							startValue = startValues[parameter];
							currentValue = object[parameter];
							if(increment) endValue += startValue;
							newValue = _class.animation.easing[easingMethod](currentValue,endValue,startValue,duration,currentTime);
							
							switch(parameter)
							{
								case 'width': object.scaleTo(newValue,object.height); break;
								case 'height': object.scaleTo(object.width,newValue); break;
								case 'x': object.moveTo(newValue,object.y); break;
								case 'y': object.moveTo(object.x,newValue); break;
								case 'rotation': object.rotateTo(newValue); break;
								case 'length': object.length = newValue; break;
								case 'radius': object.radius = newValue; break;
								case 'side': object.side = newValue; break;
								case 'lineWidth': object.lineWidth = newValue; break;
								case 'startAngle': object.startAngle = newValue; break;
								case 'endAngle': object.endAngle = newValue; break;
								case 'fontSize': object.fontSize = newValue; break;
							}
							if((endValue > startValue && newValue < endValue) || (endValue < startValue && newValue > endValue))
								runMore++;
						}
						currentTime += 1000/_class.settings.fps;
						if(currentTime >= duration){
							clearInterval(queue.timer);
							object[parameter] = endValue;
							_class.drawState.draw();
							queue.activeAnimations[objectID] = false;
							var length = objectQueue.length, i;
							for(i = 0; i < length; i++)
							{
								if(typeof objectQueue[i] == 'function'){
									objectQueue[i]();
									queue.activeAnimations[objectID] = true;
									objectQueue[i] = null;
									return;
								}
							}
						}else{
							_class.drawState.draw();
						}
					},1000/_class.settings.fps);
				},
				
				stop: function(objectID){
					var queue = this.animationQueue,
						objectQueue = queue[objectID];
					if(objectQueue !== undefined){
						var i,
							length = objectQueue.length;
						clearInterval(queue.timer);
						queue.activeAnimations[objectID] = false;
						for(i = length; i--;){
							objectQueue[i] = null;
						}
						_class.drawState.draw();
					}
				}
			};
			
			_class.tools = {
				transformMousePosition : function(x,y,obj,extraAngle){
					var cX = obj.centerX, cY = obj.centerY,
						D = Math.sqrt(Math.pow(x - cX,2) + Math.pow(y - cY,2)),
						extraAngle = extraAngle === undefined ? 0 : extraAngle,
						rotation = ((obj.rotation/360) - Math.floor(obj.rotation/360))*360 - extraAngle,
						mX,mY;
					
					if(x >= cX && y <= cY){
						mX = cX - Math.cos((180-rotation-Math.asin(Math.abs(y-cY)/D)*180/Math.PI)*Math.PI/180)*D;
						mY = cY - Math.sin((180-rotation-Math.asin(Math.abs(y-cY)/D)*180/Math.PI)*Math.PI/180)*D;
					}else if(x <= cX && y <= cY) {
						mX = cX - Math.cos((Math.asin(Math.abs(y-cY)/D)*180/Math.PI-rotation)*Math.PI/180)*D;
						mY = cY - Math.sin((Math.asin(Math.abs(y-cY)/D)*180/Math.PI-rotation)*Math.PI/180)*D;
					}else if(x >= cX && y >= cY) {
						mX = cX + Math.cos((Math.asin(Math.abs(y-cY)/D)*180/Math.PI-rotation)*Math.PI/180)*D;
						mY = cY + Math.sin((Math.asin(Math.abs(y-cY)/D)*180/Math.PI-rotation)*Math.PI/180)*D;
					}else if(x <= cX && y >= cY) {
						mX = cX + Math.cos((180-rotation-Math.asin(Math.abs(y-cY)/D)*180/Math.PI)*Math.PI/180)*D;
						mY = cY + Math.sin((180-rotation-Math.asin(Math.abs(y-cY)/D)*180/Math.PI)*Math.PI/180)*D;
					}
					
					return {x:mX,y:mY};
				},
				
				collisionTest : function(obj,x,y,type){
					switch(type)
					{
						case "line":
							var mouse = _class.tools.transformMousePosition(x,y,obj);
							
							if( (mouse.x > obj.startX) && (mouse.x < obj.endX) && (mouse.y > obj.startY-obj.lineWidth/2) && (mouse.y < obj.endY+obj.lineWidth/2) )
								return true;
							else
								return false;
						break;
						
						case "rectangle":
							var mouse = _class.tools.transformMousePosition(x,y,obj);
							
							if( (mouse.x > obj.x) && (mouse.x < obj.x+obj.width) && (mouse.y > obj.y) && (mouse.y < obj.y+obj.height) )
								return true;
							else
								return false;
						break;
						
						case "circle":
							var D = Math.sqrt(Math.pow(x - obj.x,2) + Math.pow(y - obj.y,2));
							if(D < obj.width/2)
								return true;
							else
								return false;
						break;
						
						case "ellipse":
							if(obj.width == obj.height)
								return _class.tools.collisionTest(obj,x,y,"circle");
								
							var mouse = _class.tools.transformMousePosition(x,y,obj);
							mouse.x -= obj.x;
							mouse.y -= obj.y;
							var a = obj.width/2,
								b = obj.height/2;
							
							if( (mouse.x*mouse.x)/(a*a) + (mouse.y*mouse.y)/(b*b) < 1 )
								return true;
							else
								return false;
						break;
						
						case "polygon":
							var mouse = _class.tools.transformMousePosition(x,y,obj),
								length = obj.points.length,
								j = length-1,
								odd = false;
							
							for(var i = 0; i < length; i++)
							{
								if( ((obj.points[i].y < mouse.y) && (obj.points[j].y >= mouse.y)) || ((obj.points[j].y < mouse.y) && (obj.points[i].y >= mouse.y)) )
								{
									if(obj.points[i].x+(mouse.y-obj.points[i].y)/(obj.points[j].y-obj.points[i].y)*(obj.points[j].x-obj.points[i].x) < mouse.x)
										odd = !odd;
								}
								j = i;
							}
							
							if(odd === true)
								return true;
							else
								return false;
						break;
						
						case "point":
							var mouse = _class.tools.transformMousePosition(x,y,obj);
							
							if(mouse.x == x && mouse.y == y)
								return true;
							else
								return false;
						break;
						
						case "arc":
							var extraAngle = obj.startAngle*-1,
								mouse = _class.tools.transformMousePosition(x,y,obj,extraAngle),
								D = Math.sqrt(Math.pow(mouse.x - obj.x,2) + Math.pow(mouse.y - obj.y,2));
							
							if(D > obj.radius)
								return false;
							
							var angleRange = obj.endAngle - obj.startAngle,
								a,y_,z,eP={},angle,p1={};
							
							if(angleRange > 180){
								a = (360 - angleRange)/2;
								y_ = Math.cos(a*Math.PI/180)*obj.radius;
								
								eP.x = obj.x + Math.cos(a*Math.PI/180)*y_;
								eP.y = obj.y - Math.sin(a*Math.PI/180)*y_;
								
								
								z = 180-2*a;
								
								p1.x = obj.x - Math.cos(z*Math.PI/180)*obj.radius;
								p1.y = obj.y - Math.sin(z*Math.PI/180)*obj.radius;
								
								var aRight = 90 - (90-z) - (90-a);
								
								if(mouse.y < eP.y && mouse.x < eP.x)
									angle = a - Math.acos(Math.abs(mouse.y - eP.y)/Math.sqrt(Math.pow(mouse.x - eP.x,2) + Math.pow(mouse.y - eP.y,2)))*180/Math.PI;
								else if(mouse.y > eP.y && mouse.x >= eP.x)
									angle = aRight - Math.acos(Math.abs(mouse.x - eP.x)/Math.sqrt(Math.pow(mouse.x - eP.x,2) + Math.pow(mouse.y - eP.y,2)))*180/Math.PI;
								else if(mouse.y < obj.y && mouse.x >= eP.x)
									return false;
								else
									angle = -1000000;
								
								
								if(angle <= 0 && mouse.x >= p1.x && mouse.y > eP.y && mouse.y < obj.y){
									return true;
								}else if(angle <= 0 && mouse.y <= obj.y && D <= obj.radius){
									return true;
								}else if(D <= obj.radius && ((mouse.x <= p1.x && mouse.y <= obj.y) || (mouse.y >= obj.y)) ){
									return true;
								}else{
									return false;
								}
							}else if(angleRange == 180){
								if(mouse.y >= obj.y && D <= obj.radius)
									return true;
								else
									return false;
							}else if(angleRange < 180){
								a = angleRange/2;
								x_ = Math.sin(a*Math.PI/180)*obj.radius;
								y_ = Math.cos(a*Math.PI/180)*obj.radius;
								
								eP.x = obj.x + Math.cos(a*Math.PI/180)*y_;
								eP.y = obj.y + Math.sin(a*Math.PI/180)*y_;
								
								var a_ = Math.acos(Math.abs(mouse.x-eP.x)/Math.sqrt(Math.pow(mouse.x-eP.x,2)+Math.pow(mouse.y-eP.y,2)))*180/Math.PI,
									angle = 90-a-a_;
								
								if(angle <= 0 && mouse.y > eP.y)
									return true;
								else if(angle >= 0 && mouse.y < eP.y && mouse.x > eP.x)
									return true;
								else
									return false;
								
							}
						break;
					}
				}
			};
			
			_class.console = {
				numEntries: 0,
				maxEntries: 600,
				enabled: true,
				
				log: function(text,clear){
					if(this.enabled){
						clear = clear || false;
						var logs = document.getElementById("console").innerHTML;
						if(this.numEntries >= this.maxEntries){
							logs = logs.split("<br>");
							logs.shift();
							logs = logs.join("<br>");
						}
						document.getElementById("console").innerHTML = (clear ? '' : logs+(logs == "" ? "" : "<br>"))+text;
						this.numEntries++;
					}
				},
				
				clear: function(){
					if(this.enabled){
						document.getElementById("console").innerHTML = "";
					}
				}
			};
			
			_class.pendulum = function(object,property,min,max,stepX,stepY){
				if(property < max && object.pendulumDir == "up"){
					object.scale(1+stepX,1+stepY);
				}else if(property > min && object.pendulumDir == "down"){
					object.scale(1-stepX,1-stepY);
				}
				if(property >= max && object.pendulumDir == "up"){
					object.pendulumDir = "down";
					object.scale(1-stepX,1-stepY);
				}else if(property <= min && object.pendulumDir == "down"){
					object.pendulumDir = "up";
					object.scale(1+stepX,1+stepY);
				}
			};
			
			_class.style = {
				randomColor: function(){
					var r = Math.round(Math.random()*255).toString(16),
						g = Math.round(Math.random()*255).toString(16),
						b = Math.round(Math.random()*255).toString(16);
					r = r.length == 2 ? r : r+"0";
					g = g.length == 2 ? g : g+"0";
					b = b.length == 2 ? b : b+"0";
					
					return "#"+r+g+b;
				},
				
				isColor: function(value){
					if(
						(value.indexOf("#") != -1) || (value.indexOf("rgb(") != -1) ||
						(value.indexOf("rgba(") != -1) || (value.indexOf("hsl(") != -1) ||
						(value.indexOf("hsla(") != -1)
					){
						return true;
					}
					else
					{
						return false;
					}
				},
				
				set: function(object,type,fillColor,strokeColor,lineWidth,borderPosition){
					if(fillColor == "random") fillColor = this.randomColor();
					if(strokeColor == "random") strokeColor = this.randomColor();
					
					object.type = type;
					
					object.fillColor = fillColor;
					object.strokeColor = strokeColor;
					
					if(type == "fill")
					{
						
						if((lineWidth == undefined) || (lineWidth == 0))
						{
							object.lineWidth = 0;
						}
						else
						{
							object.lineWidth = lineWidth;
							if(borderPosition != undefined)
								object.borderPosition = borderPosition;
							else
								object.borderPosition = "outside";
						}
					}
					else if(type == "stroke")
					{
						object.lineWidth = lineWidth;
						
						if(borderPosition == undefined)
						{
							object.borderPosition = "center";
						}
						else
						{
							object.borderPosition = borderPosition;
							
							if(borderPosition == "outside")
							{
								object.width += lineWidth*2;
								object.height += lineWidth*2;
								object.centerX = object.x + object.width/2;
								object.centerY = object.y + object.height/2;
							}
							else if(borderPosition == "center")
							{	
								object.width += lineWidth;
								object.height += lineWidth;
								object.centerX = object.x + object.width/2;
								object.centerY = object.y + object.height/2;
							}
						}
					}
				}
			};
			
			_class.mouse = {
			
				eventList: {
					mousemove: new Array(),
					mouseover: new Array(),
					click: new Array(),
					mousedown: new Array(),
					mouseup: new Array(),
					drag: new Array()
				},
				
				init: function(){
					this.x = _class.canvas.width/2;
					this.y = _class.canvas.height/2;
					this.buttonState = 'up';
					this.canvasFocused = false;
					this.canvasHovered = false;
					_class.canvasElement.addEventListener('mousemove',this.mousemove,false);
					_class.canvasElement.addEventListener('click',this.click,false);
					_class.canvasElement.addEventListener('mousedown',this.mousedown,false);
					_class.canvasElement.addEventListener('mouseup',this.mouseup,false);
					if(_class.settings.disableScrolling)
						_class.canvasElement.addEventListener('touchmove',function(e){ e.preventDefault(); },false);
					document.addEventListener('mouseup',this.docmouseup,false);
					document.addEventListener('mouseover',this.docmouseover,false);
					document.addEventListener('click',this.docclick,false);
				},
				
				addEvent: function(type,obj){
					return this.eventList[type].push(obj.events[type].func)-1;
				},
				
				removeEvent: function(type,id){
					this.eventList[type][id] = null;
				},
				
				getPos: function(e){
					if(e.pageX) _class.mouse.x = e.pageX - _class.canvasElement.offsetLeft;
					else if(e.clientX) _class.mouse.x = e.clientX + document.documentElement.scrollLeft - _class.canvasElement.offsetLeft;
					if(e.pageY) _class.mouse.y = e.pageY - _class.canvasElement.offsetTop;
					else if(e.clientY) _class.mouse.y = e.clientY + document.documentElement.scrollTop - _class.canvasElement.offsetTop;
					document.title = _class.mouse.x+' : '+_class.mouse.y;
				},
				
				onCanvas: function(e){
					_class.mouse.getPos(e);
					if( (_class.mouse.x > 0) && (_class.mouse.x < _class.canvas.width) && (_class.mouse.y > 0) && (_class.mouse.y < _class.canvas.height) ){
						this.canvasHovered = true;
						return true;
					}else{
						this.canvasHovered = false;
						return false;
					}
				},
				
				mousemove: function(e){
					_class.mouse.getPos(e);
					
					var eList = _class.mouse.eventList,
						mousemove = eList.mousemove,
						moveLength = mousemove.length,
						mouseover = eList.mouseover,
						overLength = mouseover.length,
						drag = eList.drag,
						dragLength = drag.length;
					
					for(var i = moveLength; i--;)
					{
						var event = mousemove[i];
						if(typeof event == "function")
							event(e);
					}
					
					for(var i = overLength; i--;)
					{
						var event = mouseover[i];
						if(typeof event == "function")
							event(e);
					}
					
					for(var i = dragLength; i--;)
					{
						var event = drag[i];
						if(typeof event == "function")
							event(e);
					}
				},
				
				click: function(e){
					_class.mouse.canvasFocused = true;
					
					var eList = _class.mouse.eventList,
						click = eList.click,
						clickLength = click.length;
					
					for(var i = clickLength; i--;)
					{
						var event = click[i];
						if(typeof event == "function")
							event(e);
					}
				},
				
				mousedown: function(e){
					_class.mouse.canvasFocused = true;
					
					var eList = _class.mouse.eventList,
						mousedown = eList.mousedown,
						downLength = mousedown.length;
					
					for(var i = downLength; i--;)
					{
						var event = mousedown[i];
						if(typeof event == "function")
							event(e);
					}
					return false;
				},
				
				mouseup: function(e){
					var eList = _class.mouse.eventList,
						mouseup = eList.mouseup,
						upLength = mouseup.length;
					
					for(var i = upLength; i--;)
					{
						var event = mouseup[i];
						if(typeof event == "function")
							event(e);
					}
				},
				
				mouseout: function(e){
					var objects = _class.drawState.objects,
						length = objects.length,
						events;
					
					for(var i = length; i--;)
					{
						if(objects[i] != null){
							events = objects[i].events;
							if(events.mouseontarget === true)
							{
								events.mouseontarget = false;
								events.mouseout.f(e);
								objects[i].draw();
							}
						}
					}
					_class.canvasElement.style.cursor = 'default';
				},
				
				docmouseup: function(e){
					if(_class.mouse.buttonState == "down" && !_class.mouse.onCanvas(e))
						_class.mouse.mouseup(e);
				},
				
				docmouseover: function(e){
					if(!_class.mouse.onCanvas(e))
						_class.mouse.mouseout(e);
				},
				
				docclick: function(e){
					if(!_class.mouse.onCanvas(e))
						_class.mouse.canvasFocused = false;
				}
			};
			
			_class.keyboard = {
			
				eventList: {
					keydown: new Array(),
					keyup: new Array(),
					keypress: new Array(),
					running: new Array()
				},
				
				keysDown: {},
				keyPressTimer: 0,
				keyPressRunning: false,
				modifiedKeys: {},
				lastActiveKeyDown: false,
				
				
				init: function(){
					this.running = false;
					document.addEventListener('keydown',this.keydown,false);
					document.addEventListener('keyup',this.keyup,false);
					document.addEventListener('keypress',this.preventkeypress,false);
				},
				
				addEvent: function(type,func){
					return this.eventList[type].push(func)-1;
				},
				
				removeEvent: function(type,id){
					this.eventList[type][id] = null;
				},
				
				getKeyCode: function(e){
					return e.keyCode == 0 ? e.which : e.keyCode;
				},
				
				anyKeysDown: function(){
					var active = 0,
					keysDown = _class.keyboard.keysDown;
					
					for(var x in keysDown){
						if(keysDown[x] === true)
							active++;
					}
					
					if(active > 0)
						return true;
					else
						return false;
				},
				
				runUntilKeyUp: function(e){
					
					if(_class.mouse.canvasFocused == true)
					{
						var eList = _class.keyboard.eventList,
							running = eList.running,
							runningLength = running.length,
							keydown = eList.keydown;
						
						for(var i = runningLength; i--;)
						{
							var id = running[i];
							if(id != null){
								var event = keydown[id];
								if(typeof event == "function")
									event(e);
							}
						}
					}
				},
						
				keydown: function(e){
					if(_class.mouse.canvasFocused == true)
					{
						var eList = _class.keyboard.eventList,
							keydown = eList.keydown,
							downLength = keydown.length;
						
						for(var i = downLength; i--;)
						{
							var event = keydown[i];
							if(typeof event == "function")
								event(e);
						}
					}
		
					_class.keyboard.lastActiveKeyDown = _class.keyboard.getKeyCode(e);
					_class.keyboard.keysDown[_class.keyboard.getKeyCode(e)] = true;
					if(!_class.keyboard.keyPressRunning && _class.keyboard.eventList.keypress.length > 0){
						_class.keyboard.keyPressTimer = setInterval(function(){ _class.keyboard.keypress(e); },1000/_class.settings.fps);
						_class.keyboard.keyPressRunning = true;
					}
					
					_class.keyboard.preventkeypress(e);
				},
				
				keyup: function(e){
					if(_class.mouse.canvasFocused == true)
					{
						var eList = _class.keyboard.eventList,
							keyup = eList.keyup,
							upLength = keyup.length;
					
						for(var i = upLength; i--;)
						{
							var event = keyup[i];
							if(typeof event == "function")
								event(e);
						}
					}
					if(_class.keyboard.getKeyCode(e) == _class.keyboard.lastActiveKeyDown)
						_class.keyboard.lastActiveKeyDown = false;
					_class.keyboard.keysDown[_class.keyboard.getKeyCode(e)] = false;
					if(!_class.keyboard.anyKeysDown()){
						clearInterval(_class.keyboard.keyPressTimer);
						_class.keyboard.keyPressRunning = false;
					}
				},
				
				keypress: function(e){
					if(_class.mouse.canvasFocused == true)
					{
						var eList = _class.keyboard.eventList,
							keypress = eList.keypress,
							pressLength = keypress.length;
						
						for(var i = pressLength; i--;)
						{
							var event = keypress[i];
							if(typeof event == "function")
								event(e);
						}
					}
				},
				
				preventkeypress: function(e){
					if(_class.mouse.canvasFocused === true)
					{
						var k = _class.keyboard,
							keyCode = k.getKeyCode(e),
							modifiedKeys = k.modifiedKeys;
						
						for(var i in modifiedKeys){
							if(k.getKeyCode(e) == i && modifiedKeys[i] !== false)
								e.preventDefault();
						}
					}
				},
				
				ARROW_UP:38, ARROW_DOWN:40, ARROW_LEFT:37, ARROW_RIGHT:39, SPACE:32, ENTER:13, ESC:27
			};
			
			_class.keyDown = function(keyCode,func,preventDefault,draw){
				var id = _class.keyboard.addEvent('keydown',function(e){
					if(e.keyCode == keyCode){
						if(preventDefault !== false) e.preventDefault();
						func(e);
						if(draw !== false) _class.drawState.draw();
					}
				});
				_class.keyboard.modifiedKeys[keyCode] = preventDefault;
				
				return id;
			};
			_class.keyUp = function(keyCode,func,preventDefault,draw){
				var id = _class.keyboard.addEvent('keyup',function(e){
					if(e.keyCode == keyCode){
						if(preventDefault !== false) e.preventDefault();
						func(e);
						if(draw !== false) _class.drawState.draw();
					}
				});
				_class.keyboard.modifiedKeys[keyCode] = preventDefault;
				
				return id;
			};
			_class.keyPress = function(keyCode,func,preventDefault,draw){
				var id = _class.keyboard.addEvent('keypress',function(e){
					if(_class.keyboard.keysDown[keyCode] == true){
						if(preventDefault !== false) e.preventDefault();
						func(e);
						if(draw !== false) _class.drawState.draw();
					}
				});
				_class.keyboard.modifiedKeys[keyCode] = preventDefault;
				
				return id;
			};
			
			
			
			_class.events = {
				mouse: function(){
				
					this.mousemove = function(func,draw){
						var obj = this,
							events = obj.events;
						events.mousemove = {};
						events.mousemove.func = function(e){
							if(_class.tools.collisionTest(obj,_class.mouse.x,_class.mouse.y,obj.collisionType)){
								_class.canvasElement.style.cursor = 'pointer';
								func(e);
								obj.events.mouseontarget = true;
								if(draw == undefined || draw == true)
									obj.draw();
							}else if(typeof events.mouseout.f == "function" && events.mouseontarget == true){
								_class.canvasElement.style.cursor = 'default';
								events.mouseout.f(e);
								events.mouseontarget = false;
								if(events.mouseout.d == undefined || events.mouseout.d == true)
									obj.draw();
							}
						};
						events.mousemove.id = _class.mouse.addEvent('mousemove',this);
						
						return this;
					};
					
					this.mouseover = function(func,draw){
						var obj = this,
							events = obj.events;
						events.mouseover = {};
						events.mouseover.func = function(e){
							if(_class.tools.collisionTest(obj,_class.mouse.x,_class.mouse.y,obj.collisionType)){
								if(!events.mouseontarget){
									_class.canvasElement.style.cursor = 'pointer';
									func(e);
									events.mouseontarget = true;
									if(draw == undefined || draw == true)
										obj.draw();
								}
							}else if(typeof events.mouseout.f == "function" && events.mouseontarget == true){
								_class.canvasElement.style.cursor = 'default';
								events.mouseout.f(e);
								events.mouseontarget = false;
								if(events.mouseout.d == undefined || events.mouseout.d == true)
									obj.draw();
							}
						};
						events.mouseover.id = _class.mouse.addEvent('mouseover',this);
						
						return this;
					};
					
					this.mouseout = function(func,draw){
						this.events.mouseout = {f:func,d:draw};
						
						return this;
					};
					
					this.click = function(func,draw){
						var obj = this,
							events = obj.events;
						events.click = {};
						events.click.func = function(e){
							if(_class.tools.collisionTest(obj,_class.mouse.x,_class.mouse.y,obj.collisionType)){
								func(e);
								if(draw !== false)
									obj.draw();
							}
						};
						events.click.id = _class.mouse.addEvent('click',this);
						
						return this;
					};
					
					this.mousedown = function(func,draw){
						var obj = this,
							events = obj.events;
						events.mousedown = {};
						events.mousedown.func = function(e){
							_class.mouse.buttonState = 'down';
							if(_class.tools.collisionTest(obj,_class.mouse.x,_class.mouse.y,obj.collisionType)){
								func(e);
								if(draw !== false)
									obj.draw();
							}
						};
						events.mousedown.id = _class.mouse.addEvent('mousedown',this);
						
						return this;
					};
					
					this.mouseup = function(func,draw,forceRun){
						var obj = this,
							events = obj.events;
						if(draw === undefined) draw = true;
						if(forceRun === undefined) forceRun = false;
						events.mouseup = {};
						events.mouseup.func = function(e){
							_class.mouse.buttonState = 'up';
							var onObject = _class.tools.collisionTest(obj,_class.mouse.x,_class.mouse.y,obj.collisionType);
							if(onObject || forceRun !== false){
								if(onObject)
									func(e,true);
								else
									func(e,false);
								if(draw !== false)
									obj.draw();
							}
						};
						events.mouseup.id = _class.mouse.addEvent('mouseup',this);
						draw = true;
						forceRun = false;
						
						return this;
					};
					
					this.startDrag = function(draw){
						var obj = this,
							events = obj.events,
							sX, sY;
						events.drag = {};
						switch(obj.collisionType){
							case 'line': sX = obj.startX; sY = obj.startY; break;
							default: sX = obj.x; sY = obj.y;
						}
						events.drag.diff = {x:_class.mouse.x-sX,y:_class.mouse.y-sY};
						events.drag.func = function(e){
							var sX, sY;
							switch(obj.collisionType){
								case 'line': sX = obj.startX; sY = obj.startY; break;
								default: sX = obj.x; sY = obj.y;
							}
							obj.move(_class.mouse.x-sX-events.drag.diff.x,_class.mouse.y-sY-events.drag.diff.y);
							if(draw !== false)
								obj.draw();
						};
						events.drag.id = _class.mouse.addEvent('drag',this);
					};
					
					this.stopDrag = function(){
							_class.mouse.removeEvent('drag',this.events.drag.id);
					};
				},
			};
			
			_class.scenesCanvas = function(){
				this.objects = new Array();
				this.currentScene = 'start';
				
				this.create = function(func){
					func.prototype = new _class.scenesCanvas();
					return new func();
				};
				
				this.add = function(obj){
					return this.objects[this.objects.push(obj)-1];
				};
				
				this.unload = function(){
					var objects = this.objects,
						length = objects.length;
					for(var i = length; i--;)
					{
						if(objects[i] != null){
							objects[i].remove();
							objects[i] = null;
							delete objects[i];
						}
					}
					this.objects = new Array();
					_class.canvasElement.style.cursor = 'default';
				};
			};
			
			/*
				2D Primitives
			*/
			_class.Line = function(sX,sY,eX,eY,lW,color)
			{
				this.rotation = 0;
				this.pendulumDir = "up";
				var start, end,
					settingEndPoints = false,
					resetting = false,
					settingBoth = false,
					startX = sX,
					startY = sY,
					endX = eX,
					endY = eY,
					length = (eY-sY == 0) ? eX-sX : Math.sqrt(Math.pow(eY-sY,2) + Math.pow(eX-sX,2)),
					xPos = sX,
					yPos = sY;
				this.centerX = (eX-sX)/2+sX;
				this.centerY = (eY-sY)/2+sY;
				this.origin = {x:0,y:0};
				this.boundingBox = {width:eX-sX,height:eY-sY,center:{x:(eX-sX)/2,y:(eY-sY)/2},angles:{a:Math.acos((eY-sY)/length)*180/Math.PI,b:Math.acos((eX-sX)/length)*180/Math.PI}};
				_class.style.set(this,"stroke","#000",color,lW);
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "line";
				
				this.resetPosition = function(){
					if(this.rotation == 0)
						return false;
					
					var noOrigin = false;
					if(this.getOrigin().x == 0 && this.getOrigin().y == 0)
						noOrigin = true;
					
					var angle = Math.abs(this.rotation),
						origin = this.getOrigin(),
						length_start = noOrigin ? 0 : Math.sqrt(origin.x*origin.x + origin.y*origin.y),
						length_end = length - length_start,
						start_distance = Math.sin(angle/2*Math.PI/180) * length_start * 2,
						end_distance = Math.sin(angle/2*Math.PI/180) * length_end * 2,
						a_1 = Math.acos(noOrigin ? this.boundingBox.width/length : origin.x/length_start) * 180/Math.PI,
						a_2 = 90 + a_1,
						a_3 = (180-angle)/2,
						a_4 = a_2 - a_3,
						sDX = Math.sin(a_4*Math.PI/180) * start_distance,
						sDY = Math.cos(a_4*Math.PI/180) * start_distance,
						eDX = Math.sin(a_4*Math.PI/180) * end_distance,
						eDY = Math.cos(a_4*Math.PI/180) * end_distance;
					
					startX += sDX;
					startY -= sDY;
					endX -= eDX;
					endY += eDY;
					
					this.boundingBox.height = endY - startY;
					this.boundingBox.width = endX - startX;
					this.boundingBox.center.x = this.boundingBox.width/2;
					this.boundingBox.center.y = this.boundingBox.height/2;
					this.rotation = 0;
					
					var newOrigin = {
						x: (this.origin.x == 'center') ? 'center' : 0,
						y: (this.origin.y == 'center') ? 'center' : 0
					}
					this.setOrigin(newOrigin.x,newOrigin.y);
				};
				
				this.__defineGetter__('length',function(){
					return length;
				});
				this.__defineSetter__('length',function(newLength){
					length = newLength;
					var oldBoundingBox = {width:this.boundingBox.width,height:this.boundingBox.height};
					
					this.boundingBox.width = Math.cos(this.boundingBox.angles.b*Math.PI/180)*length;
					this.boundingBox.height = Math.cos(this.boundingBox.angles.a*Math.PI/180)*length;
					oldBoundingBox.diff = {x:this.boundingBox.width-oldBoundingBox.width,y:this.boundingBox.height-oldBoundingBox.height};
					if(this.origin.x == 'center'){
						startX -= oldBoundingBox.diff.x/2;
						endX += oldBoundingBox.diff.x/2;
					}else{
						endX = startX+this.boundingBox.width;
					}
					if(this.origin.y == 'center'){
						startY -= oldBoundingBox.diff.y/2;
						endY += oldBoundingBox.diff.y/2;
					}else{
						endY = startY+this.boundingBox.height;
					}
					this.boundingBox.center = {x:this.boundingBox.width/2,y:this.boundingBox.height/2};
				});
				
				this.__defineGetter__('startX',function(){
					return startX;
				});
				this.__defineGetter__('startY',function(){
					return startY;
				});
				this.__defineGetter__('start',function(){
					return {x:startX,y:startY};
				});
				this.__defineSetter__('startX',function(newX){
					if(!settingBoth)
						this.resetPosition();
					
					startX = newX;
					this.boundingBox.width = endX-startX;
					this.boundingBox.center.x = (endX-startX)/2;
					length = Math.sqrt(Math.pow(this.boundingBox.width,2)+Math.pow(this.boundingBox.height,2));
					this.boundingBox.angles = {a:Math.acos((endY-startY)/length)*180/Math.PI,b:Math.acos((endX-startX)/length)*180/Math.PI};
					xPos = startX + this.getOrigin().x;
				});
				this.__defineSetter__('startY',function(newY){
					if(!settingBoth)
						this.resetPosition();

					startY = newY;
					this.boundingBox.height = endY-startY;
					this.boundingBox.center.y = (endY-startY)/2;
					length = Math.sqrt(Math.pow(this.boundingBox.width,2)+Math.pow(this.boundingBox.height,2));
					this.boundingBox.angles = {a:Math.acos((endY-startY)/length)*180/Math.PI,b:Math.acos((endX-startX)/length)*180/Math.PI};
					yPos = startY + this.getOrigin().y;
				});
				this.__defineSetter__('start',function(newStart){
					this.resetPosition();
				
					settingBoth = true;
					if(newStart.x !== undefined)
						this.startX = newStart.x;
					if(newStart.y !== undefined)
						this.startY = newStart.y;
					settingBoth = false;
				});
				this.__defineGetter__('endX',function(){
					return endX;
				});
				this.__defineGetter__('endY',function(){
					return endY;
				});
				this.__defineGetter__('end',function(){
					return {x:endX,y:endY};
				});
				this.__defineSetter__('endX',function(newX){
					if(!settingBoth)
						this.resetPosition();
					
					endX = newX;
					this.boundingBox.width = endX-startX;
					this.boundingBox.center.x = (endX-startX)/2;
					length = Math.sqrt(Math.pow(this.boundingBox.width,2)+Math.pow(this.boundingBox.height,2));
					this.boundingBox.angles = {a:Math.acos((endY-startY)/length)*180/Math.PI,b:Math.acos((endX-startX)/length)*180/Math.PI};
					xPos = startX + this.getOrigin().x;
				});
				this.__defineSetter__('endY',function(newY){
					if(!settingBoth)
						this.resetPosition();
					
					endY = newY;	
					this.boundingBox.height = endY-startY;
					this.boundingBox.center.y = (endY-startY)/2;
					length = Math.sqrt(Math.pow(this.boundingBox.width,2)+Math.pow(this.boundingBox.height,2));
					this.boundingBox.angles = {a:Math.acos((endY-startY)/length)*180/Math.PI,b:Math.acos((endX-startX)/length)*180/Math.PI};
					yPos = startY + this.getOrigin().y;
				});
				this.__defineSetter__('end',function(newEnd){
					this.resetPosition();
				
					settingBoth = true;
					if(newEnd.x !== undefined)
						this.endX = newEnd.x;
					if(newEnd.y !== undefined)
						this.endY = newEnd.y;
					settingBoth = false;
				});
				this.__defineGetter__('x',function(){
					return xPos;
				});
				this.__defineGetter__('y',function(){
					return yPos;
				});
				this.__defineSetter__('x',function(newX){
					var diff = newX - xPos;
					xPos = newX;
					startX += diff;
					endX += diff;
				});
				this.__defineSetter__('y',function(newY){
					var diff = newY - yPos;
					yPos = newY;
					startY += diff;
					endY += diff;
				});
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				
				this.drawObject = function(){
					var origin = this.getOrigin(),
						stX = (this.rotation > 0 ? -origin.x : xPos-origin.x),
						stY = (this.rotation > 0 ? -origin.y : yPos-origin.y),
						enX = (this.rotation > 0 ? this.boundingBox.width-origin.x : xPos+(this.boundingBox.width-origin.x)),
						enY = (this.rotation > 0 ? this.boundingBox.height-origin.y : yPos+(this.boundingBox.height-origin.y));
						
					_class.canvas.lineWidth = this.lineWidth;
					_class.canvas.strokeStyle = this.strokeColor;
					_class.canvas.beginPath();
					_class.canvas.moveTo(stX,stY);
					_class.canvas.lineTo(enX,enY);
					_class.canvas.stroke();
					_class.canvas.closePath();
					
					return this;
				};
				
				this.rotate = function(angle){
					this.rotation = _class.transform.rotate(angle,this.rotation);
					
					return this;
				};
				
				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};
				
				this.scale = function(x,y){
					var scaled = _class.transform.scale(x,y,this.length,this.lineWidth),
						relX = (this.endX-this.startX)/this.length,
						relY = (this.endY-this.startY)/this.length,
						diffX = (relX * scaled.x - (this.endX-this.startX))/2,
						diffY = (relY * scaled.x - (this.endY-this.startY))/2;
					this.endX += diffX;
					this.startX -= diffX;
					this.endY += diffY;
					this.startY -= diffY;
					if(y != undefined)
						this.lineWidth = scaled.y;
					this.length = (this.endY-this.startY == 0) ? this.endX-this.startX : Math.sqrt(Math.pow(this.endY-this.startY,2) + Math.pow(this.endX-this.startX,2));
					
					return this;
				};
				
				this.scaleTo = function(length,lineWidth){
					this.length = length;
					this.lineWidth = lineWidth;
					
					return this;
				};
				
				this.pendulum = function(min,max,stepX,stepY){
					_class.pendulum(this,this.width,min,max,stepX,stepY);
					
					return this;
				};
				
				this.move = function(x,y){
					this.startX += x;
					this.startY += y;
					this.endX += x;
					this.endY += y;
					this.centerX = (this.endX-this.startX)/2+this.startX;
					this.centerY = (this.endY-this.startY)/2+this.startY;
					this.rotationCenterX = this.centerX;
					this.rotationCenterY = this.centerY;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					var xDiff = x - this.startX,
						yDiff = y - this.startY;
					this.startX += xDiff;
					this.startY += yDiff;
					this.endX += xDiff;
					this.endY += yDiff;
					this.centerX = (this.endX-this.startX)/2+this.startX;
					this.centerY = (this.endY-this.startY)/2+this.startY;
					this.rotationCenterX = this.centerX;
					this.rotationCenterY = this.centerY;
					
					return this;
				};
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = this.boundingBox.center.x;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = this.boundingBox.center.y;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= xPos-this.origin.x;
						y -= yPos-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y;
					
					if(x == 'center')
						x = this.boundingBox.center.x;
					if(y == 'center')
						y = this.boundingBox.center.y;
					
					if(x > 0 || y > 0){
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
						
						this.x = oldSX+changeX;
						this.y = oldSY+changeY;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y;
						else
							this.y -= oldOrigin.y;
					}
					
					return this;
				}
			};
			_class.Line.prototype = new _class.events.mouse();
			
			_class.Rectangle = function(x,y,w,h,type,fillColor,strokeColor,lineWidth,borderPosition)
			{
				this.rotation = 0;
				this.pendulumDir = "up";
				this.x = x;
				this.y = y;
				this.width = w;
				this.height = h;
				this.centerX = this.x + this.width/2;
				this.centerY = this.y + this.height/2;
				this.origin = {x:0, y:0};
				_class.style.set(this,type,fillColor,strokeColor,lineWidth,borderPosition);
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "rectangle";
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					var events = this.events;
					for(var i in events)
					{
						if(events[i].id != undefined)
							_class.mouse.removeEvent(i,events[i].id);
					}
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				this.drawObject = function(){
					_class.canvas.beginPath();
					
					var origin = this.getOrigin(),
						sX = (this.rotation > 0) ? -origin.x : this.x-origin.x,
						sY = (this.rotation > 0) ? -origin.y : this.y-origin.y,
						lW = this.lineWidth,
						w = this.width,
						h = this.height;
			
					if(this.type == "fill")
					{
						_class.canvas.fillStyle = this.fillColor;
						_class.canvas.fillRect(sX,sY,w,h);
						_class.canvas.fill();
					}
					if(lW > 0)
					{
						_class.canvas.lineWidth = lW;
						_class.canvas.strokeStyle = this.strokeColor;
						if(this.borderPosition == "outside")
							_class.canvas.strokeRect(sX-lW/2,sY-lW/2,w+lW,h+lW);
						else if(this.borderPosition == "center")
							_class.canvas.strokeRect(sX,sY,w,h);
						else if(this.borderPosition == "inside")
							_class.canvas.strokeRect(sX+lW/2,sY+lW/2,w-lW,h-lW);
						_class.canvas.stroke();
					}
					_class.canvas.closePath();
					
					return this;
				};
				
				this.rotate = function(angle){
					this.rotation = _class.transform.rotate(angle,this.rotation);
					
					return this;
				};
				
				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};
				
				this.scale = function(x,y){
					var scaled = _class.transform.scale(x,y,this.width,this.height);
					this.width = scaled.x;
					this.height = scaled.y;
					
					return this;
				};
				
				this.scaleTo = function(width,height){
					this.width = width;
					this.height = height;
					
					return this;
				};
				
				this.pendulum = function(min,max,stepX,stepY){
					_class.pendulum(this,this.width,min,max,stepX,stepY);
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = this.width/2;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = this.height/2;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= this.x-this.origin.x;
						y -= this.y-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y;
					
					if(x == 'center')
						x = this.width/2;
					if(y == 'center')
						y = this.height/2;
					
					if(x > 0 || y > 0){
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
						
						this.x = oldSX+changeX;
						this.y = oldSY+changeY;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y;
						else
							this.y -= oldOrigin.y;
					}
					
					return this;
				}
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
			};
			_class.Rectangle.prototype = new _class.events.mouse();
			
			_class.Ellipse = function(x,y,w,h,type,fillColor,strokeColor,lineWidth)
			{
				this.rotation = 0;
				this.pendulumDir = "up";
				this.x = x;
				this.y = y;
				this.centerX = x;
				this.centerY = y;
				this.origin = {x:0, y:0};
				this.width = w;
				this.height = h;
				_class.style.set(this,type,fillColor,strokeColor,lineWidth);
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "ellipse";
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					_class.drawState.remove(this.objectID);
				};
				
				this.drawObject = function(){
					_class.canvas.beginPath();
					var origin = this.getOrigin(),
						w = this.width,
						h = this.height,
						x = (this.rotation > 0 ? -origin.x : this.x-origin.x) + w/2,
						y = (this.rotation > 0 ? -origin.y : this.y-origin.y) + h/2;
					
					if(w == h)
					{
						_class.canvas.arc(x,y,w/2,0,Math.PI*2,false);
					}
					else
					{
						var EllipseToBezierConstant = 0.276142374915397,
							o = {x: this.width*EllipseToBezierConstant,y: this.height*EllipseToBezierConstant};
						
						_class.canvas.moveTo(x-w/2, y);
						_class.canvas.bezierCurveTo(x-w/2, y-o.y, x-o.x, y-h/2, x, y-h/2);
						_class.canvas.bezierCurveTo(x+o.x, y-h/2, x+w/2, y-o.y, x+w/2, y);
						_class.canvas.bezierCurveTo(x+w/2, y+o.y, x+o.x, y+h/2, x, y+h/2);
						_class.canvas.bezierCurveTo(x-o.x, y+h/2, x-w/2, y+o.y, x-w/2, y);
					}
					
					if(this.type == "fill")
					{
						_class.canvas.fillStyle = this.fillColor;
						_class.canvas.fill();
						if(this.lineWidth)
						{
							_class.canvas.lineWidth = this.lineWidth;
							_class.canvas.strokeStyle = this.strokeColor;
							_class.canvas.stroke();
						}
					}
					else if(this.type == "stroke")
					{
						_class.canvas.lineWidth = this.lineWidth;
						_class.canvas.strokeStyle = this.strokeColor;
						_class.canvas.stroke();
					}
					
					_class.canvas.closePath();
					
					return this;
				};
				
				this.rotate = function(angle){
					this.rotation = _class.transform.rotate(angle,this.rotation);
					
					return this;
				};
				
				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};
				
				this.scale = function(x,y){
					var scaled = _class.transform.scale(x,y,this.width,this.height);
					this.width = scaled.x;
					this.height = scaled.y;
					
					return this;
				};
				
				this.scaleTo = function(width,height){
					this.width = width;
					this.height = height;
					
					return this;
				};
				
				this.pendulum = function(min,max,stepX,stepY){
					_class.pendulum(this,this.width,min,max,stepX,stepY);
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = this.width/2;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = this.height/2;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= this.x-this.origin.x;
						y -= this.y-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y;
					
					if(x == 'center')
						x = this.width/2;
					if(y == 'center')
						y = this.height/2;
					
					if(x > 0 || y > 0){
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
						
						this.x = oldSX+changeX;
						this.y = oldSY+changeY;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y;
						else
							this.y -= oldOrigin.y;
					}
					
					return this;
				}
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
			};
			_class.Ellipse.prototype = new _class.events.mouse();
			
			_class.Polygon = function(x,y,sides,radius,type,fillColor,strokeColor,lineWidth)
			{
				this.pendulumDir = "up";
				this.x = x;
				this.y = y;
				this.centerX = x+radius;
				this.centerY = y+radius;
				this.origin = {x:0, y:0};
				this.sides = sides;
				var radius = radius;
				var side = 2*radius*Math.sin(Math.PI/sides);
				_class.style.set(this,type,fillColor,strokeColor,lineWidth);
				var diffY = radius * Math.cos(2*Math.PI/this.sides) - radius;
				this.angleCorrection = Math.acos(diffY/side)*180/Math.PI;
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "polygon";
				this.points = new Array();
				
				
				this.__defineGetter__('side',function(){
					return side;
				});
				
				this.__defineSetter__('side',function(newSide){
					side = newSide;
					radius = (side/2)/Math.sin(Math.PI/sides);
				});
				
				this.__defineGetter__('radius',function(){
					return radius;
				});
				
				this.__defineSetter__('radius',function(newRadius){
					radius = newRadius;
					side = 2*radius*Math.sin(Math.PI/sides);
				});
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = radius;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = radius;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= this.x-this.origin.x;
						y -= this.y-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y;
					
					if(x == 'center')
						x = radius;
					if(y == 'center')
						y = radius;

					if(x > 0 || y > 0){
						
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
							
						this.x = oldSX+changeX;
						this.y = oldSY+changeY;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y;
						else
							this.y -= oldOrigin.y;
					}
					
					this.x -= radius;
					this.y -= radius;
					
					return this;
				}
				this.rotation = 0;
				
				this.draw = function(){
					if(this.onCanvas == false){
						_class.drawState.add(this);
						this.setOrigin('center','center');
						this.rotation = this.angleCorrection;
						_class.drawState.draw(this.objectID);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				
								
				this.getSortedPointsByDistance = function(x,y){
					var orderedPoints = this.points,
						distance,temp = {},
						length = orderedPoints.length;
					for(var i = 0; i < length; i++)
					{
						orderedPoints[i].distance = Math.sqrt(Math.pow(x - orderedPoints[i].x-this.centerX,2)+Math.pow(y - orderedPoints[i].y-this.centerY,2));
						if(i > 0){
							if(orderedPoints[i].distance < orderedPoints[i-1].distance){
								temp = orderedPoints[i-1];
								orderedPoints[i-1] = orderedPoints[i];
								orderedPoints[i] = temp;
							}
						}
					}
					
					return orderedPoints;
				};
				
				this.drawObject = function(){
					var cX = this.centerX,
						cY = this.centerY,
						rotation = this.rotation,
						origin = this.getOrigin(),
						x = (rotation > 0) ? -origin.x+radius : this.x-origin.x+radius,
						y = (rotation > 0) ? -origin.y+radius : this.y-origin.y+radius,
						firstPoint = {x:0,y:0},
						sides = this.sides,
						points = this.points;
					
					_class.canvas.beginPath();
					var xPos,yPos;
					for(var i = 0; i <= sides; i++)
					{
						xPos = x + radius * Math.cos(i*2*Math.PI/sides);
						yPos = y + radius * Math.sin(i*2*Math.PI/sides);
						
						if(points.length != sides)
							points.push({x:xPos,y:yPos});
						if(i == 0){
							_class.canvas.moveTo(xPos,yPos);
							firstPoint = {x:xPos,y:yPos};
						}else if(i == sides){
							_class.canvas.lineTo(firstPoint.x,firstPoint.y);
						}else{
							_class.canvas.lineTo(xPos,yPos);
						}
					}
					_class.canvas.closePath();
					
					if(this.type == "fill")
					{
						_class.canvas.fillStyle = this.fillColor;
						_class.canvas.fill();
						if(this.lineWidth)
						{
							_class.canvas.lineWidth = this.lineWidth;
							_class.canvas.strokeStyle = this.strokeColor;
							_class.canvas.stroke();
						}
					}
					else if(this.type == "stroke")
					{
						_class.canvas.lineWidth = this.lineWidth;
						_class.canvas.strokeStyle = this.strokeColor;
						_class.canvas.stroke();
					}

					return this;
				};
				
				this.rotate = function(angle){
					this.rotation = _class.transform.rotate(angle,this.rotation);
					
					return this;
				};
				
				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};
				
				this.scale = function(x,y){
					var scaled = _class.transform.scale(x,x,radius,0);
					radius = scaled.x;
					side = 2*radius*Math.sin(Math.PI/this.sides);
					
					return this;
				};
				
				this.scaleTo = function(value,type){
					if(type == 'radius'){
						radius = value;
						side = 2*radius*Math.sin(Math.PI/this.sides);
					}else if(type == 'side'){
						side = value;
						radius = (side/2)/Math.sin(Math.PI/this.sides);
					}
					
					return this;
				};
				
				this.pendulum = function(min,max,stepX,stepY){
					_class.pendulum(this,radius,min,max,stepX,stepY);
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x + radius;
					this.centerY = this.y + radius;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x + radius;
					this.centerY = this.y + radius;
					
					return this;
				};
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
			};
			_class.Polygon.prototype = new _class.events.mouse();
			
			_class.Arc = function(x,y,radius,startAngle,endAngle,antiClockwise,type,fillColor,strokeColor,lineWidth){
				this.rotation = 0;
				this.pendulumDir = "up";
				this.x = x;
				this.y = y;
				this.centerX = x;
				this.centerY = y;
				this.origin = {x:'center',y:'center'};
				this.radius = radius;
				this.startAngle = startAngle;
				this.endAngle = endAngle;
				this.antiClockwise = antiClockwise;
				_class.style.set(this,type,fillColor,strokeColor,lineWidth);
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "arc";
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				
				this.drawObject = function(){
					var origin = this.getOrigin(),
						cX = (this.rotation > 0 ? -origin.x+this.radius : this.x-origin.x+this.radius),
						cY = (this.rotation > 0 ? -origin.y+this.radius : this.y-origin.y+this.radius);
					_class.canvas.beginPath();
					_class.canvas.arc(cX,cY,this.radius,this.startAngle*Math.PI/180,this.endAngle*Math.PI/180,this.antiClockwise);
					
					
					if(this.type == "fill")
					{
						_class.canvas.fillStyle = this.fillColor;
						_class.canvas.fill();
						if(this.lineWidth > 0)
						{
							_class.canvas.lineWidth = this.lineWidth;
							_class.canvas.strokeStyle = this.strokeColor;
							_class.canvas.stroke();
						}
					}
					else if(this.type == "stroke")
					{
						_class.canvas.lineWidth = this.lineWidth;
						_class.canvas.strokeStyle = this.strokeColor;
						_class.canvas.stroke();
					}
					_class.canvas.closePath();
		
					return this;
				};
								
				this.rotate = function(angle){
					this.rotation = _class.transform.rotate(angle,this.rotation);
					
					return this;
				};
				
				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};
				
				this.scale = function(factor){
					var scaled = _class.transform.scale(factor,factor,this.radius,0);
					this.radius = scaled.x;
					
					return this;
				};
				
				this.scaleTo = function(radius){
					this.radius = radius;
					
					return this;
				};
				
				
				this.pendulum = function(min,max,stepX,stepY){
					_class.pendulum(this,this.radius,min,max,stepX,stepY);
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x;
					this.centerY = this.y;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x;
					this.centerY = this.y;
					
					return this;
				};
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = this.radius;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = this.radius;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= this.x-this.origin.x;
						y -= this.y-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y;
					
					if(x == 'center')
						x = this.radius;
					if(y == 'center')
						y = this.radius;
					
					if(x > 0 || y > 0){
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
						
						this.x = oldSX+changeX;
						this.y = oldSY+changeY;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y;
						else
							this.y -= oldOrigin.y;
					}
					
					return this;
				}
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
			};
			_class.Arc.prototype = new _class.events.mouse();
			
			_class.Point = function(x,y,color){
				this.x = x;
				this.y = y;
				this.centerX = x;
				this.centerY = y;
				this.fillColor = (color == "random") ? _class.style.randomColor() : color;
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "point";
				this.rotation = 0;
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				
				this.drawObject = function(){
					_class.canvas.beginPath();
					_class.canvas.fillStyle = this.fillColor;
					_class.canvas.fillRect(this.x,this.y,1,1);
					_class.canvas.closePath();
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x;
					this.centerY = this.y;
					this.rotationCenterX = this.centerX;
					this.rotationCenterY = this.centerY;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x;
					this.centerY = this.y;
					this.rotationCenterX = this.centerX;
					this.rotationCenterY = this.centerY;
					
					return this;
				};
			};
			_class.Point.prototype = new _class.events.mouse();
			
			_class.Image = function(image,x,y){
				var that = this;
				this.rotation = 0;
				this.pendulumDir = "up";
				this.x = x;
				this.y = y;
				this.width = 0;
				this.height = 0;
				this.origin = {x:0, y:0};
				this.centerX = x;
				this.centerY = y;
				this.imageLoaded = false;
				this.source = (image.nodeName == 'IMG') ? 'htmlImg' : 'newImg';
				this.img = (this.source == 'htmlImg') ? image.cloneNode(false) : new Image();
				_class.canvasElement.appendChild(this.img);
				this.img.onload = function(){
					that.imageLoaded = true;
					that.width = this.width;
					that.height = this.height;
					that.centerX = that.x + that.width/2;
					that.centerY = that.y + that.height/2;
				};
				if(this.source == 'newImg')
					this.img.src = image;
					
				this.timeoutActive = false;
				this.firstDrawn = false;
				this.timeout = 0;
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "rectangle";
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.remove = function(){
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				
				this.drawObject = function(){
					if(this.imageLoaded){
						var origin = this.getOrigin(),
						x = (this.rotation > 0) ? -origin.x : this.x-origin.x,
						y = (this.rotation > 0) ? -origin.y : this.y-origin.y;
						
						_class.canvas.beginPath();
						_class.canvas.drawImage(this.img,x,y,this.width,this.height);
						_class.canvas.closePath();
						if(this.firstDrawn == false){
							this.firstDrawn = true;
							clearTimeout(this.timeout);
						}
					}else if(this.timeoutActive == false){
						this.timeoutActive = true;
						this.timeout = setTimeout(function(){ that.timeoutActive = false; that.draw(); },100);
					}
						
					return this;
				};
				
				this.rotate = function(angle){
					if(this.firstDrawn == true)
						this.rotation = _class.transform.rotate(angle,this.rotation);
						
					return this;
				};

				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};

				
				this.scale = function(x,y){
					var scaled = _class.transform.scale(x,y,this.width,this.height);
					this.width = scaled.x;
					this.height = scaled.y;
					
					return this;
				};
				
				this.scaleTo = function(width,height){
					this.width = width;
					this.height = height;
					
					return this;
				};
				
				this.pendulum = function(min,max,stepX,stepY){
					_class.pendulum(this,this.width,min,max,stepX,stepY);
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = this.width/2;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = this.height/2;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= this.x-this.origin.x;
						y -= this.y-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y;
					
					if(x == 'center')
						x = this.width/2;
					if(y == 'center')
						y = this.height/2;
					
					if(x > 0 || y > 0){
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
						
						this.x = oldSX+changeX;
						this.y = oldSY+changeY;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y;
						else
							this.y -= oldOrigin.y;
					}
				
					return this;
				}
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
			};
			_class.Image.prototype = new _class.events.mouse();
			
			_class.Text = function(x,y,text,font,textAlign,textBaseline,type,fillColor,strokeColor,lineWidth){
				this.rotation = 0;
				this.fontX = x;
				this.fontY = y;
				this.text = text;
				this.font = font;
				var fontSize = parseFloat(/[-+]?[0-9]*\.?[0-9]*em /.exec(this.font));
				this.x = x;
				this.y = y;
				this.origin = {x:0,y:0};
				this.width = 0;
				this.height = 0;
				this.centerX = 0;
				this.centerY = 0;
				this.textAlign = textAlign;
				this.textBaseline = textBaseline;
				_class.style.set(this,type,fillColor,strokeColor,lineWidth);
				this.events = {};
				this.objectID = _class.drawState.nextObjectID();
				this.onCanvas = false;
				this.collisionType = "rectangle";
				
				this.draw = function(){
					if(this.onCanvas == false){
						this.drawObject();
						this.onCanvas = true;
						_class.drawState.add(this);
					}else{
						_class.drawState.draw(this.objectID);
					}
					
					return this;
				};
				
				this.__defineGetter__('fontSize',function(){
					return fontSize;
				});
				
				this.num = 0;
				
				this.__defineSetter__('fontSize',function(newSize){
					fontSize = Math.round(parseFloat(newSize)*100)/100;
					//_class.console.log('font: '+this.font);
					this.font = this.font.replace(/[-+]?[0-9]*\.?[0-9]*em/,newSize+"em");
					this.setSize();
					this.num++;
					//_class.console.log('num: '+this.num,true);
					//_class.console.log('font: '+this.font);
					//_class.console.log('fontSize: '+fontSize);
				});
				
				this.setSize = function(set_origin){
					set_origin = set_origin || false;
					
					_class.canvas.fillStyle = this.fillColor;
					_class.canvas.font = this.font;
					var metrics = _class.canvas.measureText(this.text),
						match = /(\d+)[a-z][a-z] /.exec(this.font);
					
					this.width = metrics.width;
					this.height = parseFloat(match[1]);
					
					if(set_origin)
						this.setOrigin(0,this.height/2);
					
					this.centerX = this.x+this.width/2;
					this.centerY = this.y+this.height/2;
				};
				
				
				this.remove = function(){
					var events = this.events;
					for(var i in events)
					{
						if(events[i].id != undefined)
							_class.mouse.removeEvent(i,events[i].id);
					}
					_class.drawState.remove(this.objectID);
					
					return this;
				};
				
				this.drawObject = function(){
					var origin = this.getOrigin(),
						oX = (this.rotation > 0 ? -origin.x : this.x-origin.x),
						oY = (this.rotation > 0 ? -origin.y : this.y-origin.y),
						lW = this.lineWidth,
						w = this.width,
						h = this.height;
						
					
					_class.canvas.beginPath();
					if(this.type == "fill")
					{
						_class.canvas.fillStyle = this.fillColor;
						_class.canvas.font = this.font;
						_class.canvas.textAlign = this.textAlign;
						_class.canvas.textBaseline = this.textBaseline;
						_class.canvas.fillText(this.text,oX,oY);
						_class.canvas.fill();
					}
					if(lW > 0)
					{
						_class.canvas.lineWidth = lW;
						_class.canvas.strokeStyle = this.strokeColor;
						_class.canvas.strokeText(this.text,oX,oY);
						_class.canvas.stroke();
					}
					_class.canvas.closePath();
					
					return this;
				};
				
				this.rotate = function(angle,centerX,centerY){
					this.rotation = _class.transform.rotate(angle,this.rotation);
					
					return this;
				};
				
				this.rotateTo = function(angle){
					this.rotation = _class.transform.rotate(angle,0);
					
					return this;
				};
				
				this.scale = function(x,y){
					var scaled = _class.transform.scale(x,y,this.width,this.height);
					this.width = scaled.x;
					this.height = scaled.y;
					
					return this;
				};
				this.scaleTo = function(width,height){
					this.width = width;
					this.height = height;
					
					return this;
				};
				
				this.move = function(x,y){
					this.x += x;
					this.y += y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.x = x;
					this.y = y;
					this.centerX = this.x + this.width/2;
					this.centerY = this.y + this.height/2;
					
					return this;
				};
				
				this.getOrigin = function(){
					var oX,oY;
					if(this.origin.x == 'center')
						oX = this.width/2;
					else if(this.origin.x == 'right')
						oX = this.width;
					else
						oX = this.origin.x;
						
					if(this.origin.y == 'center')
						oY = this.height/2;
					else
						oY = this.origin.y;
						
					return {x:oX,y:oY};
				};
				
				this.setOrigin = function(x,y,global){
					if(global === true){
						x -= this.x-this.origin.x;
						y -= this.y-this.origin.y;
					}
					var oldOrigin = this.getOrigin();
					this.origin.x = x;
					this.origin.y = y-this.height*0.7;
					
					if(x == 'center')
						x = this.width/2;
					if(y == 'center')
						y = this.height/2;
					if(x == 'right')
						x = this.width;

					
					var yOffset = 0;
					
					//y += (this.textBaseline == "top" ? 0 : (this.textBaseline == "middle" ? -this.height/2 : (this.textBaseline == "alphabetic" ? -this.height*0.7 : -this.height*1.5)));
					
//					if(this.textAlign == "center" || this.textAlign == "right")
//						yOffset *= -1;
					
					if(x > 0 || y > 0){
						var d = Math.sqrt(x*x+y*y),
							angle = 90-Math.acos(y/d)*180/Math.PI+this.rotation,
							changeX = Math.round(Math.cos(angle*Math.PI/180)*d),
							changeY = Math.round(Math.sin(angle*Math.PI/180)*d),
							oldSX = this.x-oldOrigin.x,
							oldSY = this.y-oldOrigin.y;
						
						this.x = oldSX+changeX;
						//this.y = oldSY+changeY+yOffset;
					}else{
						if(x < 0)
							this.x -= oldOrigin.x - x;
						else
							this.x -= oldOrigin.x;
						if(y < 0)
							this.y -= oldOrigin.y - y + yOffset;
						else
							this.y -= oldOrigin.y+yOffset;
					}
					
					return this;
				}
				
				this.animate = function(parameters,duration,easing,increment){
					_class.animation.animate(parameters,duration,easing,this,false,increment);
					
					return this;
				};
				
				this.stop = function(){
					_class.animation.stop(this.objectID);
					
					return this;
				};
				
				this.setSize(true);
			};
			_class.Text.prototype = new _class.events.mouse();
			
			_class.Wrapper = function(){
				this.children = {};
				this.x = 0;
				this.y = 0;
				this.centerX = 0;
				this.centerY = 0;
				this.width = 0;
				this.height = 0;
				
				this.addChild = function(obj,id){
					this.children[id] = obj;
					
					return this;
				};
				
				this.getChild = function(id){
					return this.children[id];
				};
				
				this.removeChild = function(id){
					this.children[id].remove();
					this.children[id] = null;
				};
				
				this.remove = function(){
					var children = this.children;
					for(var c in children){
						if(children[c] != null)
							children[c].remove();
					}
					
					return this;
				};
				
				this.getPosition = function(){
					var top=99999999,right=0,bottom=0,left=99999999,
						children = this.children;
					for(var c in children){
						if(children[c].y < top)
							top = children[c].y;
						if(children[c].y+children[c].height > bottom)
							bottom = children[c].y+children[c].height;
						if(children[c].x < left)
							left = children[c].x;
						if(children[c].x+children[c].width > right)
							right = children[c].x+children[c].width;
					}
					
					this.x = left;
					this.y = top;
					this.width = right-left;
					this.height = bottom-top;
					this.centerX = (right-left)/2+left;
					this.centerY = (bottom-top)/2+top;
				};
				this.getPosition();
				
				this.rotate = function(angle){
					this.getPosition();
					var children = this.children;
					for(var c in children){
						children[c].rotate(angle,this.centerX,this.centerY);
					}
					this.getPosition();
					
					return this;
				};
				
				this.scale = function(x,y){
					this.getPosition();
					var children = this.children;
					for(var c in children){
						children[c].scale(x,y);
						children[c].move(-(children[c].centerX-this.centerX)*(1-x),-(children[c].centerY-this.centerY)*(1-y));
					}
					this.getPosition();
					
					return this;
				};
				
				this.move = function(x,y){
					this.getPosition();
					var children = this.children;
					for(var c in children){
						children[c].move(x,y);
					}
					this.getPosition();
					
					return this;
				};
				
				this.moveTo = function(x,y){
					this.getPosition();
					var diffX = x-this.x,
						diffY = y-this.y,
						children = this.children;
					for(var c in children){
						children[c].move(diffX,diffY);
					}
					this.getPosition();
					
					return this;
				};
			};
			_class.Wrapper.prototype = new _class.events.mouse();
		},
		plugins: {},
		registerPlugin: function(pluginName,pluginContext,pluginFunction){
			this.plugins[pluginName] = {name:pluginName,context:pluginContext,func:pluginFunction};
		},
		addPluginsToCanvas: function(activePlugins,canvasID){
			var canvas = this.canvasList[canvasID],
				allPlugins = this.plugins,
				activePluginsLength = activePlugins.length,
				i, plugin, contextParts, n, context;
				
			for(i = activePluginsLength; i--;){
				if(activePlugins[i] in allPlugins){
					plugin = allPlugins[activePlugins[i]];
					contextParts = plugin.context.split('.');
					context = canvas;
					for(n = 0; n < contextParts.length; n++){
						context = context[contextParts[n]];
					}
					
					context[plugin.name] = plugin.func;
				}
			}
		}
	};
	window.oCanvas = oCanvas;
})(window,document);