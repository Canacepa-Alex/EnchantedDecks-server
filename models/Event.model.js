const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    localisation: {
      type: String,
    },
    date:{
      type: Date,
      required: [true, "Location is required."],
    },
    type: {},
    creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			// required: true,
		},
    participants: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
    winner: {
      type: Schema.Types.ObjectId,
			ref: 'User',
    },
    deck: [
      {
        cardKey: String,
        numberOfCard: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
