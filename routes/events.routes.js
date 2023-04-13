const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Event = require("../models/Event.model");

router.post("/events", (req, res, next) => {
    const { name, description, localisation, type} = req.body;
    console.log(req)
    Event.create({ name, description, localisation, type})
      .then(event => res.json(event))
      .catch(err => res.json(err));
  });

router.get("/events", (req, res, next) => {
    Event.find()
    .populate('creator')
    .populate('participants')
    .populate('winner')
    .then(allEvents => res.json(allEvents))
    .catch(err => res.json(err));
});

router.get("/events/:eventId", (req, res, next) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
    
    Event.findById(eventId)
    .populate('creator')
    .populate('participants')
    .populate('winner')
    .then(events => res.json(events))
    .catch(err => res.json(err));
});

router.put("/events/:eventId", (req, res, next) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
    
    Event.findByIdAndUpdate(eventId, req.body, { new: true })
    .then(updatedEvent => res.json(updatedEvent))
    .catch(err => res.json(err));
});

router.delete("/events/:eventId", (req, res, next) => {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
    
    Event.findByIdAndRemove(eventId)
    .then(() => res.json({ message: `Project with ${eventId} is removed successfully.` }))
    .catch(err => res.json(err));
});

module.exports = router;