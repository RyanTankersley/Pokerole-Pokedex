import { Pokemon, PokemonType, PokemonTypeColor } from './pokemon.js';

fetch('/pokedex-list')
  .then(response => response.json())
  .then((pokemonArray: Pokemon[]) => {
    const pokedexDiv = document.getElementById('pokedex');
    if (!pokedexDiv) return;
    pokedexDiv.innerHTML = '';
    // Only show the first 10 Pokémon
    pokemonArray.slice(0, 10).forEach((pokemon: Pokemon) => {
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

      // Height and weight display
      const heightFeet = pokemon.Height?.Feet;
      const weightPounds = pokemon.Weight?.Pounds;
      const hwHtml = (heightFeet !== undefined && weightPounds !== undefined)
        ? `<div style="font-size:0.95em;color:#555;text-align:center;margin-top:2px;">
            ${heightFeet}'&nbsp;&nbsp;|&nbsp;&nbsp;${weightPounds} lbs
          </div>`
        : '';

      // Moves list
      const moves = pokemon.Moves?.map(m => m.Name).filter(Boolean) || [];
      const movesHtml = moves.length
        ? `<div style="margin-top:10px;">
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${moves.map(m => `<span style="background:#e0e7ff;border-radius:12px;padding:3px 14px;font-size:0.97em;color:#3730a3;box-shadow:0 1px 2px #eee;display:inline-block;margin-bottom:2px;">${m}</span>`).join('')}
              </div>
           </div>`
        : '';

      const card = document.createElement('div');
      card.className = 'pokemon-card no-break';
      card.style.width = '340px'; // Reduced width for a skinnier card
      card.innerHTML = `
        <!-- Header spans the whole card -->
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;width:100%;">
          <div style="font-weight:bold;color:#6366f1;font-size:1.1em;min-width:36px;text-align:right;">
            ${dexId ? `#${dexId}` : ''}
          </div>
          <div style="font-size:1.05em;text-align:center;">
            ${
              (() => {
                // Split displayName into main and parenthesis for font sizing
                const match = displayName.match(/^([^<]+)<br><span[^>]*>(.*)<\/span>$/);
                if (match) {
                  return `${match[1]} <span style="font-size:0.92em;color:#555;">${match[2]}</span>`;
                }
                return displayName;
              })()
            }
          </div>
          <div style="min-width:90px;">
            ${typeHtml}
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;">
          <div style="flex:1;min-width:120px;">
            <img src="${imageUrl}" alt="${name}" loading="lazy" style="max-width:100%;height:auto;">
            ${hwHtml}
          </div>
          <div style="align-self:flex-start;flex:1;min-width:100px;margin-left:12px;">
            <div style="font-size:0.96em;color:#333;min-height:48px;">
              ${dexDescription}
            </div>
          </div>
        </div>
        ${movesHtml}
      `;
      pokedexDiv.appendChild(card);
    });
  })
  .catch(err => {
    const pokedexDiv = document.getElementById('pokedex');
    if (pokedexDiv) pokedexDiv.innerHTML = 'Failed to load pokedex data.';
  });