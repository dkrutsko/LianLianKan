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

		boardSize		: [],
		difficulty		: "easy",

		currScore		: 0,
		bestScore :
		{
			"easy"		: 0,
			"medium"	: 0,
			"expert"	: 0
		},

		timeLeft		: 0,
		addTimeLeft		: 0,
		getHintLeft		: 0,

		gameBoard		: [],



		//----------------------------------------------------------------------------//
		// Functions                                                                  //
		//----------------------------------------------------------------------------//

		////////////////////////////////////////////////////////////////////////////////

		restart : function (difficulty)
		{
			// Check for optional difficulty argument, use current if undefined
			if (typeof difficulty !== "undefined") this.difficulty = difficulty;

			var size = 6;
			// Determine game board size using difficulty
			if (this.difficulty === "medium") size =  8;
			if (this.difficulty === "expert") size = 12;

			this.boardSize = [];
			// Convert into numbers array
			for (var i = 0; i < size; ++i)
				this.boardSize.push (i);

			// Reset game variables
			this.currScore   = 0;
			this.timeLeft    = 100;
			this.addTimeLeft = 5;
			this.getHintLeft = 5;

			// Reset game board
			this.gameBoard = [];

			// TODO: Create level
		},

		////////////////////////////////////////////////////////////////////////////////

		addTime : function()
		{
			// TODO: Add time
		},

		////////////////////////////////////////////////////////////////////////////////

		getHint : function()
		{
			// TODO: Get hint
		}
	}
});
