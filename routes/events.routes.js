const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Event = require("../models/Event.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/events", isAuthenticated, (req, res, next) => {
  const { name, description, position, type } = req.body;
  const userId = req.payload._id;
  let eventResponse;

  Event.create({ name, description, position, type, creator: userId })
    .then((event) => {
      eventResponse = event;
      User.findByIdAndUpdate(
        userId,
        { $push: { events: event._id } },
        { new: true }
      )
        .then(() => res.json({ eventResponse }))
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

router.get("/events", (req, res, next) => {
  Event.find()
    .populate("creator")
    .populate("participants")
    .populate("winner")
    .then((allEvents) => res.json(allEvents))
    .catch((err) => res.json(err));
});

router.get("/events/:eventId", (req, res, next) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Event.findById(eventId)
    .populate("creator")
    .populate("participants")
    .populate("winner")
    .then((events) => {
      if (!events) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      res.json(events);
    })
    .catch((err) => res.json(err));
});

router.put("/events/:eventId", isAuthenticated, (req, res, next) => {
  const { eventId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Event.findById(eventId)
    .populate("user")
    .then((event) => {
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (currentUserId.toString() !== event.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this event" });
      }
      event.set(req.body);
      return event.save();
    })
    .then((updatedEvent) => {
      return res.json(updatedEvent);
    })
    .catch((err) => res.json(err));
});

router.delete("/events/:eventId", isAuthenticated, (req, res, next) => {
  const { eventId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Event.findById(eventId)
    .then((removedEvent) => {
      if (!removedEvent) {
        res.status(404).json({ message: "Event not found" });
        return;
      }
      if (String(removedEvent.user._id) !== String(currentUserId)) {
        res.status(401).json({ message: "Unauthorized to delete this event." });
        return;
      }
      Event.findByIdAndRemove(eventId)
        .then(() =>
          res.json({
            message: `Event ${eventId} is removed successfully.`,
          })
        )
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

module.exports = router;
