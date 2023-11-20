// playerNames.js

const mongoose = require('mongoose');

const playerNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const PlayerName = mongoose.model('PlayerName', playerNameSchema);

module.exports = { PlayerName };
