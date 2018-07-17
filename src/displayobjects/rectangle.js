(function (oCanvas, window, document, undefined) {

	// Define the class
	var rectangle = function (settings, thecore) {

		function checkBounds(borderRadiusValue, maxValue) {
			return Math.max(Math.min(borderRadiusValue, maxValue), 0);
		}

		function normalizeCornerBorderRadius(cornerBorderRadius, generalBorderRadius, maxValue) {

			if (cornerBorderRadius !== undefined) {
				return checkBounds(cornerBorderRadius, maxValue);
			}

			if (generalBorderRadius !== undefined) {
				return checkBounds(generalBorderRadius, maxValue);
			}

			return 0;

		}

		function normalizeBorderRadius(borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius, maxValue) {

			return {
				topLeft: normalizeCornerBorderRadius(borderTopLeftRadius, borderRadius, maxValue),
				topRight: normalizeCornerBorderRadius(borderTopRightRadius, borderRadius, maxValue),
				bottomLeft: normalizeCornerBorderRadius(borderBottomLeftRadius, borderRadius, maxValue),
				bottomRight: normalizeCornerBorderRadius(borderBottomRightRadius, borderRadius, maxValue)
			};

		}

		function addAmountToBorderRadius(borderRadius, amount) {
			if (amount > 0) {
				return {
					// When there is no borderRadius (=== 0), keep it as 0
					topLeft: borderRadius.topLeft === 0 ? 0 : borderRadius.topLeft + amount,
					topRight: borderRadius.topRight === 0 ? 0 : borderRadius.topRight + amount,
					bottomLeft: borderRadius.bottomLeft === 0 ? 0 : borderRadius.bottomLeft + amount,
					bottomRight: borderRadius.bottomRight === 0 ? 0 : borderRadius.bottomRight + amount
				};
			} else if (amount < 0) {
				return {
					// Never least than 0
					topLeft: Math.max(borderRadius.topLeft + amount, 0),
					topRight: Math.max(borderRadius.topRight + amount, 0),
					bottomLeft: Math.max(borderRadius.bottomLeft + amount, 0),
					bottomRight: Math.max(borderRadius.bottomRight + amount, 0)
				};
			} else {
				return borderRadius;
			}
		}

		function hasBorderRadius(borderRadius) {
			return borderRadius.topLeft > 0
				|| borderRadius.topRight > 0
				|| borderRadius.bottomLeft > 0
				|| borderRadius.bottomRight > 0;
		}

		function drawBorderRadiusRect(canvas, x, y, width, height, borderRadius, counterclockwise) {

			var endX = x + width,
				endY = y + height;

			if (counterclockwise) {

				canvas.moveTo(endX - borderRadius.topRight, y);

				// top line and top-left border
				canvas.arcTo(x, y, x, y + borderRadius.topLeft, borderRadius.topLeft);

				// left line and bottom-left border
				canvas.arcTo(x, endY, x + borderRadius.bottomLeft, endY, borderRadius.bottomLeft);

				// bottom line and bottom-right border
				canvas.arcTo(endX, endY, endX, endY - borderRadius.bottomRight, borderRadius.bottomRight);

				// right line and top-right border
				canvas.arcTo(endX, y, endX - borderRadius.topRight, y, borderRadius.topRight);

			} else {

				canvas.moveTo(x + borderRadius.topLeft, y);

				// top line and top-right border
				canvas.arcTo(endX, y, endX, y + borderRadius.topRight, borderRadius.topRight);

				// right line and bottom-right border
				canvas.arcTo(endX, endY, endX - borderRadius.bottomRight, endY, borderRadius.bottomRight);

				// bottom line and bottom-left border
				canvas.arcTo(x, endY, x, endY - borderRadius.bottomLeft, borderRadius.bottomLeft);

				// left line and top-left border
				canvas.arcTo(x, y, x + borderRadius.topLeft, y, borderRadius.topLeft);

			}

		}

		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,

			shapeType: "rectangular",
			clipChildren: false,

			_: oCanvas.extend({}, thecore.displayObject._, {
				borderTopLeftRadius: 0,
				borderTopRightRadius: 0,
				borderBottomRightRadius: 0,
				borderBottomLeftRadius: 0,
				borderRadius: 0,
			}),

			set borderTopLeftRadius (value) {
				this._.borderTopLeftRadius = parseFloat(value, 10);
			},

			get borderTopLeftRadius () {
				return this._.borderTopLeftRadius;
			},

			set borderTopRightRadius (value) {
				this._.borderTopRightRadius = parseFloat(value, 10);
			},

			get borderTopRightRadius () {
				return this._.borderTopRightRadius;
			},

			set borderBottomRightRadius (value) {
				this._.borderBottomRightRadius = parseFloat(value, 10);
			},

			get borderBottomRightRadius () {
				return this._.borderBottomRightRadius;
			},

			set borderBottomLeftRadius (value) {
				this._.borderBottomLeftRadius = parseFloat(value, 10);
			},

			get borderBottomLeftRadius () {
				return this._.borderBottomLeftRadius;
			},

			set borderRadius (value) {
				var floatValue = parseFloat(value, 10);
				this._.borderRadius = floatValue;
				this._.borderTopLeftRadius = floatValue;
				this._.borderTopRightRadius = floatValue;
				this._.borderBottomRightRadius = floatValue;
				this._.borderBottomLeftRadius = floatValue;
			},

			get borderRadius () {
				var a = this._.borderTopLeftRadius;
				var b = this._.borderTopRightRadius;
				var c = this._.borderBottomRightRadius;
				var d = this._.borderBottomLeftRadius;
				if (a === b && b === c && c === d) {
					this._.borderRadius = a;
				}
				return this._.borderRadius;
			},

			draw: function () {
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y;

				var borderRadius = normalizeBorderRadius(
					this.borderRadius,
					this.borderTopLeftRadius,
					this.borderTopRightRadius,
					this.borderBottomLeftRadius,
					this.borderBottomRightRadius,
					Math.min(this.width, this.height) / 2
				);

				if (!hasBorderRadius(borderRadius)) {

					canvas.beginPath();
					canvas.rect(x, y, this.width, this.height);
					canvas.closePath();

					// Do fill if a color is specified
					if (this.fill !== "") {
						canvas.fillStyle = this.fill;
						canvas.fill();
					}

					// Do color if stroke width is specified
					if (this.strokeWidth > 0) {

						// Set styles
						canvas.lineWidth = this.strokeWidth;
						canvas.strokeStyle = this.strokeColor;

						// Set stroke outside the box
						if (this.strokePosition === "outside") {
							canvas.strokeRect(x - this.strokeWidth / 2, y - this.strokeWidth / 2, this.width + this.strokeWidth, this.height + this.strokeWidth);
						}

						// Set stroke on the edge of the box (half of the stroke outside, half inside)
						else if (this.strokePosition === "center") {
							canvas.strokeRect(x, y, this.width, this.height);
						}

						// Set stroke on the inside of the box
						else if (this.strokePosition === "inside") {
							canvas.strokeRect(x + this.strokeWidth / 2, y + this.strokeWidth / 2, this.width - this.strokeWidth, this.height - this.strokeWidth);
						}

					}

					// Do clip
					if (this.clipChildren) {
						canvas.clip();
					}

				} else {

					canvas.beginPath();
					drawBorderRadiusRect(canvas, x, y, this.width, this.height, borderRadius);
					canvas.closePath();

					// Do fill if a color is specified
					if (this.fill !== "") {
						canvas.fillStyle = this.fill;
						canvas.fill();
					}

					var strokeSimulatedUsingPath = false;

					// Do color if stroke width is specified
					if (this.strokeWidth > 0) {

						if (this.strokePosition === 'center') {

							// Set styles
							canvas.lineWidth = this.strokeWidth;
							canvas.strokeStyle = this.strokeColor;

							canvas.stroke();

						} else {

							// Simulate stroke using a path

							canvas.beginPath();

							if (this.strokePosition === 'inside') {
								drawBorderRadiusRect(canvas, x, y, this.width, this.height, borderRadius);
								drawBorderRadiusRect(canvas, x + this.strokeWidth, y + this.strokeWidth, this.width - this.strokeWidth * 2, this.height - this.strokeWidth * 2, addAmountToBorderRadius(borderRadius, -this.strokeWidth), true);
							} else if (this.strokePosition === 'outside') {
								drawBorderRadiusRect(canvas, x - this.strokeWidth, y - this.strokeWidth, this.width + this.strokeWidth * 2, this.height + this.strokeWidth * 2, addAmountToBorderRadius(borderRadius, this.strokeWidth), true);
								drawBorderRadiusRect(canvas, x, y, this.width, this.height, borderRadius);
							}

							canvas.closePath();

							canvas.fillStyle = this.strokeColor;
							canvas.fill();

							strokeSimulatedUsingPath = true;

						}

					}

					// Do clip
					if (this.clipChildren) {

						if (strokeSimulatedUsingPath) {
							// If a stroke was drawn using a path, we have to draw another path
							// with the same size as the fill path in order to clip children
							canvas.beginPath();
							drawBorderRadiusRect(canvas, x, y, this.width, this.height, borderRadius);
							canvas.closePath();
						}

						canvas.clip();

					}

				}

				return this;
			}

		}, settings);
	};

	// Register the display object
	oCanvas.registerDisplayObject("rectangle", rectangle);

})(oCanvas, window, document);