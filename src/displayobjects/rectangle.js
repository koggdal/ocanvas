(function (oCanvas, window, document, undefined) {

	// Define the class
	var rectangle = function (settings, thecore) {

		function normalizeCornerBorderRadius(cornerBorderRadius, generalBorderRadius) {

			if (cornerBorderRadius !== undefined) {
				return cornerBorderRadius;
			}

			if (generalBorderRadius !== undefined) {
				return generalBorderRadius;
			}

			return 0;

		}

		function normalizeBorderRadius(borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius) {

			return {
				topLeft: normalizeCornerBorderRadius(borderTopLeftRadius, borderRadius),
				topRight: normalizeCornerBorderRadius(borderTopRightRadius, borderRadius),
				bottomLeft: normalizeCornerBorderRadius(borderBottomLeftRadius, borderRadius),
				bottomRight: normalizeCornerBorderRadius(borderBottomRightRadius, borderRadius)
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

		function drawBorderRadiusRect(canvas, x, y, width, height, borderRadius) {

			var endX = x + width,
				endY = y + height;

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

		// Return an object when instantiated
		return oCanvas.extend({
			core: thecore,

			shapeType: "rectangular",
			clipChildren: false,

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
					this.borderBottomRightRadius
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
								drawBorderRadiusRect(canvas, x + this.strokeWidth, y + this.strokeWidth, this.width - this.strokeWidth * 2, this.height - this.strokeWidth * 2, addAmountToBorderRadius(borderRadius, -this.strokeWidth));
							} else if (this.strokePosition === 'outside') {
								drawBorderRadiusRect(canvas, x - this.strokeWidth, y - this.strokeWidth, this.width + this.strokeWidth * 2, this.height + this.strokeWidth * 2, addAmountToBorderRadius(borderRadius, this.strokeWidth));
								drawBorderRadiusRect(canvas, x, y, this.width, this.height, borderRadius);
							}

							canvas.closePath();

							canvas.fillStyle = this.strokeColor;
							canvas.fill('evenodd');

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
