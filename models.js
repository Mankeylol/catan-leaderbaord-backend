// models.js

const mongoose = require('mongoose');
const { PlayerName } = require('./playerNames');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    ref: PlayerName,
    required: true,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  gamesWon: {
    type: Number,
    default: 0,
  },
});

const Player = mongoose.model('Player', playerSchema);

module.exports = { Player };
