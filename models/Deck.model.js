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
      ref: "User",
      // required: true,
    },
    cards: [
      {
        cardKey: String,
        numberOfCard: Number,
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Deck = model("Deck", deckSchema);

module.exports = Deck;
