import { Pokemon } from './pokemon';

interface SelectedPokemon {
  DexID: string;
  Number: number;
}

interface TrainerForm {
  Name: string;
  ImageURL: string;
  Pokemon: SelectedPokemon[];
  Rank: string;
  Money: number;
  Items: string[];
  OriginalName?: string;
}

document.addEventListener('DOMContentLoaded', () => {
  let allPokemon: Pokemon[] = [];
  let selectedPokemon: SelectedPokemon[] = [];
  const searchInput = document.getElementById('pokemon-search') as HTMLInputElement;
  const searchResultsDiv = document.getElementById('pokemon-search-results') as HTMLDivElement;
  const selectedListDiv = document.getElementById('selected-pokemon-list') as HTMLDivElement;
  const saveStatus = document.getElementById('save-status') as HTMLDivElement;

  // Add: Load trainers for editing
  let allTrainers: TrainerForm[] = [];
  const trainerSelect = document.createElement('select');
  trainerSelect.id = 'trainer-select';
  trainerSelect.style.marginBottom = '16px';
  trainerSelect.innerHTML = '<option value="">-- Select Trainer to Edit --</option>';
  const trainerNameInput = document.getElementById('trainer-name') as HTMLInputElement;
  trainerNameInput.parentElement?.insertBefore(trainerSelect, trainerNameInput);

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

  let editingTrainerOriginalName: string | null = null;

  // Add new form fields
  const imageUrlInput = document.getElementById('trainer-image-url') as HTMLInputElement;
  const rankInput = document.getElementById('trainer-rank') as HTMLInputElement;
  const moneyInput = document.getElementById('trainer-money') as HTMLInputElement;
  const itemsInput = document.getElementById('trainer-items') as HTMLInputElement;

  function loadTrainerToForm(trainer: TrainerForm) {
    trainerNameInput.value = trainer.Name;
    imageUrlInput.value = trainer.ImageURL || '';
    rankInput.value = trainer.Rank || '';
    moneyInput.value = trainer.Money?.toString() || '';
    itemsInput.value = (trainer.Items || []).join(', ');
    selectedPokemon = trainer.Pokemon.map(p => ({ DexID: p.DexID, Number: p.Number }));
    editingTrainerOriginalName = trainer.Name;
    renderSelectedList();
  }

  (document.getElementById('save-trainer') as HTMLButtonElement).onclick = () => {
    const trainerName = (document.getElementById('trainer-name') as HTMLInputElement).value.trim();
    const imageUrl = imageUrlInput.value.trim();
    const rank = rankInput.value.trim();
    const money = Number(moneyInput.value);
    const items = itemsInput.value.split(',').map(s => s.trim()).filter(Boolean);
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
    // Save logic: Send to server
    const trainerObj: TrainerForm = {
      Name: trainerName,
      ImageURL: imageUrl,
      Pokemon: selectedPokemon,
      Rank: rank,
      Money: isNaN(money) ? 0 : money,
      Items: items,
      OriginalName: editingTrainerOriginalName || undefined
    };
    fetch('/save-trainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainerObj)
    })
      .then(res => {
        if (res.ok) {
          saveStatus.textContent = 'Trainer saved to server!';
          saveStatus.style.color = '#16a34a';
          editingTrainerOriginalName = trainerName; // update to new name if changed
        } else {
          saveStatus.textContent = 'Failed to save trainer.';
          saveStatus.style.color = '#dc2626';
        }
      })
      .catch(() => {
        saveStatus.textContent = 'Failed to save trainer.';
        saveStatus.style.color = '#dc2626';
      });
  };

  function populateTrainerSelect() {
    trainerSelect.innerHTML = '<option value="">-- Select Trainer to Edit --</option>';
    allTrainers.forEach(tr => {
      const opt = document.createElement('option');
      opt.value = tr.Name;
      opt.textContent = tr.Name;
      trainerSelect.appendChild(opt);
    });
  }

  // Fetch all trainers on load
  fetch('/trainer-list')
    .then(res => res.json())
    .then((data: any[]) => {
      allTrainers = data.map(tr => ({
        Name: tr.Name,
        ImageURL: tr.ImageURL || '',
        Pokemon: Array.isArray(tr.Pokemon) ? tr.Pokemon.map((p: any) => ({ DexID: p.DexID, Number: p.Number })) : [],
        Rank: tr.Rank || '',
        Money: typeof tr.Money === 'number' ? tr.Money : 0,
        Items: Array.isArray(tr.Items) ? tr.Items : [],
      }));
      populateTrainerSelect();
    });

  trainerSelect.addEventListener('change', () => {
    const selected = allTrainers.find(t => t.Name === trainerSelect.value);
    if (selected) {
      // Ensure all TrainerForm fields are present
      loadTrainerToForm({
        Name: selected.Name,
        ImageURL: selected.ImageURL || '',
        Pokemon: Array.isArray(selected.Pokemon) ? selected.Pokemon.map((p: any) => ({ DexID: p.DexID, Number: p.Number })) : [],
        Rank: selected.Rank || '',
        Money: typeof selected.Money === 'number' ? selected.Money : 0,
        Items: Array.isArray(selected.Items) ? selected.Items : [],
      });
      saveStatus.textContent = `Editing trainer: ${selected.Name}`;
      saveStatus.style.color = '#6366f1';
    } else {
      trainerNameInput.value = '';
      imageUrlInput.value = '';
      rankInput.value = '';
      moneyInput.value = '';
      itemsInput.value = '';
      selectedPokemon = [];
      renderSelectedList();
      saveStatus.textContent = '';
    }
  });
});
