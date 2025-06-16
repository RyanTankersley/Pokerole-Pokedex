const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const dataDir = path.join(__dirname, 'Version20');
const pokedexDir = path.join(dataDir, 'Pokedex');
const campaignDir = path.join(__dirname, 'campaign');

const imageDir = path.join(__dirname, 'images');
const bookSpritesDir = path.join(imageDir, 'BookSprites');

app.use(express.static(__dirname)); // Serves static files (HTML, JS, JSON, etc.)
app.use('/pokedex-images', express.static(bookSpritesDir)); // Serve images at /pokedex-images

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

app.get('/trainer-list', (req, res) => {
    const trainerDataPath = path.join(campaignDir, 'trainerdata.json');
    console.log(trainerDataPath);
    fs.readFile(trainerDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading trainer data');
        }
        try {
            const parsed = JSON.parse(data);
            res.json(parsed);
        } catch (e) {
            res.status(500).send('Error parsing trainer data');
        }
    });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});