import { Trainer, TrainerPokemon, AttributeType } from './trainer.js';
import { Pokemon, RecommendedRank, RecommendedRanks } from './pokemon.js';
import { createPokemonCard } from './domComponents.js';
import { createMoveCard, createMoveNotFoundCard } from './moveComponent.js';
import { createSliderSection } from './sliderSectionComponent.js';

let allTrainers: Trainer[] = [];
let allPokemon: Pokemon[] = [];
const victoryInput = document.getElementById('victory-count') as HTMLInputElement;
const saveBtn = document.getElementById('save-victory') as HTMLButtonElement;
const saveStatus = document.getElementById('save-status') as HTMLDivElement;
const pokeInfoDiv = document.getElementById('poke-info') as HTMLDivElement;
const labelDiv = document.getElementById('trainer-poke-labels') as HTMLDivElement;

// Add CurrentRank select
const currentRankLabel = document.createElement('label');
currentRankLabel.htmlFor = 'current-rank';
currentRankLabel.textContent = 'Current Rank';
currentRankLabel.style.display = 'block';
currentRankLabel.style.fontWeight = '600';
currentRankLabel.style.marginTop = '12px';
const currentRankSelect = document.createElement('select');
currentRankSelect.id = 'current-rank';
currentRankSelect.style.width = '100%';
currentRankSelect.style.padding = '8px';
currentRankSelect.style.marginBottom = '16px';
currentRankSelect.style.borderRadius = '6px';
currentRankSelect.style.border = '1px solid #c7d2fe';
currentRankSelect.innerHTML = '';
// Sort ranks by RecommendedRankNumber
const rankEntries = Object.values(RecommendedRank)
  .filter(v => typeof v === 'string')
  .sort((a, b) => (RecommendedRanks[a as RecommendedRank].number ?? 0) - (RecommendedRanks[b as RecommendedRank].number ?? 0));
rankEntries.forEach(rank => {
  const opt = document.createElement('option');
  opt.value = rank;
  // Add image to option using innerHTML (works in most browsers)
  const rankNum = RecommendedRanks[rank as RecommendedRank].number;
  opt.innerHTML = `<img src="/recommended-rank-image/${rankNum}" style="height:1.2em;width:1.2em;vertical-align:middle;margin-right:4px;">${rank}`;
  currentRankSelect.appendChild(opt);
});
const form = document.querySelector('.trainer-pokemon-form');
if (form) {
  form.insertBefore(currentRankLabel, victoryInput.nextSibling);
  form.insertBefore(currentRankSelect, currentRankLabel.nextSibling);
}

// Remove trainer and pokemon selects if present
const trainerSelect = document.getElementById('trainer-select');
const pokemonSelect = document.getElementById('pokemon-select');
if (trainerSelect) trainerSelect.style.display = 'none';
if (pokemonSelect) pokemonSelect.style.display = 'none';

function showTrainerAndPokemonLabels(trainer: Trainer, poke: TrainerPokemon, pokeData: Pokemon | undefined) {
  if (!labelDiv) return;
  labelDiv.innerHTML = `
    <div style="font-weight:600;font-size:1.1em;color:#6366f1;">Trainer: <span style='color:#222'>${trainer.Name}</span></div>
    <div style="font-weight:600;font-size:1.1em;color:#6366f1;">Pokémon: <span style='color:#222'>#${poke.Number} ${pokeData ? pokeData.Name : ''}</span></div>
  `;
}


function renderAttributeSliders(poke: TrainerPokemon, pokeData: Pokemon) {
  
  Object.values(AttributeType).forEach(type => {
    console.log(type);
    let id = type == AttributeType.Attribute ? 'attributes-section' : 
    type == AttributeType.Social ? 'social-attributes-section' : 'skills-section';
    console.log(id)
    let section = document.getElementById(id);
    if (!section) return;
    const rankInfo = poke.CurrentRank ? RecommendedRanks[poke.CurrentRank as RecommendedRank] : undefined;
    const allowed = rankInfo ? rankInfo.attributePoints : 1;
    let used = 0;
    const remaining = allowed - used;
    section.innerHTML = '';
    const sliders = poke.attributes.filter((a) => a.type == type).map(attr => {
      const max = attr.max;
      const min = attr.min
      if (attr.value < min) attr.value = min;
      let value = attr.value
      return {
        label: attr.label,
        value,
        min,
        max,
        remaining,
        onChange: (newValue: number) => {
          (poke[attr.key as keyof TrainerPokemon] as number | undefined) = newValue;
          renderAttributeSliders(poke, pokeData);
        },
        disabled: false
      };
    });
    section.appendChild(createSliderSection({
      sectionLabel: type.toString(),
      sliders,
      columns: 2,
      remainingLabel: 'Points left',
      remaining,
      allowed,
    }));
  })
}

// Update skill sliders when rank changes
currentRankSelect.addEventListener('change', () => {
  if (selectedPoke && selectedTrainer && allPokemon.length > 0) {
    selectedPoke.CurrentRank = currentRankSelect.value as RecommendedRank || undefined;
    // Find the current pokemon data
    const pokeData = allPokemon.find(p => p.DexID === selectedPoke?.DexID);
    if (pokeData) {
      // Update attributes, social attributes, and skills based on new rank
      renderAttributeSliders(selectedPoke, pokeData);
    }
  }
});

function showPokemonInfo(trainer: Trainer, dexid: string) {
  if (!pokeInfoDiv || !labelDiv) return;
  const poke = trainer.Pokemon.find(p => p.DexID === dexid);
  const pokeData = allPokemon.find(p => p.DexID === dexid);
  if (!poke || !pokeData) {
    pokeInfoDiv.innerHTML = '';
    labelDiv.innerHTML = '';
    return;
  }
  // Use the pokedex card
  pokeInfoDiv.innerHTML = '';
  const card = createPokemonCard(pokeData, { showDetails: true });
  pokeInfoDiv.appendChild(card);
  showTrainerAndPokemonLabels(trainer, poke, pokeData);
  // Set current rank select, default to Starter if not set
  if (!poke.CurrentRank) {
    poke.CurrentRank = RecommendedRank.Starter;
  }
  currentRankSelect.value = poke.CurrentRank;
  // Render attribute sliders
  renderAttributeSliders(poke, pokeData);
  // Render social attribute sliders
  // Render skill sliders

  // --- Move Details Card Feature ---
  // Ensure wrapper exists for side-by-side layout
  let wrapper = document.getElementById('poke-info-wrapper') as HTMLDivElement | null;
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'poke-info-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'flex-start';
    // Move pokeInfoDiv into wrapper
    if (pokeInfoDiv.parentElement) {
      pokeInfoDiv.parentElement.insertBefore(wrapper, pokeInfoDiv);
      wrapper.appendChild(pokeInfoDiv);
    }
  }

  // Widen the pokemon info card
  pokeInfoDiv.style.width = '420px';
  pokeInfoDiv.style.minWidth = '420px';
  pokeInfoDiv.style.maxWidth = '420px';
  pokeInfoDiv.style.flex = '0 0 420px';
  // Ensure wrapper is wide enough
  if (wrapper) {
    wrapper.style.width = '680px';
    wrapper.style.maxWidth = '100%';
  }

  // Ensure move details container exists inside wrapper
  let moveDetailsDiv = document.getElementById('move-details-card') as HTMLDivElement | null;
  if (!moveDetailsDiv) {
    moveDetailsDiv = document.createElement('div');
    moveDetailsDiv.id = 'move-details-card';
    moveDetailsDiv.style.marginLeft = '32px';
    moveDetailsDiv.style.display = 'inline-block';
    moveDetailsDiv.style.verticalAlign = 'top';
    moveDetailsDiv.style.maxWidth = '420px';
    moveDetailsDiv.style.minWidth = '180px';
    moveDetailsDiv.style.display = 'none'; // Initially hidden
    wrapper.appendChild(moveDetailsDiv);
  } else {
    moveDetailsDiv.innerHTML = '';
    moveDetailsDiv.style.maxWidth = '220px';
    moveDetailsDiv.style.minWidth = '180px';
    if (moveDetailsDiv.parentElement !== wrapper) {
      wrapper.appendChild(moveDetailsDiv);
    }
  }

  // Responsive layout for poke-info-wrapper
  const trainerForm = document.querySelector('.trainer-pokemon-form') as HTMLElement | null;
  if (trainerForm) {
    trainerForm.style.maxWidth = '800px';
  }
  if (wrapper) {
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.width = '100%';
  }
  pokeInfoDiv.style.width = '420px';
  pokeInfoDiv.style.minWidth = '320px';
  pokeInfoDiv.style.maxWidth = '400px';
  pokeInfoDiv.style.flex = '0 0 400px';
  if (moveDetailsDiv) {
    moveDetailsDiv.style.maxWidth = '220px';
    moveDetailsDiv.style.minWidth = '180px';
    moveDetailsDiv.style.flex = '1 1 180px';
    moveDetailsDiv.style.marginLeft = '32px';
  }
  // Add responsive behavior: stack on small screens
  if (wrapper) {
    wrapper.style.gap = '0';
    wrapper.style.rowGap = '24px';
    wrapper.style.columnGap = '32px';
    wrapper.style.boxSizing = 'border-box';
    // Add a media query for stacking
    const styleId = 'poke-info-responsive-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 900px) {
          #poke-info-wrapper { flex-direction: column !important; }
          #move-details-card { margin-left: 0 !important; margin-top: 24px !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Additive: Fetch and display move details from /get-moves/:dexid
  fetch(`/get-moves/${dexid}`)
    .then(res => res.json())
    .then((moves) => {
      setTimeout(() => {
        const moveEls = pokeInfoDiv.querySelectorAll('[data-move-name]');
        moveEls.forEach(el => {
          el.addEventListener('click', () => {
            const moveName = el.getAttribute('data-move-name');
            if (!moveName) return;
            const move = Array.isArray(moves) ? moves.find(m => m.Name === moveName) : undefined;
            moveDetailsDiv.style.display = 'flex';
            if (!move) {
              moveDetailsDiv!.innerHTML = '';
              moveDetailsDiv!.appendChild(createMoveNotFoundCard(moveName));
              return;
            }
            moveDetailsDiv!.innerHTML = '';
            moveDetailsDiv!.appendChild(createMoveCard(move));
          });
        });
      }, 0);
    });
}

let selectedTrainer: Trainer | undefined;
let selectedPoke: TrainerPokemon | undefined;

fetch('/trainer-list')
  .then(res => res.json())
  .then((data: Trainer[]) => {
    allTrainers = data;
    // If query params present, preselect
    const params = new URLSearchParams(window.location.search);
    const trainerName = params.get('trainer');
    const dexid = params.get('dexid');
    if (trainerName) {
      selectedTrainer = allTrainers.find(t => t.Name === trainerName);
      if (selectedTrainer && dexid) {
        selectedPoke = selectedTrainer.Pokemon.find(p => p.DexID === dexid);
        if (selectedPoke) {
          victoryInput.value = String(selectedPoke.Victories ?? 0);
          currentRankSelect.value = selectedPoke.CurrentRank || '';
        }
      }
    }
  });

fetch('/pokedex-list')
  .then(res => res.json())
  .then((data: Pokemon[]) => {
    allPokemon = data;
    // If query params present, show info
    const params = new URLSearchParams(window.location.search);
    const trainerName = params.get('trainer');
    const dexid = params.get('dexid');
    if (trainerName && dexid && selectedTrainer && selectedPoke) {
      showPokemonInfo(selectedTrainer, dexid);
    }
  });

saveBtn.onclick = () => {
  if (!selectedTrainer) {
    saveStatus.textContent = 'Select a trainer.';
    saveStatus.style.color = '#dc2626';
    return;
  }
  if (!selectedPoke) {
    saveStatus.textContent = 'Select a Pokémon.';
    saveStatus.style.color = '#dc2626';
    return;
  }
  selectedPoke.Victories = Number(victoryInput.value) || 0;
  selectedPoke.CurrentRank = currentRankSelect.value as RecommendedRank || undefined;
  // Attribute values are already updated by slider events
  // Save the updated trainer
  fetch('/save-trainer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainer: selectedTrainer, OriginalName: selectedTrainer.Name })
  })
    .then(res => {
      if (res.ok) {
        saveStatus.textContent = 'Victory count, rank, and attributes saved!';
        saveStatus.style.color = '#16a34a';
      } else {
        saveStatus.textContent = 'Failed to save.';
        saveStatus.style.color = '#dc2626';
      }
    })
    .catch(() => {
      saveStatus.textContent = 'Failed to save.';
      saveStatus.style.color = '#dc2626';
    });
};
