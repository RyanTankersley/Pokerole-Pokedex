const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

const dataDir = path.join(__dirname, 'Version20');
const pokedexDir = path.join(dataDir, 'Pokedex');
const campaignDir = path.join(__dirname, 'campaign');

const imageDir = path.join(__dirname, 'images');
const bookSpritesDir = path.join(imageDir, 'BookSprites');
const shuffleTokenDir = path.join(imageDir, 'ShuffleTokens');
const itemSpritesDir = path.join(imageDir, 'ItemSprites');

app.use(express.static(__dirname)); // Serves static files (HTML, JS, JSON, etc.)
app.use('/pokedex-images', express.static(bookSpritesDir)); // Serve images at /pokedex-images
app.use('/pokedex-images-token', express.static(shuffleTokenDir)); // Serve images at /pokedex-image-token
app.use('/item-images', express.static(itemSpritesDir)); // Serve images at /pokedex-images
app.use(express.json()); // For parsing application/json

// Mongoose connection
mongoose.connect('mongodb://localhost:27017/Pokerole20', {
  authSource: 'admin',
  
});
const trainerSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  ImageURL: String,
  Pokemon: [
    {
      // Store DexID and Number for selection, but can be expanded to full Pokemon schema if needed
      DexID: String,
      Number: Number
    }
  ],
  Rank: String, // RecommendedRank as string
  Money: Number,
  Items: [String]
}, { collection: 'Trainers' });

const Trainer = mongoose.model('Trainer', trainerSchema);

app.post('/save-trainer', async (req, res) => {
  try {
    const { trainer, OriginalName } = req.body;
    if (!trainer || !trainer.Name || !Array.isArray(trainer.Pokemon) || trainer.Pokemon.length === 0) {
      return res.status(400).json({ error: 'Invalid trainer data.' });
    }
    // If OriginalName is provided and different, update by OriginalName
    const queryName = OriginalName && OriginalName !== trainer.Name ? OriginalName : trainer.Name;
    await Trainer.findOneAndUpdate(
      { Name: queryName },
      {
        Name: trainer.Name,
        Pokemon: trainer.Pokemon.map(p => ({
          DexID: p.DexID || '',
          Number: typeof p.Number === 'number' ? p.Number : 0
        })),
        ImageURL: trainer.ImageURL || '',
        Rank: trainer.Rank || '',
        Money: typeof trainer.Money === 'number' ? trainer.Money : 0,
        Items: Array.isArray(trainer.Items) ? trainer.Items : []
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // If the name was changed, remove the old trainer if it exists and is different
    if (OriginalName && OriginalName !== trainer.Name) {
      await Trainer.deleteOne({ Name: OriginalName });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save trainer.' });
  }
});

app.get('/pokedex-list', (req, res) => {
    fs.readdir(pokedexDir, (err, files) => {
        if (err) return res.status(500).send('Error reading directory');
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const allData = [];
        let filesRead = 0;

        if (jsonFiles.length === 0) return res.json(allData);

        jsonFiles.forEach(file => {
            fs.readFile(path.join(pokedexDir, file), 'utf8', (err, data) => {
                filesRead++;
                if (!err) {
                    try {
                        const parsed = JSON.parse(data);
                        // Only include if DexID can be converted to a valid number
                        if ( true
                            //parsed.DexID !== undefined &&
                            //!isNaN(Number(parsed.DexID))
                        ) {
                            allData.push(parsed);
                        }
                    } catch (e) {
                        // Optionally handle JSON parse errors
                    }
                }
                if (filesRead === jsonFiles.length) {
                    // Sort by Number, Dex, Id, or id (first found)
                    allData.sort((a, b) => {
                        const getNum = (poke) =>
                            poke.Number ?? poke.number ?? poke.Dex ?? poke.dex ?? poke.Id ?? poke.id ?? poke.ID ?? 0;
                        return getNum(a) - getNum(b);
                    });
                    res.json(allData);
                }
            });
        });
    });
});

app.get('/trainer-list', async (req, res) => {
  try {
    // Get all trainers from MongoDB
    const trainers = await Trainer.find({}).lean();
    // For each trainer, populate their Pokemon with full info from Pokedex
    for (const trainer of trainers) {
      if (Array.isArray(trainer.Pokemon)) {
        // Get all DexIDs for this trainer
        const dexIds = trainer.Pokemon.map(p => p.DexID);
        // Query all matching pokemon from Mongo
        const pokedexEntries = await PokemonModel.find({ DexID: { $in: dexIds } }).lean();
        // Map DexID to full pokemon info
        const dexMap = {};
        for (const poke of pokedexEntries) {
          dexMap[poke.DexID] = poke;
        }
        // Replace each entry in trainer.Pokemon with the full info (if found)
        trainer.Pokemon = trainer.Pokemon.map(p => dexMap[p.DexID] || p);
      }
    }
    res.json(trainers);
  } catch (err) {
    res.status(500).send('Error loading trainers from database');
  }
});

/**
 * Returns the absolute path to the item sprite image file for a given number 1-6.
 * @param {number} num - A number from 1 to 6.
 * @returns {string|null} The absolute file path to the image, or null if invalid.
 */
function getRecommendedRankItemSpriteFileByNumber(num) {
  if (typeof num !== 'number' || num < 1 || num > 6) return null;

  let fileName = '';
  switch(num) {
    case 1: fileName = 'light-ball.png'; break; // Potion
    case 2: fileName = 'pokeball.png'; break; // Super Potion
    case 3: fileName = 'greatball.png'; break; // Hyper Potion
    case 4: fileName = 'ultraball.png'; break; // Max Potion
    case 5: fileName = 'iron-ball.png'; break; // Full Restore
    case 6: fileName = 'masterball.png'; break; // Revive
    default: return null;
}
  return path.join(itemSpritesDir, fileName);
}

// Add this route to serve the item sprite image
app.get('/recommended-rank-image/:num', (req, res) => {
  const num = Number(req.params.num);
  const filePath = getRecommendedRankItemSpriteFileByNumber(num);
  if (filePath) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

const pokemonSchema = new mongoose.Schema({
  DexID: { type: String, required: true },
  Number: Number,
  Name: String,
  Type1: String,
  Type2: String,
  Image: String,
  DexDescription: String,
  Height: {
    Feet: Number,
    Inches: Number,
    Meters: Number,
  },
  Weight: {
    Pounds: Number,
    Kilograms: Number,
  },
  BaseHP: Number,
  BaseAttack: Number,
  BaseDefense: Number,
  BaseSpAttack: Number,
  BaseSpDefense: Number,
  BaseSpeed: Number,
  Moves: [
    {
      Name: String,
      Level: Number,
      Type: String,
      Power: Number,
      Accuracy: Number,
      PP: Number,
      Description: String
    }
  ],
  Abilities: [String],
  RecommendedRank: String,
  // Add any other fields from your TypeScript model as needed
}, { collection: 'Pokedex' });

const PokemonModel = mongoose.model('Pokemon', pokemonSchema);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});