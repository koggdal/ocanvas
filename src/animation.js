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
				easing: "ease-in-out"
			},

			animate: function (obj, args) {
				args = Array.prototype.slice.call(args);
				args[1] = args[1] || {};

				var props, options, queue, animation;

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

					// Parse the easing option
					if (typeof options.easing === "string") {
						if (~options.easing.indexOf("cubic-bezier")) {
							options.easing = this.getCustomCubicBezier(options.easing) || this.easing[this.defaults.easing];
						} else {
							options.easing = this.easing[options.easing] || this.easing[this.defaults.easing];
						}
					} else if (typeof options.easing !== "function") {
						options.easing = this.easing[this.defaults.easing];
					}

				// Or parse old syntax
				} else {
					props = args.shift();
					options = this.getAnimateArguments(args);
				}

				// Create queue and get it
				queue = this.queues.create(obj, options.queue);

				// Create the animation object
				animation = {
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

			runAnimation: function (animation, callback) {
				var obj, props, options, prop;

				obj = animation.obj;
				props = animation.properties;
				options = animation.options;
				animation.advanceCallback = callback;

				// Indicate to the module that we want to run an animation, which will start a redraw loop
				this.mainTimer.add(animation);

				// Collect values for the animation
				for (prop in props) {
					if (oCanvas.isNumber(props[prop])) {
						animation.startValues[prop] = obj[prop] || 0;
						animation.diffValues[prop] = props[prop] - (obj[prop] || 0);
					} else {
						delete props[prop];
					}
				}

				// Set initial time
				animation.startTime = new Date().getTime();
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
				propertyPosition = animation.options.easing.call(this.easing, position);

				// Set new values for all properties
				startValues = animation.startValues;
				diffValues = animation.diffValues;
				for (prop in diffValues) {
					animation.obj[prop] = startValues[prop] + diffValues[prop] * propertyPosition;
				}

				return true;
			},

			setEndValues: function (animation) {
				for (var prop in animation.properties) {
					animation.obj[prop] = animation.properties[prop];
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
									var queue = this;
									module.runAnimation(this.list[0], function () { queue.advance(); });
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
									cancelAnimationFrame(animation.timer);
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

			easing: {

				"ease-in": function (time) {
					return this.cubicBezier(0.42, 0, 1, 1, time);
				},

				"ease-out": function (time) {
					return this.cubicBezier(0, 0, 0.58, 1, time);
				},

				"ease-in-out": function (time) {
					return this.cubicBezier(0.42, 0, 0.58, 1, time);
				},

				"linear": function (time) {
					return time;
				},

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
