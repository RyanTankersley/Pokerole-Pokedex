import { Trainer, TrainerPokemon } from './trainer.js';
import { Pokemon } from './pokemon.js';

let allTrainers: Trainer[] = [];
let allPokemon: Pokemon[] = [];
const victoryInput = document.getElementById('victory-count') as HTMLInputElement;
const saveBtn = document.getElementById('save-victory') as HTMLButtonElement;
const saveStatus = document.getElementById('save-status') as HTMLDivElement;
const pokeInfoDiv = document.getElementById('poke-info') as HTMLDivElement;
const labelDiv = document.getElementById('trainer-poke-labels') as HTMLDivElement;

// Remove trainer and pokemon selects if present
const trainerSelect = document.getElementById('trainer-select');
const pokemonSelect = document.getElementById('pokemon-select');
if (trainerSelect) trainerSelect.style.display = 'none';
if (pokemonSelect) pokemonSelect.style.display = 'none';

function showTrainerAndPokemonLabels(trainer: Trainer, poke: TrainerPokemon, pokeData: Pokemon | undefined) {
  if (!labelDiv) return;
  labelDiv.innerHTML = `
    <div style="font-weight:600;font-size:1.1em;color:#6366f1;">Trainer: <span style='color:#222'>${trainer.Name}</span></div>
  `;
}

function showPokemonInfo(trainer: Trainer, dexid: string) {
  if (!pokeInfoDiv || !labelDiv) return;
  const poke = trainer.Pokemon.find(p => p.DexID === dexid);
  const pokeData = allPokemon.find(p => p.DexID === dexid);
  if (!poke || !pokeData) {
    pokeInfoDiv.innerHTML = '';
    labelDiv.innerHTML = '';
    return;
  }
  const imgSrc = pokeData.Image ? `/pokedex-images-token/${pokeData.Image}` : '';
  pokeInfoDiv.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;">
      <img src="${imgSrc}" alt="#${poke.Number}" style="width:60px;height:60px;object-fit:contain;border-radius:8px;background:#fff;border:1px solid #c7d2fe;">
      <div>
        <div style="font-weight:600;font-size:1.2em;">#${poke.Number} ${pokeData.Name}</div>
      </div>
    </div>
  `;
  showTrainerAndPokemonLabels(trainer, poke, pokeData);
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
  // Save the updated trainer
  fetch('/save-trainer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainer: selectedTrainer, OriginalName: selectedTrainer.Name })
  })
    .then(res => {
      if (res.ok) {
        saveStatus.textContent = 'Victory count saved!';
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
