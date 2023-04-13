const { Schema, model } = require("mongoose");

const deckSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    description: {
      type: String,
      required: false,
    },
    user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
    cards: {
				type: [{String, Number}],
        default: null
			},
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Deck = model("Deck", deckSchema);

module.exports = Deck;
