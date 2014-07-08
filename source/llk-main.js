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
		transist		: "left",		// State transition to use
		selected		: "menu"		// The current game state
	},

	game :
	{
		//----------------------------------------------------------------------------//
		// Properties                                                                 //
		//----------------------------------------------------------------------------//

		boardArray		: [],			// Board size in array form (for templates)
		boardSize		: 0,			// Actual size of the board
		difficulty		: "easy",		// Current difficulty setting
		totalTypes		: 8,			// Number of available icons

		currScore		: 0,			// Current user game score
		bestScores :
		{
			"easy"		: 0,			// Best user score on easy
			"medium"	: 0,			// Best user score on medium
			"expert"	: 0				// Best user score on expert
		},

		timeLeft		: 0,			// Time remaining (out of 100)
		timeout			: null,			// Handle to timeLeft interval

		addTimeLeft		: 0,			// Number of available add time's
		getHintLeft		: 0,			// Number of available get hint's
		killPairLeft	: 0,			// Number of available kill pair's

		gameBoard		: null,			// The game board model [y][x]=tile
		selected		: null,			// Currently selected board element

		killPairFlag	: false,		// Flag for enabling pair killing



		//----------------------------------------------------------------------------//
		// Functions                                                                  //
		//----------------------------------------------------------------------------//

		////////////////////////////////////////////////////////////////////////////////
		/// Resets the game and creates a new board using the specified difficulty.

		restart : function (difficulty)
		{
			// Reset game variables
			this.currScore    = 0;
			this.timeLeft     = 100;

			this.addTimeLeft  = 5;
			this.getHintLeft  = 5;
			this.killPairLeft = 5;

			this.killPairFlag = false;

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

			if (this.selected !== null)
			{
				// Unselect previously selected element
				this.selected.removeAttribute ("active");
				this.selected = null;
			}

			// Create board
			this._create();

			// Set the countdown timer
			clearInterval (this.timeout);
			this.timeout = setInterval
				(this._updateTime.bind
				(this), 10 * 120);
		},

		////////////////////////////////////////////////////////////////////////////////
		/// Performs all selection logic on the specified element.

		select : function (element)
		{
			// Determine the target element attributes
			var tx = element.getAttribute ("data-x"   );
			var ty = element.getAttribute ("data-y"   );
			var tt = element.getAttribute ("data-type");
			tx = parseInt (tx);
			ty = parseInt (ty);
			tt = parseInt (tt);

			// Check and ignore if empty area has been selected
			if (tt === 0) element.removeAttribute ("active");

			else
			{
				// Select if not selected
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
						sx = parseInt (sx);
						sy = parseInt (sy);
						st = parseInt (st);

						// Unselect previously selected element
						this.selected.removeAttribute ("active");

						// Check if types match and check path
						if (st !== tt || (!this.killPairFlag &&
							!this._checkPath (sx, sy, tx, ty)))
							this.selected = element;

						else
						{
							if (this.killPairFlag)
							{
								// Reset the kill pair flag
								this.killPairFlag = false;
								--this.killPairLeft;
							}

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
								++this.killPairLeft;
								this.currScore += 25;

								// Create board
								this._create();
							}

							this.currScore += 5;
							// Update the current score and check if new best score
							if (this.bestScores[this.difficulty] < this.currScore)
								this.bestScores[this.difficulty] = this.currScore;
						}
					}
				}
			}
		},

		////////////////////////////////////////////////////////////////////////////////
		/// Add's additional time, includes eligibility checking.

		addTime : function()
		{
			if (this.addTimeLeft &&
				this.timeLeft <= 85)
			{
				this.timeLeft += 15;
				--this.addTimeLeft;
			}
		},

		////////////////////////////////////////////////////////////////////////////////
		/// Gives the user a hint, includes eligibility checking.

		getHint : function()
		{
			// TODO: Not yet implemented

			if (this.getHintLeft)
			{
				--this.getHintLeft;
			}
		},

		////////////////////////////////////////////////////////////////////////////////
		/// Enters killing pair mode, includes eligibility checking.

		killPair : function()
		{
			// Disable kill flag
			if (this.killPairFlag)
				this.killPairFlag = false;

			else if (this.killPairLeft)
			{
				// Enable kill pair flag
				this.killPairFlag = true;
			}
		},

		////////////////////////////////////////////////////////////////////////////////
		/// Performs shutdown on the game when returning to the menu.

		exit : function()
		{
			// Stop the countdown timer
			clearInterval (this.timeout);
		},



		//----------------------------------------------------------------------------//
		// Private                                                                    //
		//----------------------------------------------------------------------------//

		////////////////////////////////////////////////////////////////////////////////

		_updateTime : function()
		{
			// Reduce the time left
			if (--this.timeLeft <= 0)
				clearInterval (this.timeout);
		},

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
		/// Parts adapted from: github.com/wuleying/lianliankan/blob/master/lianliankan.js

		_checkPath : function (sx, sy, tx, ty)
		{
			// FIXME: Doesn't properly handle paths outside the board

			// Check if the target is directly adjacent to the source
			if (sy === ty && (sx-1 === tx || sx+1 === tx)) return true;
			if (sx === tx && (sy-1 === ty || sy+1 === ty)) return true;

			var sPath = new Array(), tPath = new Array();
			// Construct vertical lines for both points
			for (var yy = 0; yy < this.boardSize; ++yy) {
				sPath.push ({ x: sx, y: yy });
				tPath.push ({ x: tx, y: yy });
			}

			// Construct horizontal lines for both points
			for (var xx = 0; xx < this.boardSize; ++xx) {
				sPath.push ({ x: xx, y: sy });
				tPath.push ({ x: xx, y: ty });
			}

			// Iterate through the source paths
			for (var i = 0; i < sPath.length; ++i)
			{
				// Skip if the tile is currently occupied
				if (this.gameBoard[sPath[i].y][sPath[i].x])
					continue;

				// Check if a two-move path is currently possible
				if (!this._checkTwoLine (sPath[i], { x:sx, y:sy }))
					continue;

				// Determine source and target path intersections
				var pos = this._getSamePosition (tPath, sPath[i]);

				// Iterate through the intersections
				for (var j = 0; j < pos.length; ++j)
				{
					// Skip if the tile is currently occupied
					if (this.gameBoard[pos[j].y][pos[j].x])
						continue;

					// Check if a two-move path is currently possible
					if (!this._checkTwoLine (pos[j], { x:tx, y:ty }))
						continue;

					// Check if three-move paths are valid
					if (this._checkTwoLine (sPath[i], pos[j]))
						return true;
				}
			}

			return false;
		},

		////////////////////////////////////////////////////////////////////////////////

		_getSamePosition : function (tPath, pos)
		{
			var paths = new Array ({ x:0, y:0 }, { x:0, y:0 });

			for (var i = 0; i < tPath.length; ++i)
			{
				// Intersect the X-axis
				if (tPath[i].x === pos.x)
					paths[0] = { x:tPath[i].x, y:tPath[i].y };

				// Intersect the Y axis
				if (tPath[i].y === pos.y)
					paths[1] = { x:tPath[i].x, y:tPath[i].y };
			}

			return paths;
		},

		////////////////////////////////////////////////////////////////////////////////

		_checkTwoLine : function (s, t)
		{
			// If same line
			if (s.x === t.x)
			{
				for (var i = s.y; (s.y < t.y ? i < t.y
					: i > t.y); (s.y < t.y ? i++ : i--))
					if (this.gameBoard[i][s.x]) return false;
			}

			else
			{
				for (var i = s.x; (s.x < t.x ? i < t.x
					: i > t.x); (s.x < t.x ? i++ : i--))
					if (this.gameBoard[s.y][i]) return false;
			}

			return true;
		}
	}
});
