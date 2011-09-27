(function(oCanvas, window, document, undefined){

	// Define the class
	var keyboard = function () {
		
		// Return an object when instantiated
		return {
			
			// List of all events that are added
			eventList: {
				keydown: [],
				keyup: [],
				keypress: [],
				running: []
			},
			
			// Define properties
			keysDown: {},
			keyPressTimers: {},
			modifiedKeys: [],
			lastActiveKeyDown: false,
			last_event: {},
			
			// Method for initializing the keyboard object
			init: function () {
				var _this = this;
				this.running = false;
				
				// Register event types
				this.core.events.types.keyboard = ["keydown", "keyup", "keypress"];
				
				// Add event listeners to the document
				document.addEventListener("keydown", function (e) { _this.keydown.call(_this, e); }, false);
				document.addEventListener("keyup", function (e) { _this.keyup.call(_this, e); }, false);
				document.addEventListener("keypress", function (e) { _this.preventDefault.call(_this, e); }, false);
			},
			
			// Method for adding an event to the event list
			addEvent: function (type, func) {
				return this.eventList[type].push(func) - 1;
			},
			
			// Method for removing an event from the event list
			removeEvent: function (type, id) {
				this.eventList[type].splice(id,1);
			},
			
			// Method for getting the key code from current event
			getKeyCode: function (e) {
				return e.keyCode === 0 ? e.which : e.keyCode;
			},
			
			// Method for getting how many keys are currently pressed down
			numKeysDown: function () {
				var active = 0,
					keysDown = this.keysDown;
				
				// Go through all the keys that are currently pressed down
				for (var x in keysDown) {
					if (keysDown[x] === true) {
						active++;
					}
				}
				
				return active;
			},
			
			// Method for checking if any keys are pressed down
			anyKeysDown: function () {
				if (this.numKeysDown() > 0) {
					return true;
				} else {
					return false;
				}
			},
			
			// Method for getting which keys are currently pressed down
			getKeysDown: function () {
				var keysDown = this.keysDown,
					down = [],
					x;
				
				// Go through all the keys that are currently pressed down
				for (x in keysDown) {
					if (keysDown[x] === true) {
						down.push(parseInt(x));
					}
				}
				
				return down;
			},
			
			// Method for triggering all events of a specific type
			triggerEvents: function (type, e) {
				var key, i, event, eventObject;
				
				// Abort if events are disabled
				if (!this.core.events.enabled) {
					return;
				}
				
				// If the mouse has set focus on the canvas
				if (this.core.mouse && this.core.mouse.canvasFocused === true) {
					key = this.eventList[type];
					eventObject = this.core.events.modifyEventObject(e, type);
					
					// Loop through all events and trigger them
					for (i = key.length; i--;) {
						event = key[i];
						if (typeof event === "function") {
							event(eventObject);
						}
					}
				}
			},
			
			// Method for triggering the events when a key is pressed down
			keydown: function (e) {
				this.last_event = e;
				var _this = this,
					keyCode = this.getKeyCode(e);
			
				// Cancel event if the key is already pressed down
				// (some browsers repeat even keydown when held down)
				if (this.keysDown[this.getKeyCode(e)] === true) {
					return;
				}
				
				// Prevent default for keys that have been added to the prevent list
				this.preventDefault(e);
				
				// Set the key states
				this.lastActiveKeyDown = this.getKeyCode(e);
				this.keysDown[this.lastActiveKeyDown] = true;
				
				// Trigger event handlers
				this.triggerEvents("keydown", e);
				
				// If there are keypress events attached
				if (this.eventList.keypress.length > 0) {
				
					// Set the timer to trigger keypress events continuously until released
					this.keyPressTimers[keyCode] = setInterval(function () { _this.keypress(e); }, 1000 / this.core.settings.fps);
				}
			},
			
			// Method for triggering the events when a key is released
			keyup: function (e) {
				this.last_event = e;
				
				// Prevent default for keys that have been added to the prevent list
				this.preventDefault(e);
				
				// Set the key states
				var keyCode = this.getKeyCode(e);
				if (keyCode === this.lastActiveKeyDown) {
					this.lastActiveKeyDown = false;
				}
				delete this.keysDown[keyCode];
				
				// Trigger event handlers
				this.triggerEvents("keyup", e);
				
				// If there are no more keys pressed down, cancel the keypress timers
				if (!this.anyKeysDown()) {
					for (var keyCode in this.keyPressTimers) {
						clearInterval(this.keyPressTimers[keyCode]);
					}
				} else {
					clearInterval(this.keyPressTimers[keyCode]);
				}
			},
			
			// Method for triggering the events when a key is pressed
			// The keydown method will trigger this method continuously until released
			keypress: function (e) {
				this.last_event = e;
				
				this.triggerEvents("keypress", e);
			},
			
			// Method for adding keys that will have the default actions prevented
			addPreventDefaultFor: function (keys) {
				
				// Fix the keys array
				keys = (typeof keys === "number") ? [keys] : ((keys.constructor === Array) ? keys : []);
				
				// Add the keys
				for (var i = 0; i < keys.length; i++) {
					this.modifiedKeys.push(keys[i]);
				}
			},
			
			// Method for removing keys that will no longer have the default actions prevented
			removePreventDefaultFor: function (keys) {
				
				// Fix the keys array
				keys = (typeof keys === "number") ? [keys] : ((keys.constructor === Array) ? keys : []);
				
				// Remove the keys
				var i, index;
				for (i = 0; i < keys.length; i++) {
					index = this.modifiedKeys.indexOf(keys[i]);
					if (~index) {
						this.modifiedKeys.splice(index, 1);
					}
				}
			},
			
			// Method for preventing the default behavior of the assigned keys
			preventDefault: function (e) {
				if (this.core.mouse && this.core.mouse.canvasFocused === true) {
					var keyCode = this.getKeyCode(e);
					
					if (~this.modifiedKeys.indexOf(keyCode)) {
						e.preventDefault();
					}
				}
			},
			
			ARROW_UP:38, ARROW_DOWN:40, ARROW_LEFT:37, ARROW_RIGHT:39, SPACE:32, ENTER:13, ESC:27
		};
	};
	
	// Register the module
	oCanvas.registerModule("keyboard", keyboard, "init");

})(oCanvas, window, document);