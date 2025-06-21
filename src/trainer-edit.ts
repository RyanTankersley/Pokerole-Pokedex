import { Pokemon } from './pokemon';

interface SelectedPokemon {
  DexID: string;
  Number: number;
}

document.addEventListener('DOMContentLoaded', () => {
  let allPokemon: Pokemon[] = [];
  let selectedPokemon: SelectedPokemon[] = [];
  const searchInput = document.getElementById('pokemon-search') as HTMLInputElement;
  const searchResultsDiv = document.getElementById('pokemon-search-results') as HTMLDivElement;
  const selectedListDiv = document.getElementById('selected-pokemon-list') as HTMLDivElement;
  const saveStatus = document.getElementById('save-status') as HTMLDivElement;

  // Fetch all pokemon
  fetch('/pokedex-list')
    .then(res => res.json())
    .then((data: Pokemon[]) => { allPokemon = data; });

  function renderSearchResults(results: Pokemon[]) {
    searchResultsDiv.innerHTML = '';
    results.forEach(poke => {
      const div = document.createElement('div');
      div.className = 'pokemon-search-item';
      div.innerHTML = `<img src="/pokedex-images-token/${poke.Image || ''}" style="width:32px;height:32px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid #c7d2fe;"> <span>#${poke.Number} ${poke.Name}</span>`;
      div.onclick = () => {
        if (!selectedPokemon.find(p => p.DexID === poke.DexID)) {
          selectedPokemon.push({ DexID: poke.DexID, Number: poke.Number });
          renderSelectedList();
        }
      };
      searchResultsDiv.appendChild(div);
    });
  }

  function renderSelectedList() {
    selectedListDiv.innerHTML = '';
    selectedPokemon.forEach(poke => {
      const div = document.createElement('div');
      div.className = 'selected-pokemon-item';
      const pokeName = allPokemon.find(p => p.DexID === poke.DexID)?.Name || '';
      div.innerHTML = `<span>#${poke.Number}</span> <span>${pokeName}</span> <button class="remove-poke-btn" title="Remove">&times;</button>`;
      (div.querySelector('button') as HTMLButtonElement).onclick = () => {
        selectedPokemon = selectedPokemon.filter(p => p.DexID !== poke.DexID);
        renderSelectedList();
      };
      selectedListDiv.appendChild(div);
    });
  }

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim().toLowerCase();
    if (!val) {
      searchResultsDiv.innerHTML = '';
      return;
    }
    const results = allPokemon.filter(p =>
      p.Name.toLowerCase().includes(val) ||
      String(p.Number).padStart(3, '0').includes(val) ||
      String(p.Number).includes(val)
    ).slice(0, 20); // limit results
    renderSearchResults(results);
  });

  (document.getElementById('save-trainer') as HTMLButtonElement).onclick = () => {
    const trainerName = (document.getElementById('trainer-name') as HTMLInputElement).value.trim();
    if (!trainerName) {
      saveStatus.textContent = 'Trainer name is required!';
      saveStatus.style.color = '#dc2626';
      return;
    }
    if (selectedPokemon.length === 0) {
      saveStatus.textContent = 'Select at least one Pokémon!';
      saveStatus.style.color = '#dc2626';
      return;
    }
    // Save logic: Download JSON
    const trainerObj = {
      Name: trainerName,
      Pokemon: selectedPokemon
    };
    const blob = new Blob([JSON.stringify(trainerObj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${trainerName.replace(/\s+/g, '_')}_trainer.json`;
    a.click();
    saveStatus.textContent = 'Trainer JSON downloaded!';
    saveStatus.style.color = '#16a34a';
  };
});
