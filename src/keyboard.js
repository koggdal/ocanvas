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
			keyPressTimer: 0,
			keyPressRunning: false,
			modifiedKeys: {},
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
				document.addEventListener("keypress", function (e) { _this.preventkeypress.call(_this, e); }, false);
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
						down.push(x);
					}
				}
				
				return down;
			},
			
			// Method for triggering all events of a specific type
			triggerEvents: function (type, e) {
				var key, i, event, eventObject;
				
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
				var _this = this;
			
				// Cancel event if the key is already pressed down
				// (some browsers repeat even keydown when held down)
				if (this.keysDown[this.getKeyCode(e)] === true) {
					return;
				}
				
				// Set the key states
				this.lastActiveKeyDown = this.getKeyCode(e);
				this.keysDown[this.lastActiveKeyDown] = true;
				
				// Trigger event handlers
				this.triggerEvents("keydown", e);
				
				// Cancel the keypress timer
				clearInterval(this.keyPressTimer);
				this.keyPressRunning = false;
				
				// If there are keypress events attached and none are currently running
				if (!this.keyPressRunning && this.eventList.keypress.length > 0) {
				
					// Set the timer to trigger keypress events continuosly until released
					this.keyPressTimer = setInterval(function () { _this.keypress(e); }, 1000 / this.core.settings.fps);
					this.keyPressRunning = true;
				}
				
				// Prevent the default behavior of the assigned keys
				this.preventkeypress(e);
			},
			
			// Method for triggering the events when a key is released
			keyup: function (e) {
				this.last_event = e;
				
				// Set the key states
				var keyCode = this.getKeyCode(e);
				if (keyCode === this.lastActiveKeyDown) {
					this.lastActiveKeyDown = false;
				}
				delete this.keysDown[keyCode];
				
				// Trigger event handlers
				this.triggerEvents("keyup", e);
				
				// If there are no more keys pressed down, cancel the keypress timer
				if (!this.anyKeysDown()) {
					clearInterval(this.keyPressTimer);
					this.keyPressRunning = false;
				}
			},
			
			// Method for triggering the events when a key is pressed
			// The keydown method will trigger this method continuously until released
			keypress: function (e) {
				this.last_event = e;
				
				this.triggerEvents("keypress", e);
			},
			
			// Method for preventing the default behavior of the assigned keys
			preventkeypress: function (e) {
				var keyCode, modifiedKeys, code;
				
				if (this.core.mouse && this.core.mouse.canvasFocused === true) {
					keyCode = this.getKeyCode(e);
					modifiedKeys = this.modifiedKeys;
					
					for (code in modifiedKeys) {
						if (keyCode === code && modifiedKeys[code] !== false) {
							e.preventDefault();
						}
					}
				}
			},
			
			ARROW_UP:38, ARROW_DOWN:40, ARROW_LEFT:37, ARROW_RIGHT:39, SPACE:32, ENTER:13, ESC:27
		};
	};
	
	// Register the module
	oCanvas.registerModule("keyboard", keyboard, "init");

})(oCanvas, window, document);