import { Trainer, TrainerPokemon } from './trainer.js';
import { Pokemon, RecommendedRank, RecommendedRanks, RecommendedRankInfo } from './pokemon.js';
import { createPokemonCard } from './domComponents.js';

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

// Helper types for attribute keys
const attributeNames = [
  { key: 'CurrentStrength', label: 'Strength', maxKey: 'MaxStrength' },
  { key: 'CurrentDexterity', label: 'Dexterity', maxKey: 'MaxDexterity' },
  { key: 'CurrentVitality', label: 'Vitality', maxKey: 'MaxVitality' },
  { key: 'CurrentSpecial', label: 'Special', maxKey: 'MaxSpecial' },
  { key: 'CurrentInsight', label: 'Insight', maxKey: 'MaxInsight' }
] as const;
type AttributeKey = typeof attributeNames[number]['key'];
type MaxKey = typeof attributeNames[number]['maxKey'];

function renderAttributeSliders(poke: TrainerPokemon, pokeData: Pokemon) {
  const section = document.getElementById('attributes-section');
  if (!section) return;
  const rankInfo = poke.CurrentRank ? RecommendedRanks[poke.CurrentRank as RecommendedRank] : undefined;
  const allowed = rankInfo ? rankInfo.attributePoints : 1;
  let used = 0;
  attributeNames.forEach(attr => {
    const minKey = attr.label;
    const min = typeof (pokeData as any)[minKey] === 'number' ? (pokeData as any)[minKey] : 1;
    const value = typeof poke[attr.key as keyof TrainerPokemon] === 'number' ? poke[attr.key as keyof TrainerPokemon] as number : min;
    used += Math.max(0, value - min);
  });
  const remaining = allowed - used;
  section.innerHTML = `<div style="font-weight:600;color:#6366f1;margin-bottom:8px;">Attributes <span style='font-weight:400;font-size:0.95em;color:#444;'>(Points left: <span id='attr-remaining' style='color:${remaining < 0 ? '#dc2626' : '#16a34a'}'>${remaining}</span> / ${allowed})</span></div>`;
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = '1fr 1fr';
  grid.style.gap = '12px';
  attributeNames.forEach(attr => {
    const max = pokeData[attr.maxKey as keyof Pokemon] as number || 5;
    const minKey = attr.label;
    const min = typeof (pokeData as any)[minKey] === 'number' ? (pokeData as any)[minKey] : 1;
    let value = typeof poke[attr.key as keyof TrainerPokemon] === 'number' ? poke[attr.key as keyof TrainerPokemon] as number : min;
    if (value < min) value = min;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '8px';
    // Minus button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.style.marginRight = '8px';
    minusBtn.disabled = value <= min;
    minusBtn.onclick = () => {
      if (value > min) {
        (poke[attr.key as keyof TrainerPokemon] as number | undefined) = value - 1;
        renderAttributeSliders(poke, pokeData);
      }
    };
    wrapper.appendChild(minusBtn);
    // Bubbles
    for (let i = min; i <= max; i++) {
      const bubble = document.createElement('span');
      bubble.style.display = 'inline-block';
      bubble.style.width = '20px';
      bubble.style.height = '20px';
      bubble.style.margin = '0 2px';
      bubble.style.borderRadius = '50%';
      bubble.style.border = '2px solid #6366f1';
      bubble.style.background = i <= value ? '#6366f1' : 'transparent';
      bubble.style.transition = 'background 0.2s';
      wrapper.appendChild(bubble);
    }
    // Plus button
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.style.marginLeft = '8px';
    plusBtn.disabled = value >= max || remaining <= 0;
    plusBtn.onclick = () => {
      if (value < max && remaining > 0) {
        (poke[attr.key as keyof TrainerPokemon] as number | undefined) = value + 1;
        renderAttributeSliders(poke, pokeData);
      }
    };
    wrapper.appendChild(plusBtn);
    // Label
    const label = document.createElement('span');
    label.textContent = ` ${attr.label} (${value} / ${max})`;
    label.style.marginLeft = '12px';
    label.style.fontWeight = '600';
    wrapper.appendChild(label);
    grid.appendChild(wrapper);
  });
  section.appendChild(grid);
}

// Social attribute slider config
const socialAttributeNames = [
  { key: 'CurrentTough', label: 'Tough', maxKey: 'MaxTough' },
  { key: 'CurrentCool', label: 'Cool', maxKey: 'MaxCool' },
  { key: 'CurrentBeauty', label: 'Beauty', maxKey: 'MaxBeauty' },
  { key: 'CurrentClever', label: 'Clever', maxKey: 'MaxClever' },
  { key: 'CurrentCute', label: 'Cute', maxKey: 'MaxCute' }
] as const;
type SocialAttributeKey = typeof socialAttributeNames[number]['key'];
type SocialMaxKey = typeof socialAttributeNames[number]['maxKey'];

function renderSocialAttributeSliders(poke: TrainerPokemon, pokeData: Pokemon) {
  const section = document.getElementById('social-attributes-section');
  if (!section) return;
  const rankInfo = poke.CurrentRank ? RecommendedRanks[poke.CurrentRank as RecommendedRank] : undefined;
  const allowed = rankInfo ? rankInfo.socialAttributePoints : 1;
  let used = 0;
  socialAttributeNames.forEach(attr => {
    const value = typeof poke[attr.key as keyof TrainerPokemon] === 'number' ? poke[attr.key as keyof TrainerPokemon] as number : 1;
    used += Math.max(0, value - 1);
  });
  const remaining = allowed - used;
  section.innerHTML = `<div style="font-weight:600;color:#6366f1;margin-bottom:8px;">Social Attributes <span style='font-weight:400;font-size:0.95em;color:#444;'>(Points left: <span id='social-remaining' style='color:${remaining < 0 ? '#dc2626' : '#16a34a'}'>${remaining}</span> / ${allowed})</span></div>`;
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = '1fr 1fr';
  grid.style.gap = '12px';
  socialAttributeNames.forEach(attr => {
    const max = 5;
    let value = typeof poke[attr.key as keyof TrainerPokemon] === 'number' ? poke[attr.key as keyof TrainerPokemon] as number : 1;
    if (value < 1) value = 1;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '8px';
    // Minus button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.style.marginRight = '8px';
    minusBtn.disabled = value <= 1;
    minusBtn.onclick = () => {
      if (value > 1) {
        (poke[attr.key as keyof TrainerPokemon] as number | undefined) = value - 1;
        renderSocialAttributeSliders(poke, pokeData);
      }
    };
    wrapper.appendChild(minusBtn);
    // Bubbles
    for (let i = 1; i <= max; i++) {
      const bubble = document.createElement('span');
      bubble.style.display = 'inline-block';
      bubble.style.width = '20px';
      bubble.style.height = '20px';
      bubble.style.margin = '0 2px';
      bubble.style.borderRadius = '50%';
      bubble.style.border = '2px solid #6366f1';
      bubble.style.background = i <= value ? '#6366f1' : 'transparent';
      bubble.style.transition = 'background 0.2s';
      wrapper.appendChild(bubble);
    }
    // Plus button
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.style.marginLeft = '8px';
    plusBtn.disabled = value >= max || remaining <= 0;
    plusBtn.onclick = () => {
      if (value < max && remaining > 0) {
        (poke[attr.key as keyof TrainerPokemon] as number | undefined) = value + 1;
        renderSocialAttributeSliders(poke, pokeData);
      }
    };
    wrapper.appendChild(plusBtn);
    // Label
    const label = document.createElement('span');
    label.textContent = ` ${attr.label} (${value} / ${max})`;
    label.style.marginLeft = '12px';
    label.style.fontWeight = '600';
    wrapper.appendChild(label);
    grid.appendChild(wrapper);
  });
  section.appendChild(grid);
}

// Skills slider config
const skillNames = [
  { key: 'SkillBrawl', label: 'Brawl' },
  { key: 'SkillChannel', label: 'Channel' },
  { key: 'SkillClash', label: 'Clash' },
  { key: 'SkillEvasion', label: 'Evasion' },
  { key: 'SkillAlert', label: 'Alert' },
  { key: 'SkillAthletic', label: 'Athletic' },
  { key: 'SkillNature', label: 'Nature' },
  { key: 'SkillStealth', label: 'Stealth' },
  { key: 'SkillAllure', label: 'Allure' },
  { key: 'SkillEtiquette', label: 'Etiquette' },
  { key: 'SkillIntimidate', label: 'Intimidate' },
  { key: 'SkillPerform', label: 'Perform' }
] as const;
type SkillKey = typeof skillNames[number]['key'];

// Helper for getting a skill value, defaulting to 0
function getSkillValue(poke: TrainerPokemon, key: SkillKey): number {
  const val = poke[key];
  return typeof val === 'number' ? val : 0;
}

function getSkillMax(rank: string | undefined): number {
  switch (rank) {
    case 'Starter': return 1;
    case 'Beginner': return 2;
    case 'Amateur': return 3;
    case 'Ace': return 4;
    case 'Pro': return 4;
    case 'Master': return 6;
    default: return 1;
  }
}

function renderSkillSliders(poke: TrainerPokemon) {
  const section = document.getElementById('skills-section');
  if (!section) return;
  const rankInfo = poke.CurrentRank ? RecommendedRanks[poke.CurrentRank as RecommendedRank] : undefined;
  const allowed = rankInfo ? rankInfo.skillPoints : 1;
  let used = 0;
  skillNames.forEach(attr => {
    used += getSkillValue(poke, attr.key);
  });
  const remaining = allowed - used;
  section.innerHTML = `<div style="font-weight:600;color:#6366f1;margin-bottom:8px;">Skills <span style='font-weight:400;font-size:0.95em;color:#444;'>(Points left: <span id='skill-remaining' style='color:${remaining < 0 ? '#dc2626' : '#16a34a'}'>${remaining}</span> / ${allowed})</span></div>`;
  const max = rankInfo ? rankInfo.maxSkillPoints : 1;
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = '1fr 1fr';
  grid.style.gap = '12px';
  skillNames.forEach(attr => {
    let value = getSkillValue(poke, attr.key);
    if (typeof value !== 'number' || value < 0) value = 0;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '8px';
    // Minus button
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.style.marginRight = '8px';
    minusBtn.disabled = value <= 0;
    minusBtn.onclick = () => {
      if (value > 0) {
        (poke[attr.key as keyof TrainerPokemon] as number | undefined) = value - 1;
        renderSkillSliders(poke);
      }
    };
    wrapper.appendChild(minusBtn);
    // Bubbles
    for (let i = 1; i <= max; i++) {
      const bubble = document.createElement('span');
      bubble.style.display = 'inline-block';
      bubble.style.width = '20px';
      bubble.style.height = '20px';
      bubble.style.margin = '0 2px';
      bubble.style.borderRadius = '50%';
      bubble.style.border = '2px solid #6366f1';
      bubble.style.background = i <= value ? '#6366f1' : 'transparent';
      bubble.style.transition = 'background 0.2s';
      wrapper.appendChild(bubble);
    }
    // Plus button
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.style.marginLeft = '8px';
    plusBtn.disabled = value >= max || remaining <= 0;
    plusBtn.onclick = () => {
      if (value < max && remaining > 0) {
        (poke[attr.key as keyof TrainerPokemon] as number | undefined) = value + 1;
        renderSkillSliders(poke);
      }
    };
    wrapper.appendChild(plusBtn);
    // Label
    const label = document.createElement('span');
    label.textContent = ` ${attr.label} (${value} / ${max})`;
    label.style.marginLeft = '12px';
    label.style.fontWeight = '600';
    wrapper.appendChild(label);
    grid.appendChild(wrapper);
  });
  section.appendChild(grid);
}

// Update skill sliders when rank changes
currentRankSelect.addEventListener('change', () => {
  if (selectedPoke && selectedTrainer && allPokemon.length > 0) {
    selectedPoke.CurrentRank = currentRankSelect.value as RecommendedRank || undefined;
    // Find the current pokemon data
    const pokeData = allPokemon.find(p => p.DexID === selectedPoke?.DexID);
    if (pokeData) {
      renderAttributeSliders(selectedPoke, pokeData);
      renderSocialAttributeSliders(selectedPoke, pokeData);
    }
    renderSkillSliders(selectedPoke);
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
  renderSocialAttributeSliders(poke, pokeData);
  // Render skill sliders
  renderSkillSliders(poke);
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
