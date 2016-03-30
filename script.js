var board_width = 5;
var board = [];
var board_length = board_width * 3;

// Randomized the board, width is adjustable and comets appear at a rate of 20%
function randomizeBoard() {
	// Create board
	for(var i = 0; i < board_length; i++) {
		row = []
		for(var j = 0; j < board_width; j++) {
			row[j] = (Math.random() < 0.18) ? 1 : 0; 
		}
		board[i] = row;
	}

	// Checks to make sure there's no path without comets
	for(var j = 0; j < board_width; j++) {
		var hasComet = false;
		for(var i = 0; i < board_length; i++) {
			if(board[i][j]) {
				hasComet = true;
				break;
			}
		}
		if(!hasComet) { 
			board[Math.floor(Math.random() * board_length)][j] = 1; 
		}
	}
	console.log(board)
}

randomizeBoard();

var cell_width = 100; // pixels
$("#board").height(board_width * cell_width)
			.width(board_width * cell_width);

// Draw the initial board
function drawBoard() {
	for(var i = 0; i < board_width; i++) {
		for(var j = 0; j < board_width; j++) {
			var cell = $("<div id=cell_" + i + "_" + j + "></div>").addClass("gridcell").height(cell_width).width(cell_width)
					.css("left", (j * cell_width) + "px")
					.css("top", (i * cell_width) + "px");
			$("#board").append(cell);
		}
	}
}

// Gives players control of the ship
var ship_location, ship = -1;

function moveShip(offset) {
	for(var i = 0; i < board_width; i++){
		if(!board[offset][i]) { 
			ship_location = i;
			break;
		}
	}
	ship = $("#cell_" + (board_width - 1) + "_" + ship_location);
	ship.prepend('<img src="dinosaur.png" height="' + cell_width + '" width="' + cell_width + '"/>');

	$(document).keydown(function(e){
		if(e.which == 37) { // left arrow 
			ship_location -= 1;
			if(ship_location < 0) ship_location = board_width - 1;
		}
		else if(e.which == 39) { // right arrow
			ship_location += 1;
			ship_location %= board_width;
		}
		ship.empty();
		ship = $("#cell_" + (board_width - 1) + "_" + ship_location);
		ship.prepend('<img src="dinosaur.png" height="' + cell_width + '" width="' + cell_width + '"/>');
	});
}

// Keeping track the amount the player earned
var offset, prev_offset, interval_id, startTime, endTime = -1;
var money = 0.000;

// Animating the board
function startGame() {
	startTime = new Date().getTime();
	prev_offset = Math.floor((startTime/1000.0) % board.length);
	
	// Put ship on the board
	moveShip(prev_offset);
	
	interval_id = setInterval(function() {
		var milliseconds = new Date().getTime();
		offset = Math.floor((milliseconds/1000.0) % board.length);

		for(var i = 0; i < board_width; i++) {
			var row = (i - offset) % board.length;
			if(row < 0) row += board.length;
			
			for(var j = 0; j < board_width; j++) {
				var cell = $("#cell_" + i + "_" + j);
				cell.empty();

				// Recolors the board
				if(board[row][j]) {
					cell.prepend('<img src="comet.png" height="' + cell_width + '" width="' + cell_width + '"/>');
					// Give the player some time to look at the board
					if(milliseconds - startTime < 2000) continue;
					// Checks for collisions
					if(i == board_width - 1 && j == ship_location) {
						endGame(money);
					}
				}
			}
		}
		ship.empty();
		ship.prepend('<img src="dinosaur.png" height="' + cell_width + '" width="' + cell_width + '"/>');

		// Only add money if a second has passed
		if(prev_offset != offset) {
			money += 0.001;
			prev_offset = offset;
			$("#amount").text("$" + money.toFixed(3));
		}

		// End Game if player reaches $2
		if(money.toFixed(3) == 2.0) endGame(money);
	}, 50);
}

// End the Game
function endGame(money) {
	endTime = new Date().getTime();
	clearInterval(interval_id);
	alert("Thank you for playing! The amount you earned was $" + money.toFixed(2));
	$("#game").hide();
	$("#thank_you").show();
	$("#amount_earned").text("You earned $" + money.toFixed(2));

	// Cookie with the current time to watch for cheaters
	$("#cookie").val(endTime);
	$("#time").val((endTime - startTime)/1000.0);
	$("#mturk_form").submit();
}

// Hides the final thank you screen
$("#thank_you").hide();

// Begin Game Listen
$("#begin_game").click(function(){
	drawBoard();
	startGame();
	$(this).hide();
});

$("#quit_game").click(function(){
	endGame(money);
});