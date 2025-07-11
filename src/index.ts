import { Pokemon } from './pokemon';
import { Trainer } from './trainer';

let allPokemon: Pokemon[] = [];
let imageStyle: 'full' | 'token' = 'full';

// Track selected pokemon: { [trainerName::dexId]: { pokemon: Pokemon, trainerName: string } }
const selectedPokemon: Record<string, { pokemon: Pokemon, trainerName: string }> = {};

// Add a container for the running list at the bottom
function ensureSelectedListContainer() {
  let container = document.getElementById('selected-list-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'selected-list-container';
    container.style.margin = '32px auto 0 auto';
    container.style.maxWidth = '900px';
    container.style.padding = '18px 0';
    container.style.borderTop = '2px solid #e0e7ff';
    container.style.fontFamily = 'inherit';
    document.body.appendChild(container);
  }
  return container;
}

// Render the running list of selected pokemon, grouped and sorted by trainer name
function renderSelectedList() {
  const container = ensureSelectedListContainer();
  const grouped: Record<string, Pokemon[]> = {};
  Object.values(selectedPokemon).forEach(
    ({ pokemon, trainerName }: { pokemon: Pokemon; trainerName: string }) => {
      if (!grouped[trainerName]) grouped[trainerName] = [];
      grouped[trainerName].push(pokemon);
    }
  );
  // Sort trainers alphabetically
  const trainerNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  if (trainerNames.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:#888;">No Pokémon selected.</div>`;
    return;
  }
  container.innerHTML = trainerNames.map(trainerName => {
    const pokes = grouped[trainerName]
      .sort((a, b) => (a.Number ?? 0) - (b.Number ?? 0))
      .map(p => {
        const imgSrc = p.Image
          ? `/pokedex-images-token/${p.Image}`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png`;
        return `<img src="${imgSrc}" alt="#${p.Number} ${p.Name}" title="#${p.Number} ${p.Name}" style="width:40px;height:40px;object-fit:contain;vertical-align:middle;margin:2px 4px 2px 0;border-radius:8px;border:1.5px solid #6366f1;background:#fff;">`;
      })
      .join('');
    return `<div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;"><span style="font-weight:600;color:#6366f1;min-width:110px;display:inline-block;">${trainerName}:</span> ${pokes}</div>`;
  }).join('');
}

// Setup image style toggle event listeners
const setupImageStyleToggle = () => {
  const group = document.getElementById('image-style-toggle');
  if (!group) return;
  group.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target && target.name === 'img-style') {
      imageStyle = target.value === 'token' ? 'token' : 'full';
      if (typeof (window as any).showTrainerDetails === 'function' && typeof (window as any).currentTrainerIdx === 'number') {
        (window as any).showTrainerDetails((window as any).currentTrainerIdx);
      }
    }
  });
};
setupImageStyleToggle();

// Fetch and display trainers
fetch('/trainer-list')
  .then(response => response.json())
  .then((trainerArray: Trainer[]) => {
    const trainerDiv = document.getElementById('trainer-list');
    if (!trainerDiv) return;
    trainerDiv.innerHTML = '<h2>Trainers</h2>';

    if (Array.isArray(trainerArray)) {
      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'trainer-btn-group';
      buttonGroup.style.display = 'flex';
      buttonGroup.style.flexWrap = 'wrap';
      buttonGroup.style.gap = '10px';
      buttonGroup.style.marginBottom = '18px';

      trainerArray.forEach((trainer, idx) => {
        const btn = document.createElement('button');
        btn.textContent = trainer.Name || `Trainer ${idx + 1}`;
        btn.className = 'trainer-btn';
        if (idx === 0) btn.classList.add('active');
        btn.addEventListener('click', () => {
          Array.from(buttonGroup.children).forEach(child => child.classList.remove('active'));
          btn.classList.add('active');
          showTrainerDetails(idx);
        });
        buttonGroup.appendChild(btn);
      });
      trainerDiv.appendChild(buttonGroup);

      const pokedexDiv = document.getElementById('pokedex');
      (window as any).currentTrainerIdx = 0;

      const showTrainerDetails = (idx: number) => {
        (window as any).currentTrainerIdx = idx;
        const trainer = trainerArray[idx];
        const trainerName = trainer.Name || `Trainer ${idx + 1}`;
        if (pokedexDiv && Array.isArray(trainer.Pokemon)) {
          pokedexDiv.innerHTML = '';
          const dexIds = trainer.Pokemon.map((p: Pokemon) => p.DexID);
          allPokemon
            .filter(poke => dexIds.includes(poke.DexID))
            .forEach((pokemon: Pokemon) => {
              let name = pokemon.Name || 'Unknown';
              let displayName = name;
              const match = name.match(/^([^(]+)(\s*\(.*\))$/);
              if (match) {
                displayName = `${match[1].trim()}<br><span style="font-size:0.95em;color:#555;">${match[2].trim()}</span>`;
              }

              let imageUrl = '';
              if (pokemon.Image) {
                if (imageStyle === 'token') {
                  imageUrl = `/pokedex-images-token/${pokemon.Image}`;
                } else {
                  imageUrl = `/pokedex-images/${pokemon.Image}`;
                }
              } else {
                imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png`;
              }

              const dexId = pokemon.Number;
              const selectionKey = `${trainerName}::${pokemon.DexID}`;
              const card = document.createElement('div');
              card.className = 'pokemon-card no-break';
              if (imageStyle === 'token') {
                card.style.width = '100px';
                card.style.padding = '9px';
              } else {
                card.style.width = '200px';
                card.style.padding = '18px';
              }
              // Mark selected visually
              const isSelected = !!selectedPokemon[selectionKey];
              card.style.outline = isSelected ? '3px solid #6366f1' : '';
              card.style.boxShadow = isSelected ? '0 0 0 3px #e0e7ff' : '';

              card.innerHTML = `
                <div style="font-weight:bold;color:#6366f1;font-size:1.1em;margin-bottom:4px;text-align:center;">
                  ${dexId ? `#${dexId}` : ''}
                </div>
                <img src="${imageUrl}" alt="${name}" loading="lazy" style="width:${imageStyle === 'token' ? '60px' : '120px'};height:${imageStyle === 'token' ? '60px' : '120px'};object-fit:contain;margin-bottom:0;">
                <h2 style="text-align:center;font-size:${imageStyle === 'token' ? '1em' : '1.2em'};margin:0;">${displayName}</h2>
              `;
              // Toggle selection on click
              card.style.cursor = 'pointer';
              card.addEventListener('click', () => {
                if (selectedPokemon[selectionKey]) {
                  delete selectedPokemon[selectionKey];
                } else {
                  selectedPokemon[selectionKey] = { pokemon, trainerName };
                }
                // Re-render cards to update selection style
                showTrainerDetails(idx);
                renderSelectedList();
              });
              pokedexDiv.appendChild(card);
            });
        }
      };

      (window as any).showTrainerDetails = showTrainerDetails;

      fetch('/pokedex-list')
        .then(response => response.json())
        .then((pokemonArray: Pokemon[]) => {
          allPokemon = pokemonArray;
          if (trainerArray.length > 0) showTrainerDetails(0);
          renderSelectedList();
        })
        .catch(err => {
          const pokedexDiv = document.getElementById('pokedex');
          if (pokedexDiv) pokedexDiv.innerHTML = 'Failed to load pokedex data.';
        });
    }
  });