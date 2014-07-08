////////////////////////////////////////////////////////////////////////////////
// -------------------------------------------------------------------------- //
//                                                                            //
//                        (C) 2014-2014  David Krutsko                        //
//                        See LICENSE.md for copyright                        //
//                                                                            //
// -------------------------------------------------------------------------- //
////////////////////////////////////////////////////////////////////////////////

"use strict";

//----------------------------------------------------------------------------//
// Polymer                                                                    //
//----------------------------------------------------------------------------//

Polymer ("llk-main",
{
	menu :
	{
		transist		: "left",
		selected		: "menu"
	},

	game :
	{
		//----------------------------------------------------------------------------//
		// Properties                                                                 //
		//----------------------------------------------------------------------------//

		boardArray		: [],
		boardSize		: 0,
		difficulty		: "easy",
		totalTypes		: 8,

		currScore		: 0,
		bestScores :
		{
			"easy"		: 0,
			"medium"	: 0,
			"expert"	: 0
		},

		timeLeft		: 0,
		timeout			: null,

		addTimeLeft		: 0,
		getHintLeft		: 0,
		killTileLeft	: 0,

		gameBoard		: null,		// [y][x]
		selected		: null,



		//----------------------------------------------------------------------------//
		// Functions                                                                  //
		//----------------------------------------------------------------------------//

		////////////////////////////////////////////////////////////////////////////////

		restart : function (difficulty)
		{
			// Reset game variables
			this.currScore    = 0;
			this.timeLeft     = 100;
			this.addTimeLeft  = 5;
			this.getHintLeft  = 5;
			this.killTileLeft = 5;

			// Check for the difficulty argument
			if (typeof difficulty !== "undefined")
				this.difficulty = difficulty;

			this.boardSize = 6;
			// Determine the game board size based on difficulty
			if (this.difficulty === "medium") this.boardSize =  8;
			if (this.difficulty === "expert") this.boardSize = 12;

			this.boardArray = [];
			// Convert board size into numbers array
			for (var i = 0; i < this.boardSize; ++i)
				this.boardArray.push (i);

			// Create board
			this._create();

			// Set the countdown timer
			clearInterval (this.timeout);
			this.timeout = setInterval
				(this._updateTime.bind
				(this), 10 * 120);
		},

		////////////////////////////////////////////////////////////////////////////////

		select : function (element)
		{
			// Determine the target element attributes
			var tx = element.getAttribute ("data-x"   );
			var ty = element.getAttribute ("data-y"   );
			var tt = element.getAttribute ("data-type");

			// Check and ignore if empty area has been selected
			if (tt === "0") element.removeAttribute ("active");

			else
			{
				// Select if non selected
				if (this.selected === null)
					this.selected = element;

				else
				{
					// Deselect if same selected
					if (this.selected === element)
						this.selected = null;

					else
					{
						// Determine the selected element attributes
						var sx = this.selected.getAttribute ("data-x"   );
						var sy = this.selected.getAttribute ("data-y"   );
						var st = this.selected.getAttribute ("data-type");

						// Unselect previously selected element
						this.selected.removeAttribute ("active");

						// Check whether types match then check the path
						if (st !== tt || !this._checkPath (sx, sy, tx, ty))
							this.selected = element;

						else
						{
							// Deselect the selected element
							element.removeAttribute ("active");

							this.selected = null;
							// Remove from game board
							this.gameBoard[sy][sx] = 0;
							this.gameBoard[ty][tx] = 0;

							var gameWon = true;
							// Check the board for a possible win
							for (var y = 0; y < this.boardSize; ++y)
							for (var x = 0; x < this.boardSize; ++x)
							{
								if (this.gameBoard[y][x] !== 0)
								{
									x = this.boardSize;
									y = this.boardSize;
									gameWon = false;
								}
							}

							if (gameWon)
							{
								// Reset variables
								++this.addTimeLeft;
								++this.getHintLeft;
								++this.killTileLeft;
								this.currScore += 40;

								// Create board
								this._create();
							}

							this.currScore += 10;
							// Update the current score and check if new best score
							if (this.bestScores[this.difficulty] < this.currScore)
								this.bestScores[this.difficulty] = this.currScore;
						}
					}
				}
			}
		},

		////////////////////////////////////////////////////////////////////////////////

		addTime : function()
		{
			if (this.addTimeLeft &&
				this.timeLeft <= 85)
			{
				--this.addTimeLeft;
				this.timeLeft += 15;
			}
		},

		////////////////////////////////////////////////////////////////////////////////

		getHint : function()
		{
			if (this.getHintLeft)
			{
				--this.getHintLeft;
				// TODO:
			}
		},

		////////////////////////////////////////////////////////////////////////////////

		killTile : function()
		{
			if (this.killTileLeft)
			{
				--this.killTileLeft;
				// TODO:
			}
		},

		////////////////////////////////////////////////////////////////////////////////

		exit : function()
		{
			// Stop the countdown timer
			clearInterval (this.timeout);
		},



		//----------------------------------------------------------------------------//
		// Private                                                                    //
		//----------------------------------------------------------------------------//

		////////////////////////////////////////////////////////////////////////////////

		_create : function()
		{
			// Initialize the game board
			var size  = this.boardSize;
			var board = new Array (size);

			var s = size*size;
			var monitor = { };
			// Populate board pseudo-randomly
			for (var y = 0; y < size; ++y)
			{
				board[y] = new Array (size);
				for (var x = 0; x < size; ++x)
				{
					var tile = 0;
					// Perform pairing checks
					if (--s <= this.totalTypes)
					{
						// Check for any possible unpaired tiles
						for (var i = 1; i <= this.totalTypes; ++i)
							if (monitor[i]) { tile = i; break; }
					}

					if (tile === 0)
						// Select pseudo-random tile, if non previously selected
						tile = Math.floor (Math.random() * this.totalTypes) + 1;

					// Negate tile monitor pairings
					monitor[tile] = !monitor[tile];
					board[y][x] = tile;
				}
			}

			// Save new game board
			this.gameBoard = board;
		},

		////////////////////////////////////////////////////////////////////////////////

		_checkPath : function (sx, sy, tx, ty)
		{
			return true; // TODO:
		},

		////////////////////////////////////////////////////////////////////////////////

		_updateTime : function()
		{
			// Reduce the time left
			if (--this.timeLeft <= 0)
			{
				clearInterval (this.timeout);
				// TODO: game lost
			}
		}
	}
});
