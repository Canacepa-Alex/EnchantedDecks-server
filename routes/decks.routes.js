const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Deck = require("../models/Deck.model");

router.post("/decks", (req, res, next) => {
    const { name, description } = req.body;
    console.log(req)
    Deck.create({ name, description, user})
      .then(deck => res.json(deck))
      .catch(err => res.json(err));
  });

router.get("/decks", (req, res, next) => {
    Deck.find()
    .populate('user')
    .populate('followers')
    .then(allDecks => res.json(allDecks))
    .catch(err => res.json(err));
});

router.get("/decks/:deckId", (req, res, next) => {
    const { deckId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deckId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
    
    Deck.findById(deckId)
    .populate('user')
    .populate('followers')
    .then(decks => res.json(decks))
    .catch(err => res.json(err));
});

router.put("/decks/:deckId", (req, res, next) => {
    const { deckId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deckId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
    
    Deck.findByIdAndUpdate(deckId, req.body, { new: true })
    .then(updatedDeck => res.json(updatedDeck))
    .catch(err => res.json(err));
});

router.delete("/decks/:deckId", (req, res, next) => {
    const { deckId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(deckId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
      }
    
    Deck.findByIdAndRemove(deckId)
    .then(() => res.json({ message: `Project with ${deckId} is removed successfully.` }))
    .catch(err => res.json(err));
});

module.exports = router;
