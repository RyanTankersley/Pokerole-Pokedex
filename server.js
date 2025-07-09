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
      DexID: String,
      Number: Number,
      Victories: { type: Number, default: 0 },
      CurrentRank: String,
      // Store all attributes as an array of objects
      attributes: [
        {
          type: { type: String, enum: ['attribute', 'social', 'skill'], required: true },
          key: { type: String, required: true },
          label: { type: String, required: true },
          value: { type: Number, required: true },
          min: { type: Number, required: true },
          max: { type: Number, required: true }
        }
      ]
    }
  ],
  Rank: String, // RecommendedRank as string
  Money: Number,
  Items: [String],
  IsPlayerCharacter: { type: Boolean, default: false }
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
    const pokemonDocs = [];
    for (const p of trainer.Pokemon) {
      let attributes = Array.isArray(p.attributes) && p.attributes.length > 0
        ? p.attributes.map(attr => ({
            type: attr.type,
            key: attr.key,
            label: attr.label,
            value: typeof attr.value === 'number' ? attr.value : 0,
            min: typeof attr.min === 'number' ? attr.min : 0,
            max: typeof attr.max === 'number' ? attr.max : 0
          }))
        : await getDefaultAttributes(p); // fallback to defaults, now async
      pokemonDocs.push({
        DexID: p.DexID || '',
        Number: typeof p.Number === 'number' ? p.Number : 0,
        Victories: typeof p.Victories === 'number' ? p.Victories : 0,
        CurrentRank: p.CurrentRank || '',
        attributes
      });
    }
    await Trainer.findOneAndUpdate(
      { Name: queryName },
      {
        Name: trainer.Name,
        Pokemon: pokemonDocs,
        ImageURL: trainer.ImageURL || '',
        Rank: trainer.Rank || '',
        Money: typeof trainer.Money === 'number' ? trainer.Money : 0,
        Items: Array.isArray(trainer.Items) ? trainer.Items : [],
        IsPlayerCharacter: !!trainer.IsPlayerCharacter
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
    // For each trainer, merge their Pokemon with full info from Pokedex, but keep original fields like Victories and attributes
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
        // Merge each entry in trainer.Pokemon with the full info (if found), preserving Victories, Number, and attributes
        trainer.Pokemon = trainer.Pokemon.map(p => {
          const full = dexMap[p.DexID] || {};
          return {
            ...full,
            DexID: p.DexID,
            Number: p.Number,
            Victories: typeof p.Victories === 'number' ? p.Victories : 0,
            CurrentRank: p.CurrentRank || '',
            // attributes: p.attributes || [], // Keep existing attributes if present
            attributes: Array.isArray(p.attributes) ? p.attributes.map(attr => ({
              type: attr.type,
              key: attr.key,
              label: attr.label,
              value: typeof attr.value === 'number' ? attr.value : 0,
              min: typeof attr.min === 'number' ? attr.min : 0,
              max: typeof attr.max === 'number' ? attr.max : 0
            })) : []
          };
        });
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

// Mongoose Move schema and model
const moveSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Type: { type: String, required: true },
  Power: { type: Number, required: true },
  Damage1: String,
  Damage2: String,
  Accuracy1: String,
  Accuracy2: String,
  Target: String,
  Effect: String,
  Description: String,
  _id: { type: String, required: true },
  Attributes: {
    Priority: Number,
    AlwaysCrit: Boolean,
    AccuracyReduction: Number,
    Lethal: Boolean,
    BlockDamagePool: Number,
    Recoil: Boolean,
    ShieldMove: Boolean,
    SwitcherMove: Boolean,
    SuccessiveActions: Boolean,
    NeverFail: Boolean,
    SoundBased: Boolean,
    PhysicalRanged: Boolean,
    FistBased: Boolean,
    Rampage: Boolean,
    IgnoreDefenses: Boolean,
    HighCritical: Boolean,
    Charge: Boolean,
    DestroyShield: Boolean,
    UserFaints: Boolean,
    MustRecharge: Boolean,
    ResistedWithDefense: Boolean,
    IgnoreShield: Boolean,
    DoubleAction: Boolean,
    ResetTerrain: Boolean
  },
  AddedEffects: {
    Ailments: [{
      Type: String,
      Affects: String,
      ChanceDice: Number,
      Rounds: Number,
      TargetType: String
    }],
    StatChanges: [{
      Stats: [String],
      Stages: Number,
      Affects: String,
      ChanceDice: Number
    }],
    TerrainEffect: String,
    Heal: {
      Type: String,
      Target: String,
      WillPointCost: Number,
      Percentage: Number
    },
    FixedDamage: {
      Type: String,
      Value: Number,
      MaxValue: Number,
      Target: String
    },
    IgnoreShield: Boolean,
    AilmentHeal: [String]
  },
  Category: { type: String, required: true }
}, { collection: 'Moves' });

const MoveModel = mongoose.model('Move', moveSchema);

// GET /get-moves - returns all moves from the MongoDB Moves collection
app.get('/get-moves', async (req, res) => {
  try {
    const moves = await MoveModel.find({}).lean();
    res.json(moves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moves from database.' });
  }
});

// GET /get-moves/:dexid - returns all move objects for a specific Pokémon by DexID
app.get('/get-moves/:dexid', async (req, res) => {
  try {
    const dexid = req.params.dexid;
    const pokemon = await PokemonModel.findOne({ DexID: dexid }).lean();
    if (!pokemon || !Array.isArray(pokemon.Moves)) {
      return res.status(404).json({ error: 'Pokémon not found or has no moves.' });
    }
    // Get all move names for this Pokémon
    const moveNames = pokemon.Moves.map(m => m.Name).filter(Boolean);
    // Find all moves in the Moves collection with those names
    const moves = await MoveModel.find({ Name: { $in: moveNames } }).lean();
    res.json(moves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moves for this Pokémon.' });
  }
});

// GET /pokedex/:dexid - returns a single Pokémon from the Pokedex collection by DexID
app.get('/pokedex/:dexid', async (req, res) => {
  try {
    const dexid = req.params.dexid;
    const pokemon = await PokemonModel.findOne({ DexID: dexid }).lean();
    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon not found.' });
    }
    res.json(pokemon);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Pokémon.' });
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

// Helper: get default attributes for a TrainerPokemon (mirrors trainer.ts)
async function getDefaultAttributes(poke) {
  // Try to get the full pokedex entry for this DexID
  let dexData = null;
  if (poke && poke.DexID) {
    dexData = await PokemonModel.findOne({ DexID: poke.DexID }).lean();
  }
  // Use fallback values if dexData is missing fields
  return [
    // Core attributes
    { type: 'Attribute', key: 'Strength', label: 'Strength', value: 1, min: dexData?.Strength ?? 1, max: dexData?.MaxStrength ?? 5 },
    { type: 'Attribute', key: 'Dexterity', label: 'Dexterity', value: 1, min: dexData?.Dexterity ?? 1, max: dexData?.MaxDexterity ?? 5 },
    { type: 'Attribute', key: 'Vitality', label: 'Vitality', value: 1, min: dexData?.Vitality ?? 1, max: dexData?.MaxVitality ?? 5 },
    { type: 'Attribute', key: 'Special', label: 'Special', value: 1, min: dexData?.Special ?? 1, max: dexData?.MaxSpecial ?? 5 },
    { type: 'Attribute', key: 'Insight', label: 'Insight', value: 1, min: dexData?.Insight ?? 1, max: dexData?.MaxInsight ?? 5 },
    // Social attributes
    { type: 'Social', key: 'Tough', label: 'Tough', value: 1, min: 1, max: 5 },
    { type: 'Social', key: 'Cool', label: 'Cool', value: 1, min: 1, max: 5 },
    { type: 'Social', key: 'Beauty', label: 'Beauty', value: 1, min: 1, max: 5 },
    { type: 'Social', key: 'Clever', label: 'Clever', value: 1, min: 1, max: 5 },
    { type: 'Social', key: 'Cute', label: 'Cute', value: 1, min: 1, max: 5 },
    // Skills
    { type: 'Skill', key: 'Brawl', label: 'Brawl', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Channel', label: 'Channel', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Clash', label: 'Clash', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Evasion', label: 'Evasion', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Alert', label: 'Alert', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Athletic', label: 'Athletic', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Nature', label: 'Nature', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Stealth', label: 'Stealth', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Allure', label: 'Allure', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Etiquette', label: 'Etiquette', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Intimidate', label: 'Intimidate', value: 0, min: 0, max: 1 },
    { type: 'Skill', key: 'Perform', label: 'Perform', value: 0, min: 0, max: 1 },
  ];
}