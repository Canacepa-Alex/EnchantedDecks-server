const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Deck = require("../models/Deck.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

router.post("/decks", isAuthenticated, (req, res, next) => {
  const { name, description } = req.body;
  const userId = req.payload._id;

  Deck.create({ name, description, user: userId })
    .then((deck) => {
      User.findByIdAndUpdate(
        userId,
        { $push: { decks: deck._id } },
        { new: true }
      )
        .then((updatedUser) => res.json({ deck, user: updatedUser }))
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

router.get("/decks", (req, res, next) => {
  Deck.find()
    .populate("user")
    .populate("followers")
    .then((allDecks) => res.json(allDecks))
    .catch((err) => res.json(err));
});

router.get("/decks/:deckId", (req, res, next) => {
  const { deckId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Deck.findById(deckId)
    .populate("user")
    .populate("followers")
    .then((decks) => {
      if (!decks) {
        res.status(404).json({ message: "Deck not found" });
        return;
      }
      res.json(decks);
    })
    .catch((err) => res.json(err));
});

router.put("/decks/:deckId", isAuthenticated, (req, res, next) => {
  const { deckId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Deck.findById(deckId)
    .populate("user")
    .then((deck) => {
      if (!deck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      if (currentUserId.toString() !== deck.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this deck" });
      }
      deck.set(req.body);
      return deck.save();
    })
    .then((updatedDeck) => {
      return res.json(updatedDeck);
    })
    .catch((err) => res.json(err));
});

router.put("/decks/:deckId/addCard", isAuthenticated, (req, res, next) => {
  const { deckId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Deck.findById(deckId)
    .populate("user")
    .then((deck) => {
      if (!deck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      if (currentUserId.toString() !== deck.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this deck" });
      }

      const cardIndex = deck.cards.findIndex(
        (element) => element.cardKey === req.body.cardKey
      );

      if (cardIndex !== -1) {
        console.log("test1");
        Deck.findByIdAndUpdate(
          deckId,
          { $inc: { "cards.$[elem].numberOfCard": req.body.numberOfCard } },
          { arrayFilters: [{ "elem.cardKey": req.body.cardKey }], new: true }
        )
          .then((response) => {
            return res.json(response);
          })
          .catch((err) => res.json(err));
      } else {
        console.log("test2");
        Deck.findByIdAndUpdate(
          deckId,
          {
            $push: {
              cards: {
                cardKey: req.body.cardKey,
                numberOfCard: req.body.numberOfCard,
              },
            },
          },
          { new: true }
        )
          .then((response) => {
            return res.json(response);
          })
          .catch((err) => res.json(err));
      }
    })
    .catch((err) => res.json(err));
});

router.put("/decks/:deckId/addTofavorite", isAuthenticated, (req, res, next) => {
    const { deckId } = req.params;
    const currentUserId = req.payload._id;

    Deck.findByIdAndUpdate(deckId, { $push: { followers: currentUserId } }, { new: true })
      .then((responseDeck) => {
        //return res.json(responseDeck);
      })
      .then(() =>{
        User.findByIdAndUpdate(
          currentUserId,
          { $push: { following: currentUserId } },
          { new: true }
        )
        .then((responseUser) =>{
          return res.json(responseUser);
        })
        .catch((err) => res.json(err));
      })
      .catch((err) => res.json(err));
});

router.put("/decks/:deckId/removeCard", isAuthenticated, (req, res, next) => {
  const { deckId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Deck.findById(deckId)
    .populate("user")
    .then((deck) => {
      if (!deck) {
        return res.status(404).json({ message: "Deck not found" });
      }
      if (currentUserId.toString() !== deck.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this deck" });
      }

      const cardIndex = deck.cards.findIndex(
        (element) => element.cardKey === req.body.cardKey
      );

      if (deck.cards[cardIndex].numberOfCard - req.body.numberOfCard > 0) {
        console.log("test1");
        Deck.findByIdAndUpdate(
          deckId,
          { $inc: { "cards.$[elem].numberOfCard": -req.body.numberOfCard } },
          { arrayFilters: [{ "elem.cardKey": req.body.cardKey }], new: true }
        )
          .then((response) => {
            return res.json(response);
          })
          .catch((err) => res.json(err));
      } else {
        console.log("test2");
        Deck.findByIdAndUpdate(
          deckId,
          { $pull: { cards: { cardKey: req.body.cardKey } } },
          { new: true }
        )
          .then((response) => {
            return res.json(response);
          })
          .catch((err) => res.json(err));
      }
    })
    .catch((err) => res.json(err));
});

router.delete("/decks/:deckId", isAuthenticated, (req, res, next) => {
  const { deckId } = req.params;
  const currentUserId = req.payload._id;

  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Deck.findById(deckId)
    .then((removedDeck) => {
      if (!removedDeck) {
        res.status(404).json({ message: "Deck not found" });
        return;
      }
      if (String(removedDeck.user._id) !== String(currentUserId)) {
        res.status(401).json({ message: "Unauthorized to delete this deck." });
        return;
      }
      Deck.findByIdAndRemove(deckId)
        .then(() =>
          res.json({
            message: `The deck ${deckId} is removed successfully.`,
          })
        )
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

module.exports = router;
