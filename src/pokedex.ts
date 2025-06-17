import { Pokemon, PokemonType, PokemonTypeColor } from './pokemon.js';

fetch('/pokedex-list')
  .then(response => response.json())
  .then((pokemonArray: Pokemon[]) => {
    const pokedexDiv = document.getElementById('pokedex');
    if (!pokedexDiv) return;
    pokedexDiv.innerHTML = '';
    pokemonArray.forEach((pokemon: Pokemon) => {
      let name = pokemon.Name || 'Unknown';
      let displayName = name;
      const match = name.match(/^([^(]+)(\s*\(.*\))$/);
      if (match) {
        displayName = `${match[1].trim()}<br><span style="font-size:0.95em;color:#555;">${match[2].trim()}</span>`;
      }
      let imageUrl = '';
      if (pokemon.Image) {
        imageUrl = `/pokedex-images/${pokemon.Image}`;
      } else {
        imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png`;
      }

      const dexId = pokemon.Number;
      const dexDescription = pokemon.DexDescription || '';

      // Type rectangles
      const type1 = pokemon.Type1;
      const type2 = pokemon.Type2;
      const type1Color = PokemonTypeColor[type1];
      const type2Color = type2 !== PokemonType.Empty ? PokemonTypeColor[type2] : null;

      const typeHtml = `
        <div style="display:flex;justify-content:center;gap:8px;margin:8px 0;">
          <span style="
            display:inline-block;
            min-width:60px;
            padding:4px 12px;
            border-radius:16px;
            background:${type1Color};
            color:#fff;
            font-weight:bold;
            font-size:0.98em;
            text-align:center;
            box-shadow:0 1px 4px rgba(99,102,241,0.08);
          ">${type1}</span>
          ${
            type2Color
              ? `<span style="
                  display:inline-block;
                  min-width:60px;
                  padding:4px 12px;
                  border-radius:16px;
                  background:${type2Color};
                  color:#fff;
                  font-weight:bold;
                  font-size:0.98em;
                  text-align:center;
                  box-shadow:0 1px 4px rgba(99,102,241,0.08);
                ">${type2}</span>`
              : ''
          }
        </div>
      `;

      const card = document.createElement('div');
      card.className = 'pokemon-card no-break';
      card.innerHTML = `
        <div style="font-weight:bold;color:#6366f1;font-size:1.1em;margin-bottom:4px;text-align:center;">
          ${dexId ? `#${dexId}` : ''}
        </div>
        ${typeHtml}
        <img src="${imageUrl}" alt="${name}" loading="lazy">
        <h2 style="text-align:center;">${displayName}</h2>
        <div style="font-size:0.98em;color:#333;margin-top:8px;min-height:48px;">
          ${dexDescription}
        </div>
      `;
      pokedexDiv.appendChild(card);
    });
  })
  .catch(err => {
    const pokedexDiv = document.getElementById('pokedex');
    if (pokedexDiv) pokedexDiv.innerHTML = 'Failed to load pokedex data.';
  });