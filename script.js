/**
 * @author Csaba Farkas <csaba.farkas@mycit.ie>
 * Date of last modification: 07/04/2016
 */

var CIRCLE_RADIUS = 10;
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 479;
var RECT_HEIGHT = 60;

//Label offsets in different quadrants
var QUARTER_ONE_Y_OFFSET = -75;
var QUARTER_TWO_Y_OFFSET = -75;
var QUARTER_THREE_Y_OFFSET = 15;
var QUARTER_FOUR_Y_OFFSET = 15;

var myCanvas;
var context;
var redCircle;
var circleCollection;
var lineCollection;
var counter;
var lightBoxDiv;
var myTextField;
var coords;
var playBackCounter;
var startButton;
var playButton;
var rectWidth;

var savedCirclesForPlayback;
var savedLinesForPlayback;

window.onload = init;

function init() {
	//Get canvas and context
	myCanvas = document.getElementById('myCanvas');
	context = myCanvas.getContext('2d');

	//Initialize redCircle object
	redCircle = {};
	redCircle.radius = CIRCLE_RADIUS;

	//Initialize counter (number of saved circles)
	counter = 0;

	//Initialize circle collection
	circleCollection = new Array();

	//Initialize lineCollection array
	lineCollection = new Array();

	//Initialize an array which will store circles during playback
	savedCirclesForPlayback = new Array();

	//Initialize an array which will store lines during playback
	savedLinesForPlayback = new Array();

	if(lightBoxDiv === undefined)
	{
		//Add lightBoxDiv
		addLightBox();

		//Initialize myTextField variable
		myTextField = document.getElementById('textField');

		document.getElementById('submitButton').onclick = saveCircle;
		//submitButton.onclick = saveCircle;
	}

	//Initialize playback counter --> numbe of iterations
	playBackCounter = 0;

	//If 'Start Recording' button is clicked, 'mouseMoveFunction' is
	//added to myCanvas as 'mousemove' listener.
	startButton = document.getElementById('startRecordingButton');
	startButton.onclick = reset;

	//If 'Play' is clicked, playback starts
	playButton = document.getElementById('playButton');
	playButton.onclick = playBack;

}

//from quirksmode.org
//returns added offset of all containing elements
function findPos(obj) {

	var curleft = 0;
	var curtop = 0;

	if (obj.offsetParent)
	{
		do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);

		return [curleft,curtop];
	}

}

function getMouseCoords(event)
{

	if (!event)
	{
		var event = window.event;
	}

	var posx = 0;
	var posy = 0;

	if (event.pageX || event.pageY)
	{
		posx = event.pageX;
		posy = event.pageY;
	}
	else if (event.clientX || event.clientY)
	{
		posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}


	// get the offsets of the object that triggered the eventhandler
	var totaloffset = findPos(event.target);

 	var totalXoffset = totaloffset[0];
 	var totalYoffset = totaloffset[1];

 	var canvasX = posx- totalXoffset;
 	var canvasY = posy- totalYoffset;

 	// return coordinates in an array
	return [canvasX, canvasY];

}

function clearEntireCanvas()
{

	context.clearRect(0, 0, myCanvas.width, myCanvas.height);

}

function mouseMoveFunction(eventObject)
{
	//Drag red circle by
	/**
	 * 1. Clear canvas
	 * 2. Get mouse coordinates using the getMouseCoords(event) function
	 * 3. Using the coordinates returned by the function, set the coordinates of the circle
	 * 4. Draw the circle
	 */
	coords = getMouseCoords(eventObject);
	clearEntireCanvas();
	drawSavedLines();
	drawSavedCircles();

	redCircle.X = coords[0];
	redCircle.Y = coords[1];
	drawCircle(redCircle);
}

//Draw red circle if mouse is clicked
function mouseClickFunction(eventObject)
{
	//Get coordinates of click
	coords = getMouseCoords(eventObject);

	//Get lightbox visible
	lightBoxDiv.style.display = "block";
	startRecordingButton.disabled = true;
	playButton.disabled = true;

	//Add focus to myTextField
	myTextField.focus();
}

/*************************************************************************
********************* 				Circles										******************
*************************************************************************/
//Draw circle
/**
 *	@param Circle object
 */
function drawCircle(circle)
{
	context.save();
	context.beginPath();
  context.arc(circle.X, circle.Y, circle.radius, 0, 2.0 * Math.PI);
	context.fillStyle = 'red';
  context.fill();
	context.restore();
}

//Save circle
function saveCircle()
{
	//Create circle object based on the coordinates
	circleCollection[counter] = new Object();
	circleCollection[counter].radius = CIRCLE_RADIUS;
	circleCollection[counter].X = coords[0];
	circleCollection[counter].Y = coords[1];

	//Get value from textField
	circleCollection[counter].circleName = myTextField.value;

	//Save line if there is more than 1 circle on the map
	if(counter > 0)
	{
		saveLines();
	}

	//Increment counter
	counter++;

	//Clear textField and close lightbox
	myTextField.value = "";
	lightBoxDiv.style.display = "none";
	playButton.disabled = false;
	startRecordingButton.disabled = false;
}

//Draw saved circles
function drawSavedCircles()
{

	for(var i = 0; i < circleCollection.length; i++)
	{
		drawCircle(circleCollection[i]);
	}

}

/*********************************************************************************
******************************			Lines					********************************
*********************************************************************************/
//Draw line between two circles
function drawLine(line)
{
	context.beginPath();
	context.moveTo(line.startX, line.startY);
	context.lineTo(line.endX, line.endY);
	context.stroke();
}

//Save line objects based on the current circles
function saveLines()
{
	for(var i = 1; i < circleCollection.length; i++)
	{
		lineCollection[i] = new Object();
		lineCollection[i].startX = circleCollection[i-1].X;
		lineCollection[i].startY = circleCollection[i-1].Y;
		lineCollection[i].endX = circleCollection[i].X;
		lineCollection[i].endY = circleCollection[i].Y;
	}
}

//Draw saved line objects
function drawSavedLines()
{
		for(var i = 1; i < lineCollection.length; i++)
		{
			drawLine(lineCollection[i]);
		}
}

/******************************************************************************************
******************************				LightBox					***********************************
******************************************************************************************/

//Add lightbox
function addLightBox()
{
	lightBoxDiv = document.createElement("div");

	lightBoxDiv.setAttribute("id", "lightBoxDiv");

	// Create a string containing with the html of the new div
	html = "	<div id = \"dialogContainer\">";
	html += "		<form />";
	html += "			<input id=\"textField\" type=\"text\" name=\"markerName\" />"
	html += "			<input id=\"submitButton\" type=\"button\" name=\"submit\" value=\"Save Caption\" />";
	html += "		</form>";
	html+= "	</div>";

	lightBoxDiv.innerHTML = html;

	document.getElementById('canvasContainer').insertBefore(lightBoxDiv, document.getElementById('myCanvas'));

}

//Tester - Delete it before submit
function print() {
	console.log("Circles\n\n");
	for(var i = 0; i < circleCollection.length; i++) {
		circle = circleCollection[i];
		console.log(circle.circleName + "\n" + circle.X + ", " + circle.Y + "\n" + circle.radius + "\n\n");
	}
}

/**********************************************************************************************
******************************			Label next to circle       ********************************
**********************************************************************************************/
//Add label to the html
/**
 *	@param {number} - 	X is the x coordinate of the rectangle
 *	@param {number} - 	Y is the y coordinate of the rectangle
 *	@param {boolean} - 	If true, stroke rectangle. If false, fill rectangle
 *	@param {string} -		The name of the circle
 */
function drawLabel(X, Y, stroke, name)
{
	context.beginPath();
	context.save();

	context.font = "bold 20px Arial";

	//Get the width of the text
	textWidth = context.measureText(name).width;
	rectWidth = textWidth + 20;

	context.moveTo(X + CIRCLE_RADIUS, Y);

	context.arcTo(X + rectWidth, Y, X + rectWidth, Y + CIRCLE_RADIUS, CIRCLE_RADIUS);

	context.arcTo(X + rectWidth, Y + RECT_HEIGHT, X + rectWidth - CIRCLE_RADIUS, Y + RECT_HEIGHT, CIRCLE_RADIUS);

	context.arcTo(X, Y + RECT_HEIGHT, X, Y + RECT_HEIGHT - CIRCLE_RADIUS, CIRCLE_RADIUS);

	context.arcTo(X, Y, X + CIRCLE_RADIUS, Y, CIRCLE_RADIUS);

	if(stroke)
	{
		context.lineWidth = 5;
		context.stroke();

		context.restore();
	}
	else
	{
		context.fillStyle = "#FFFFFF";
		context.fill();

		context.restore();
	}

	context.font = "bold 20px Arial";
	context.fillText(name, X + ((rectWidth - textWidth) / 2), Y + 35);

}

//Tester - Delete it before submit
function print() {
	console.log("Circles\n\n");
	for(var i = 0; i < circleCollection.length; i++) {
		circle = circleCollection[i];
		console.log(circle.circleName + "\n" + circle.X + ", " + circle.Y + "\n" + circle.radius + "\n\n");
	}
}


/**********************************************************************************************
******************************			playback							*************************************
**********************************************************************************************/
function playBack()
{
	savedCirclesForPlayback = new Array();
	savedLinesForPlayback = new Array();

	if(circleCollection.length > 0)
	{
		startButton.disabled = true;

		startButton.onclik = reset;

		//Disable Recording
		myCanvas.removeEventListener('mousemove', mouseMoveFunction);
		myCanvas.removeEventListener('click', mouseClickFunction);

		//Clear canvas
		clearEntireCanvas();

		//Start playback
		play();

		//Reinitialize playback counter
		playBackCounter = 0;
	}
	else
	{
		alert("You need to record before playback.");
	}
}

//Timeout function firing a drawPlayBack() call and a recursive play() call at every 2 seconds
function play()
{
	setTimeout(function()
	{
		drawPlayBack();
		playBackCounter++;
		if(playBackCounter < circleCollection.length)
		{
			play();
		}
		else
		{
			setTimeout(function()
			{
				clearEntireCanvas();
				redrawPreviousObjects();
				startButton.disabled = false;
			}, 2000);
		}
	}, 2000);

}

//Draws the elements to the canvas. It draws the lines before the
//circles so the line won't overlap the circles.
function drawPlayBack()
{
	var currentCircle = circleCollection[playBackCounter];
	var previousCircle = circleCollection[playBackCounter-1];
	var currentLine = lineCollection[playBackCounter];

	if(playBackCounter == 0)
	{
		drawCircle(currentCircle);

		//save first circle
		savedCirclesForPlayback[0] = currentCircle;
	}
	else
	{
		clearEntireCanvas();
		redrawPreviousObjects();
		drawLine(currentLine);
		drawCircle(previousCircle);
		drawCircle(currentCircle);

		//save new line and circle
		savedCirclesForPlayback[playBackCounter] = currentCircle;
		savedLinesForPlayback[playBackCounter] = currentLine;
	}

	var lCoords = labelCoords(currentCircle.X, currentCircle.Y, currentCircle.circleName);

	drawLabel(lCoords[0], lCoords[1], true, currentCircle.circleName);
	drawLabel(lCoords[0], lCoords[1], false, currentCircle.circleName);

}

function redrawPreviousObjects()
{
	//Draw lines
	for(var i = 1; i < savedLinesForPlayback.length; i++)
	{
		drawLine(savedLinesForPlayback[i]);
	}

	//Draw circles
	for(var j = 0; j < savedCirclesForPlayback.length; j++)
	{
		drawCircle(savedCirclesForPlayback[j]);
	}
}

//Get the coordinates of the label
function labelCoords(X, Y, name)
{
	context.save();

	context.font = "bold 20px Arial";

	//Calculate text width
	var textWidth = context.measureText(name).width;

	context.restore();

	//Add 20 for the padding +
	//20 for the radius of the corners +
	labelWidth = textWidth + 20;


	//Calculate the area of each quarter
	var areaQ1 = X * Y;
	var areaQ2 = (CANVAS_WIDTH - X) * Y;
	var areaQ3 = (CANVAS_WIDTH - X) * (CANVAS_HEIGHT - Y);
	var areaQ4 = (X * (CANVAS_HEIGHT - Y));

	//Put them in an array
	var areaArray = [areaQ1, areaQ2, areaQ3, areaQ4];

	//get the largest value
	var largestArea = Math.max.apply(Math, areaArray);

	//Return the coordinates of the label, which is going to be
	//placed into the largest quarter are, which is created by
	//the intersection of x and y lines going through the center-point
	//of the circle
	switch(largestArea)
	{
		case areaQ1:
		return [
			X - (labelWidth + 15),
			Y + QUARTER_ONE_Y_OFFSET
		];
		break;
		case areaQ2:
		return [
			X + 15,
			Y + QUARTER_TWO_Y_OFFSET
		];
		break;
		case areaQ3:
		return [
			X + 15,
			Y + QUARTER_THREE_Y_OFFSET
		];
		break;
		default:
		return [
			X - (labelWidth + 15),
			Y + QUARTER_FOUR_Y_OFFSET
		];
	}
}

/************************************************************************************
****************** Reset - Start recording button listener	*************************
************************************************************************************/
function reset()
{
	clearEntireCanvas();
	init();
	myCanvas.addEventListener('mousemove', mouseMoveFunction);
	myCanvas.addEventListener('click', mouseClickFunction);
}
