const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const { isAuthenticated } = require("./../middleware/jwt.middleware.js");

router.get("/users", (req, res, next) => {
  User.find()
    .populate("decks")
    .populate("events")
    .populate("followers")
    .then((allUsers) => res.json(allUsers))
    .catch((err) => res.json(err));
});

router.get("/users/:userId", (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(userId)
    .populate("decks")
    .populate("events")
    .populate("followers")
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    })
    .catch((err) => res.json(err));
});

router.put("/users/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(userId)
    .populate("user")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (currentUserId.toString() !== user.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this user" });
      }
      user.set(req.body);
      return user.save();
    })
    .then((updatedUser) => {
      return res.json(updatedUser);
    })
    .catch((err) => res.json(err));
});

router.delete("/users/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(userId)
    .then((removedUser) => {
      if (!removedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (String(removedUser.user._id) !== String(currentUserId)) {
        res.status(401).json({ message: "Unauthorized to delete this user." });
        return;
      }
      User.findByIdAndRemove(userId)
        .then(() =>
          res.json({
            message: `The user ${userId} is removed successfully.`,
          })
        )
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

module.exports = router;
