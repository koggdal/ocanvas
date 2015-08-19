(function(oCanvas, window, document, undefined){
	window.logs = [];

	// Define the class
	var animation = function () {

		// Return an object when instantiated
		var module = {

			durations: {
				"short": 500,
				"normal": 1000,
				"long": 2000
			},

			defaults: {
				duration: "normal",
				easing: "ease-in-out" // Deprecated value, will be replaced by "ease-in-out-cubic"
			},

			animate: function (obj, args) {
				var argData = this.parseArguments(args);
				var props = argData.properties;
				var options = argData.options;

				// Create queue and get it
				var queue = this.queues.create(obj, options.queue);

				// Create the animation object
				var animation = {
					obj: obj,
					properties: props,
					startValues: {},
					diffValues: {},
					options: {
						queue: queue,
						duration: options.duration,
						easing: options.easing,
						callback: options.callback
					}
				};

				// Add the animation to the queue and run queue
				queue.add(animation);
				queue.run();
			},

			parseArguments: function (args) {
				args = Array.prototype.slice.call(args);
				args[1] = args[1] || {};
				var options;

				// Check for new syntax
				if (typeof args[1] === "object") {
					props = args[0];

					// Use passed in options, with fallbacks
					options = oCanvas.extend({
						duration: this.defaults.duration,
						easing: this.defaults.easing,
						queue: "default",
						callback: function () {}
					}, args[1]);

					options.easing = this.parseEasingOption(options.easing);
					options.duration = this.parseDurationOption(options.duration);

				// Or parse old deprecated syntax
				} else {
					props = args.shift();
					options = this.getAnimateArguments(args);
				}

				return {
					properties: props,
					options: options
				};
			},

			parseEasingOption: function (easing) {
				if (typeof easing === "string") {
					// The cubic-bezier() syntax is now deprecated (though it was never really public)
					if (~easing.indexOf("cubic-bezier")) {
						return this.getCustomCubicBezier(easing) || this.easing[this.defaults.easing];
					} else {
						return this.easing[easing] || this.easing[this.defaults.easing];
					}
				} else if (typeof easing == "function") {
					return easing;
				} else {
					return this.easing[this.defaults.easing];
				}
			},

			parseDurationOption: function (duration) {
				var durations = module.durations;
				if (typeof duration === "string") {
					return durations[duration] || durations[module.defaults.duration];
				}
				return duration;
			},

			runAnimation: function (animation, callback) {
				var obj, props, options, prop;

				obj = animation.obj;
				options = animation.options;
				animation.advanceCallback = callback;

				// Indicate to the module that we want to run an animation, which will start a redraw loop
				this.mainTimer.add(animation);

				// Collect values for the animation
				var props = this.parseProperties(animation.properties, obj);
				animation.properties = props.properties;
				animation.startValues = props.startValues;
				animation.diffValues = props.diffValues;

				// Set initial time
				animation.startTime = new Date().getTime();
			},

			parseProperties: function (props, obj) {
				var startValues = {};
				var diffValues = {};
				for (var prop in props) {
					if (oCanvas.isNumber(props[prop])) {
						startValues[prop] = obj[prop] || 0;
						diffValues[prop] = props[prop] - (obj[prop] || 0);
					} else if (typeof props[prop] === "object") {
						var parsedProps = this.parseProperties(props[prop], obj[prop]);
						startValues[prop] = parsedProps.startValues;
						diffValues[prop] = parsedProps.diffValues;
					} else {
						delete props[prop];
					}
				}

				return {
					properties: props,
					startValues: startValues,
					diffValues: diffValues
				};
			},

			tick: function (animation) {
				var timeDiff, position, propertyPosition, startValues, diffValues, prop;

				// Calculate position in time for the animation
				timeDiff = new Date().getTime() - animation.startTime;
				position = timeDiff / animation.options.duration;

				// Stop the animation if the duration has passed
				if (position > 1) {
					this.setEndValues(animation);
					return false;
				}

				// Calculate the property position based on the easing function
				if (animation.options.easing.length === 1) {
					// Deprecated syntax
					propertyPosition = animation.options.easing.call(this.easing, position);
				} else {
					// New syntax
					propertyPosition = animation.options.easing.call(this.easing, timeDiff, 0, 1, animation.options.duration);
				}

				// Set new values for all properties
				startValues = animation.startValues;
				diffValues = animation.diffValues;
				for (prop in diffValues) {
					this.setObjectProperty(animation.obj, prop, startValues[prop], diffValues[prop], propertyPosition);
				}

				return true;
			},

			setObjectProperty: function (obj, property, startValue, diffValue, propertyPosition) {
				if (oCanvas.isNumber(startValue)) {
					obj[property] = startValue + diffValue * propertyPosition;
				} else {
					for (var prop in startValue) {
						this.setObjectProperty(obj[property], prop, startValue[prop], diffValue[prop], propertyPosition);
					}
				}
			},

			setEndValues: function (animation) {
				var obj = animation.obj;
				var startValues = animation.startValues;
				var diffValues = animation.diffValues;
				for (var prop in animation.properties) {
					this.setObjectProperty(obj, prop, startValues[prop], diffValues[prop], 1);
				}
				if (!this.core.timeline.running) {
					this.core.draw.redraw(true);
				}
			},

			// Method that collects arguments passed in to the animate method, and corrects with defaults.
			// Used to parse the deprecated syntax of the animate method.
			getAnimateArguments: function (args) {
				var duration, easing, newQueue, callback;

				// First argument is already pulled out (properties object)

				// Second argument
				if (typeof args[0] === "number") {
					duration = args[0];
				} else if (typeof args[0] === "string") {
					if (args[0] in this.durations) {
						duration = this.durations[args[0]];
					} else if (args[0] in this.easing) {
						easing = this.easing[args[0]];
					}
				} else if (typeof args[0] === "boolean") {
					newQueue = args[0];
				} else if (typeof args[0] === "function") {
					if (typeof args[1] === "function") {
						easing = args[0];
						callback = args[1];
					}
				}

				// Third argument
				if (typeof args[1] === "string") {
					easing = this.easing[args[1]];
				} else if (typeof args[1] === "function") {
					if (args[2] !== undefined) {
						easing = args[1];
					} else {
						callback = args[1];
					}
				}

				// Fourth argument
				if (args[2] !== undefined) {
					if (typeof args[2] === "function") {
						callback = args[2];
					} else {
						newQueue = !!args[2];
					}
				}

				// Fifth argument
				if (args[3] !== undefined) {
					callback = args[3];
				}

				if (!easing) {
					easing = typeof args[0] === "string" ? args[0] : "";
					easing = ~easing.indexOf("cubic-bezier") ? easing : undefined;
					if (!easing) {
						easing = typeof args[1] === "string" ? args[1] : "";
						easing = ~easing.indexOf("cubic-bezier") ? easing : undefined;
					}
					if (easing) {
						easing = this.getCustomCubicBezier(easing);
					}
				}

				duration = duration || this.durations[this.defaults.duration];
				easing = easing || this.easing[this.defaults.easing];
				newQueue = newQueue !== undefined ? newQueue : false;
				callback = callback || function () {};

				return {
					duration: duration,
					easing: easing,
					queue: newQueue ? undefined : "default",
					callback: callback
				};
			},

			getCustomCubicBezier: function (value) {
				var match, x1, y1, x2, y2;

				// Get the values from the form:
				//   cubic-bezier(x1, y1, x2, y2)
				match = value.match(/cubic-bezier\(\s*(.*?),\s*(.*?),\s*(.*?),\s*(.*?)\)/);

				// Abort early if the input string is not valid
				if (!match) {
					return;
				}

				// Parse numbers
				x1 = !isNaN(parseFloat(match[1])) ? parseFloat(match[1]) : 0,
				y1 = !isNaN(parseFloat(match[2])) ? parseFloat(match[2]) : 0,
				x2 = !isNaN(parseFloat(match[3])) ? parseFloat(match[3]) : 1,
				y2 = !isNaN(parseFloat(match[4])) ? parseFloat(match[4]) : 1;

				return function (time) {
					return this.cubicBezier(x1, y1, x2, y2, time);
				};
			},

			stop: function (obj) {
				for (var name in obj.animationQueues) {
					obj.animationQueues[name].clear(false);
				}
			},

			finish: function (obj) {
				for (var name in obj.animationQueues) {
					obj.animationQueues[name].clear(true);
				}
			},

			delay: function (obj, duration, options) {
				var queue = obj.animationQueues[(options && options.queue) || "default"];
				if (queue) {
					queue.add({ type: "delay", duration: duration || 0 });
				}
			},

			mainTimer: {
				animations: [],
				add: function (animation) {
					this.animations.push(animation);
					if (this.animations.length === 1) {
						this.start();
					}
				},
				remove: function (animation) {
					this.animations.splice(this.animations.indexOf(animation), 1);
					if (this.animations.length === 0) {
						this.stop();
					}
				},
				start: function () {
					this.tick();
				},
				stop: function () {
					cancelAnimationFrame(this.timer);
				},
				tick: function () {
					var self = this;
					setTimeout(function () {
						self.timer = requestAnimationFrame(function () { self.tick(); });

						var animations = self.animations;
						var animation;
						for (var i = 0, l = animations.length; i < l; i++) {
							animation = animations[i];
							if (!animation.cancelled) {
								if (!module.tick(animation)) {
									module.mainTimer.remove(animation);
									i--; l--;
									animation.advanceCallback();
									animation.options.callback.call(animation.obj);
								}
							}
						}

						if (!module.core.timeline.running) {
							module.core.draw.redraw(true);
						}
					}, 1000 / module.core.settings.fps);
				}
			},

			queues: {

				create: function (obj, name) {
					if (name === undefined) {
						name = Math.round(new Date().getTime() * Math.random()).toString();
					}
					if (!obj.animationQueues[name]) {
						obj.animationQueues[name] = {
							name: name,
							list: [],
							isRunning: false,
							add: function (animation) {
								this.list.push(animation);
							},
							remove: function (animation) {
								if (animation) {
									var index = this.list.indexOf(animation);
									if (~index) {
										this.list.splice(index, 1);
									}
								} else {
									this.list.shift();
								}
							},
							run: function () {
								if (!this.isRunning && this.list.length > 0) {
									this.isRunning = true;
									var listItem = this.list[0];
									var queue = this;
									if (listItem.type === "delay") {
										setTimeout(function () {
											queue.advance();
										}, listItem.duration);
									} else {
										module.runAnimation(listItem, function () { queue.advance(); });
									}
								}
							},
							advance: function () {
								this.list.shift();
								this.isRunning = false;
								this.run();
							},
							clear: function (finish) {
								if (this.isRunning) {
									var animation = this.list[0];
									animation.cancelled = true;

									if (finish) {
										module.setEndValues(animation);
										animation.options.callback.call(animation.obj);
									}
									this.isRunning = false;
									module.mainTimer.remove(animation);
								}
								this.list.length = 0;
							}
						};
					}
					return this.get(obj, name);
				},

				get: function (obj, name) {
					return obj.animationQueues[name];
				}
			},

			// Easing functions take at least four arguments:
			// t: Current time
			// b: Start value
			// c: Change in value from start to end
			// d: Total duration of the animation
			// Some easing functions also take some optional arguments:
			// a: Amplitude
			// p: Period
			// s: Overshoot amount
			//
			// They return the new value. In oCanvas, 0 is passed in
			// as start value and 1 as change in value. This will
			// generate a factor that can be used on multiple property
			// values, and the easing function will only need to be
			// called once per frame, instead of once per property per frame.
			// The additional arguments are not passed though, which will
			// make them take the default values in those functions.
			//
			// The equations are created by Robert Penner.
			// (c) 2003 Robert Penner, all rights reserved.
			// The work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html.
			easing: {

				// Deprecated
				"ease-in": function (time) {
					return this.cubicBezier(0.42, 0, 1, 1, time);
				},

				// Deprecated
				"ease-out": function (time) {
					return this.cubicBezier(0, 0, 0.58, 1, time);
				},

				// Deprecated
				"ease-in-out": function (time) {
					return this.cubicBezier(0.42, 0, 0.58, 1, time);
				},

				// Deprecated syntax, will adopt the t, b, c, d syntax as the rest
				"linear": function (time) {
					return time;
				},

				"ease-in-quad": function (t, b, c, d) {
					return c*(t/=d)*t + b;
				},

				"ease-out-quad": function (t, b, c, d) {
					return -c *(t/=d)*(t-2) + b;
				},

				"ease-in-out-quad": function (t, b, c, d) {
					if ((t/=d/2) < 1) return c/2*t*t + b;
					return -c/2 * ((--t)*(t-2) - 1) + b;
				},

				"ease-in-cubic": function (t, b, c, d) {
					return c*(t/=d)*t*t + b;
				},

				"ease-out-cubic": function (t, b, c, d) {
					return c*((t=t/d-1)*t*t + 1) + b;
				},

				"ease-in-out-cubic": function (t, b, c, d) {
					if ((t/=d/2) < 1) return c/2*t*t*t + b;
					return c/2*((t-=2)*t*t + 2) + b;
				},

				"ease-in-quart": function (t, b, c, d) {
					return c*(t/=d)*t*t*t + b;
				},

				"ease-out-quart": function (t, b, c, d) {
					return -c * ((t=t/d-1)*t*t*t - 1) + b;
				},

				"ease-in-out-quart": function (t, b, c, d) {
					if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
					return -c/2 * ((t-=2)*t*t*t - 2) + b;
				},

				"ease-in-quint": function (t, b, c, d) {
					return c*(t/=d)*t*t*t*t + b;
				},

				"ease-out-quint": function (t, b, c, d) {
					return c*((t=t/d-1)*t*t*t*t + 1) + b;
				},

				"ease-in-out-quint": function (t, b, c, d) {
					if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
					return c/2*((t-=2)*t*t*t*t + 2) + b;
				},

				"ease-in-sine": function (t, b, c, d) {
					return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
				},

				"ease-out-sine": function (t, b, c, d) {
					return c * Math.sin(t/d * (Math.PI/2)) + b;
				},

				"ease-in-out-sine": function (t, b, c, d) {
					return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
				},

				"ease-in-expo": function (t, b, c, d) {
					return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
				},

				"ease-out-expo": function (t, b, c, d) {
					return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
				},

				"ease-in-out-expo": function (t, b, c, d) {
					if (t==0) return b;
					if (t==d) return b+c;
					if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
					return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
				},

				"ease-in-circ": function (t, b, c, d) {
					return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
				},

				"ease-out-circ": function (t, b, c, d) {
					return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
				},

				"ease-in-out-circ": function (t, b, c, d) {
					if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
					return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
				},

				"ease-in-elastic": function (t, b, c, d, a, p) {
					a = a || 0;
					if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
					if (a < Math.abs(c)) { a=c; var s=p/4; }
					else var s = p/(2*Math.PI) * Math.asin (c/a);
					return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
				},

				"ease-out-elastic": function (t, b, c, d, a, p) {
					a = a || 0;
					if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
					if (a < Math.abs(c)) { a=c; var s=p/4; }
					else var s = p/(2*Math.PI) * Math.asin (c/a);
					return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
				},

				"ease-in-out-elastic": function (t, b, c, d, a, p) {
					a = a || 0;
					if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
					if (a < Math.abs(c)) { a=c; var s=p/4; }
					else var s = p/(2*Math.PI) * Math.asin (c/a);
					if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
					return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
				},

				"ease-in-back": function (t, b, c, d, s) {
					if (s == undefined) s = 1.70158;
					return c*(t/=d)*t*((s+1)*t - s) + b;
				},

				"ease-out-back": function (t, b, c, d, s) {
					if (s == undefined) s = 1.70158;
					return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
				},

				"ease-in-out-back": function (t, b, c, d, s) {
					if (s == undefined) s = 1.70158;
					if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
					return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
				},

				"ease-in-bounce": function (t, b, c, d) {
					return c - this["ease-out-bounce"](d-t, 0, c, d) + b;
				},

				"ease-out-bounce": function (t, b, c, d) {
					if ((t/=d) < (1/2.75)) {
						return c*(7.5625*t*t) + b;
					} else if (t < (2/2.75)) {
						return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
					} else if (t < (2.5/2.75)) {
						return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
					} else {
						return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
					}
				},

				"ease-in-out-bounce": function (t, b, c, d) {
					if (t < d/2) return this["ease-in-bounce"](t*2, 0, c, d) * .5 + b;
					return this["ease-out-bounce"](t*2-d, 0, c, d) * .5 + c*.5 + b;
				},

				// Deprecated, will be replaced by the new syntax for calling easing functions
				cubicBezier: function (x1, y1, x2, y2, time) {

					// Inspired by Don Lancaster's two articles
					// http://www.tinaja.com/glib/cubemath.pdf
					// http://www.tinaja.com/text/bezmath.html


						// Set start and end point
					var x0 = 0,
						y0 = 0,
						x3 = 1,
						y3 = 1,

						// Convert the coordinates to equation space
						A = x3 - 3*x2 + 3*x1 - x0,
						B = 3*x2 - 6*x1 + 3*x0,
						C = 3*x1 - 3*x0,
						D = x0,
						E = y3 - 3*y2 + 3*y1 - y0,
						F = 3*y2 - 6*y1 + 3*y0,
						G = 3*y1 - 3*y0,
						H = y0,

						// Variables for the loop below
						t = time,
						iterations = 5,
						i, slope, x, y;

					// Loop through a few times to get a more accurate time value, according to the Newton-Raphson method
					// http://en.wikipedia.org/wiki/Newton's_method
					for (i = 0; i < iterations; i++) {

						// The curve's x equation for the current time value
						x = A* t*t*t + B*t*t + C*t + D;

						// The slope we want is the inverse of the derivate of x
						slope = 1 / (3*A*t*t + 2*B*t + C);

						// Get the next estimated time value, which will be more accurate than the one before
						t -= (x - time) * slope;
						t = t > 1 ? 1 : (t < 0 ? 0 : t);
					}

					// Find the y value through the curve's y equation, with the now more accurate time value
					y = Math.abs(E*t*t*t + F*t*t + G*t * H);

					return y;
				}
			}

		};

		return module;
	};

	// Register the module
	oCanvas.registerModule("animation", animation);

})(oCanvas, window, document);
