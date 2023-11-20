// app.js

const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./db');
const { Player } = require('./models');
const { PlayerName } = require('./playerNames');


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// API endpoints

// Get leaderboard in descending order of gamesWon
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Player.find().sort({ gamesWon: -1 });
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/addPlayer', async (req, res) => {
    const { playerName } = req.body;
  
    try {
      // Check if the player name already exists
      let existingPlayer = await Player.findOne({ name: playerName });
  
      if (existingPlayer) {
        return res.status(400).json({ error: 'Player already exists' });
      }

      // Find or create the corresponding PlayerName document
      let playerNameDocument = await PlayerName.findOne({ name: playerName });
      if (!playerNameDocument) {
        // Generate a unique ID for the PlayerName document
        const playerId = new mongoose.Types.ObjectId();
        playerNameDocument = new PlayerName({ name: playerName, id: playerId });
        await playerNameDocument.save();
      }
  
      // Create a new player in the Player collection with the reference to the PlayerName document
      const newPlayer = new Player({ name: playerNameDocument.name });
      await newPlayer.save();
  
      res.json(newPlayer);
    } catch (error) {
      console.error('Error adding player:', error.message);
      res.status(500).send('Internal Server Error');
    }
});


  app.put('/api/updateStats/:name', async (req, res) => {
    const { name } = req.params;
    const { gamesPlayed, gamesWon } = req.body;
  
    try {
      // Find the player by name and update game statistics
      const updatedPlayer = await Player.findOneAndUpdate(
        { name },
        { $inc: { gamesPlayed, gamesWon } },
        { new: true }
      );
  
      if (!updatedPlayer) {
        return res.status(404).json({ error: 'Player not found' });
      }
  
      res.json(updatedPlayer);
    } catch (error) {
      console.error('Error updating player statistics:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/api/gameResults', async (req, res) => {
    const { players, winner } = req.body;
  
    try {
      // Validate that the request includes an array of players and a winner
      if (!Array.isArray(players) || players.length < 3 || players.length > 6 || !players.includes(winner)) {
        return res.status(400).json({ error: 'Invalid input. Please provide an array of 3 to 6 players and a valid winner.' });
      }
  
      // Update gamesPlayed for all players
      await Player.updateMany(
        { name: { $in: players } }, // Update to use 'name' instead of '_id'
        { $inc: { gamesPlayed: 1 } }
      );
  
      // Update gamesWon for the winner
      await Player.updateOne(
        { name: winner }, // Update to use 'name' instead of '_id'
        { $inc: { gamesWon: 1 } }
      );
  
      res.json({ message: 'Game results updated successfully.' });
    } catch (error) {
      console.error('Error updating game results:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });

  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
