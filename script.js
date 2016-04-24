var board = [[0,0,0,1,0],
		   	[0,0,0,0,1],
	 	   	[0,0,0,0,0],
	 	   	[0,0,0,0,0],
		   	[1,1,1,0,0],
		   	[0,0,0,0,0],
		   	[0,0,0,0,0]];

var board_width = board[0].length;

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

function createShip(offset) {
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
var offset, prev_offset, interval_id, startTime, endTime = 0;
var money = 0.000;

var is_active = false;

// Animating the board
function startGame() {
	startTime = new Date().getTime();
	prev_offset = Math.floor((startTime/1000.0) % board.length);
	is_active = true;
	
	// Create ship on the board
	createShip(prev_offset);
	
	checkCollide(); 

	// start animating the board
	var data = {"localship" : ship_location, "active" : is_active, "mediator" : "average"};
	var key = "bulbasaur";
	updateBoard(key, data);
}

// Updates the board with every server call
function updateBoard(key, data) {
	
	$.ajax({
		url: "http://codingthecrowd.com/counter.php", 
		dataType: "jsonp",
		data: {
			key: key,
			data: JSON.stringify(data)
		},
  		success: function(response) {
  			
  			var results = response["results"];
			
			if(offset != Math.floor(response["time"] % board.length)) {
				offset = Math.floor(response["time"] % board.length);
				
				for(var i = 0; i < board_width; i++) {
					var row = (i - offset) % board.length;
					if(row < 0) row += board.length;
					
					for(var j = 0; j < board_width; j++) {
						var cell = $("#cell_" + i + "_" + j);
						cell.empty();

						// Recolors the board
						if(board[row][j]) {
							cell.prepend('<img src="comet.png" height="' + cell_width + '" width="' + cell_width + '"/>');
						}
					}
				}
				ship.empty();
				ship.prepend('<img src="dinosaur.png" height="' + cell_width + '" width="' + cell_width + '"/>');
			}

			var all_active = is_active;

			for(var i = 0; i < results.length; i++) {
				all_active = JSON.parse(results[i]["data"]).active && is_active; 
			}
			
			if(all_active) {
				var data = {"localship" : ship_location, "active" : is_active, "mediator" : "average"};
				updateBoard(key, data);
			}
			else {
				is_active = false;
				endGame();
			}
		}
	});
}

function checkCollide() {
	interval_id = setInterval(function(){
		
		// End Game if ship collised with dinosaur
		var bottom_row = (offset + 4) % board.length;
		
		if(board[bottom_row][ship_location]) {
			endGame(money);
		}

		// End Game if player reaches $2
		money += 0.001;
		$("#amount").text("$" + money.toFixed(3));
		if(money >= 2.0) endGame(money);
		
	} ,1000);
}

function endGame(money) {
	clearInterval(interval_id);
	is_active = false;

	endTime = new Date().getTime();
	$("#game").hide();
	$("#thank_you").show();
	$("#amount_earned").text("You earned $" + money.toFixed(2));

	alert("Thank you for playing! The amount you earned was $" + money.toFixed(2));

	// Cookie with the current time to watch for cheaters
	$("#cookie").val(endTime);
	$("#time").val((endTime - startTime)/1000.0);

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