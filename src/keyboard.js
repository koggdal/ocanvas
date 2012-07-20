(function(oCanvas, window, document, undefined){

	// Define the class
	var keyboard = function () {
		
		// Return an object when instantiated
		return {
			
			keysDown: {},
			keyPressTimers: {},
			modifiedKeys: [],
			
			// Method for initializing the keyboard object
			init: function () {
				var self = this;

				oCanvas.addDOMEventHandler(this.core, document, "keydown", function (e) { self.docHandler(e); }, false);
				oCanvas.addDOMEventHandler(this.core, document, "keyup", function (e) { self.docHandler(e); }, false);
				oCanvas.addDOMEventHandler(this.core, document, "keypress", function (e) { self.preventDefault(e); }, false);
			},

			docHandler: function (e) {
				var keyCode, events, canvasElement, eventObject;
				events = this.core.events;
				canvasElement = this.core.canvasElement;

				// Abort if events are disabled
				if (!events.enabled) {
					return;
				}

				// Only trigger events if the pointer has set focus to the canvas
				//  or if there are no pointers registered
				if (this.core.pointer && this.core.pointer.canvasFocused !== true) {
					return;
				}

				keyCode = this.getKeyCode(e);

				// Prevent default for keys that have been added to the prevent list
				this.preventDefault(e);
			
				// Cancel event if the key is already pressed down
				// (some browsers repeat even keydown when held down)
				if (e.type === "keydown" && this.keysDown[keyCode] === true) {
					return;
				}

				// Set the key states when pressed down
				if (e.type === "keydown") {
					this.keysDown[keyCode] = true;
				} else if (e.type === "keyup") {
					delete this.keysDown[keyCode];
				}

				// Get a fixed event object
				eventObject = events.fixEventObject(e, "keyboard");
				events.lastKeyboardEventObject = eventObject;

				// Trigger events
				events.triggerHandlers(canvasElement, [e.type]);

				// Set the timer to trigger keypress events continuously until released
				if (e.type === "keydown") {
					this.keyPressTimers[keyCode] = setInterval(function () {
						events.triggerHandlers(canvasElement, ["keypress"], eventObject);
					}, 1000 / this.core.settings.fps);
				}

				// If there are no more keys pressed down, cancel the keypress timers
				if (e.type === "keyup") {
					if (!this.anyKeysDown()) {
						for (keyCode in this.keyPressTimers) {
							clearInterval(this.keyPressTimers[keyCode]);
						}
					} else {
						clearInterval(this.keyPressTimers[keyCode]);
					}
				}
			},
			
			// Method for preventing the default behavior of the assigned keys
			preventDefault: function (e) {
				if ((this.core.mouse && this.core.mouse.canvasFocused === true) || !this.core.mouse) {
					var keyCode = this.getKeyCode(e);

					if (~this.modifiedKeys.indexOf(keyCode)) {
						e.preventDefault();
					}
				}
			},
			
			// Method for adding keys that will have the default actions prevented
			addPreventDefaultFor: function (keys) {
				
				// Fix the keys array
				keys = (typeof keys === "number") ? [keys] : ((keys instanceof Array) ? keys : []);
				
				// Add the keys
				for (var i = 0; i < keys.length; i++) {
					this.modifiedKeys.push(keys[i]);
				}
			},
			
			// Method for removing keys that will no longer have the default actions prevented
			removePreventDefaultFor: function (keys) {
				
				// Fix the keys array
				keys = (typeof keys === "number") ? [keys] : ((keys instanceof Array) ? keys : []);
				
				// Remove the keys
				var i, index;
				for (i = 0; i < keys.length; i++) {
					index = this.modifiedKeys.indexOf(keys[i]);
					if (~index) {
						this.modifiedKeys.splice(index, 1);
					}
				}
			},
			
			// Method for getting the key code from current event
			getKeyCode: function (e) {
				return e.keyCode === 0 ? e.which : e.keyCode;
			},

			// Method for getting how many keys are currently pressed down
			numKeysDown: function () {
				var numKeys, keysDown, keyCode;
				numKeys = 0;
				keysDown = this.keysDown;

				// Go through all the keys that are currently pressed down
				for (keyCode in keysDown) {
					if (keysDown[keyCode] === true) {
						numKeys++;
					}
				}

				return numKeys;
			},

			// Method for checking if any keys are pressed down
			anyKeysDown: function () {
				return this.numKeysDown() > 0;
			},

			// Method for getting which keys are currently pressed down
			getKeysDown: function () {
				var keysDown, currentlyDown, keyCode;
				keysDown = this.keysDown;
				currentlyDown = [];

				// Go through all the keys that are currently pressed down
				for (keyCode in keysDown) {
					if (keysDown[keyCode] === true) {
						currentlyDown.push(parseInt(keyCode, 10));
					}
				}

				return currentlyDown;
			},
			
			ARROW_UP:38, ARROW_DOWN:40, ARROW_LEFT:37, ARROW_RIGHT:39, SPACE:32, ENTER:13, ESC:27
		};
	};
	
	// Register the module
	oCanvas.registerModule("keyboard", keyboard, "init");

})(oCanvas, window, document);