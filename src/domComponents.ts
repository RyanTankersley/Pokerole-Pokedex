import { Pokemon, PokemonType, PokemonTypeColor, RecommendedRankNumber } from './pokemon.js';
/**
 * Creates a DOM element for a Pokémon card.
 * @param pokemon The Pokémon object.
 * @param opts Optional: { showDetails: boolean }
 */
export function createPokemonCard(
  pokemon: Pokemon,
  opts?: { showDetails?: boolean }
): HTMLElement {
  const showDetails = opts?.showDetails ?? true;

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
      <span class="pokemon-type-badge" style="
        background:${type1Color};
      ">${type1}</span>
      ${
        type2Color
          ? `<span class="pokemon-type-badge" style="
              background:${type2Color};
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
          <div class="moves-table">
            ${moves.map(m => `
              <span class="moves-table-item">${m}</span>
            `).join('')}
          </div>
       </div>`
    : '';

  // Recommended Rank Item Sprite
  let rankImgHtml = '';
  if (pokemon.RecommendedRank && RecommendedRankNumber[pokemon.RecommendedRank]) {
    const rankNum = RecommendedRankNumber[pokemon.RecommendedRank];
    // The server route returns the image file for the rank number
    rankImgHtml = `<img src="/recommended-rank-image/${rankNum}" alt="Rank ${pokemon.RecommendedRank}" title="Recommended Rank: ${pokemon.RecommendedRank}" style="height:1.5em;width:1.5em;vertical-align:middle;margin-left:6px;margin-right:2px;">`;
  }

  const card = document.createElement('div');
  card.className = 'pokemon-card no-break';
  card.style.width = '340px';
  card.style.minHeight = '420px';

  if (!showDetails) {
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;width:100%;">
        <div style="font-weight:bold;color:#6366f1;font-size:1.1em;min-width:36px;text-align:right;">
          ${dexId ? `#${dexId}` : ''}
        </div>
      </div>
    `;
    return card;
  }

  card.innerHTML = `
    <!-- Header spans the whole card -->
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;width:100%;">
      <div style="font-weight:bold;color:#6366f1;font-size:1.1em;min-width:36px;text-align:right;display:flex;align-items:center;">
        ${dexId ? `#${dexId}` : ''}${rankImgHtml}
      </div>
      <div style="font-size:1.05em;text-align:center;">
        ${
          (() => {
            const match = displayName.match(/^([^<]+)<br><span[^>]*>(.*)<\/span>$/);
            if (match) {
              return `${match[1]} <span style="font-size:0.92em;color:#555;">${match[2]}</span>`;
            }
            return displayName;
          })()
        }
      </div>
    </div>
    <div style="width:100%;display:flex;justify-content:center;margin-bottom:2px;margin-top:-4px;">
      ${typeHtml}
    </div>
    <div style="display:flex;align-items:flex-start;">
      <div style="flex:1;min-width:120px;">
        <img src="${imageUrl}" alt="${name}" loading="lazy" style="max-width:100%;height:auto;">
        ${hwHtml}
      </div>
      <div style="align-self:flex-start;flex:1;min-width:100px;margin-left:12px;">
        <div style="font-size:0.96em;color:#333;min-height:48px;text-align:left;">
          ${dexDescription}
        </div>
      </div>
    </div>
    ${movesHtml}
  `;
  return card;
}