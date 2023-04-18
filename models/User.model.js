const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    name: {
      type: String,
      unique: true,
      required: [true, "Name is required."],
    },
    imageURL: {
      type: String,
      default : ""
    },
    decks: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Deck',
			},
		],
    events: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Event',
			},
		],
    followers: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
    following: [
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

const User = model("User", userSchema);

module.exports = User;
