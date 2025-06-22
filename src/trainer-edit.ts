import { Pokemon, RecommendedRank, RecommendedRankNumber } from './pokemon.js';
import { Trainer } from './trainer.js';

interface TrainerForm {
  trainer: Trainer;
  OriginalName?: string;
}

document.addEventListener('DOMContentLoaded', () => {
  let allPokemon: Pokemon[] = [];
  let selectedPokemon: Pokemon[] = [];
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
          selectedPokemon.push(poke);
          renderSelectedList();
          searchInput.value = '';
          searchResultsDiv.innerHTML = '';
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
      const pokeData = allPokemon.find(p => p.DexID === poke.DexID);
      const pokeName = pokeData?.Name || '';
      const pokeImg = pokeData?.Image ? `/pokedex-images-token/${pokeData.Image}` : '';
      div.innerHTML = `<img src="${pokeImg}" style="width:32px;height:32px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid #c7d2fe;"> <span>#${poke.Number}</span> <span>${pokeName}</span> <button class="remove-poke-btn" title="Remove">&times;</button>`;
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
  const rankInput = document.getElementById('trainer-rank') as HTMLSelectElement;
  const moneyInput = document.getElementById('trainer-money') as HTMLInputElement;
  const itemsInput = document.getElementById('trainer-items') as HTMLInputElement;

  function loadTrainerToForm(trainerForm: TrainerForm) {
    const trainer = trainerForm.trainer;
    trainerNameInput.value = trainer.Name;
    imageUrlInput.value = trainer.ImageURL || '';
    rankInput.value = trainer.Rank || '';
    moneyInput.value = trainer.Money?.toString() || '';
    itemsInput.value = (trainer.Items || []).join(', ');
    selectedPokemon = Array.isArray(trainer.Pokemon)
      ? trainer.Pokemon.map((p: Pokemon) => (p))
      : [];
    editingTrainerOriginalName = trainerForm.OriginalName || trainer.Name;
    renderSelectedList();
  }

  (document.getElementById('save-trainer') as HTMLButtonElement).onclick = () => {
    const trainerName = (document.getElementById('trainer-name') as HTMLInputElement).value.trim();
    const imageUrl = imageUrlInput.value.trim();
    // Get the selected rank as a RecommendedRank value
    const rank = (rankInput.value as RecommendedRank) || undefined;
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
      trainer: {
        Name: trainerName,
        ImageURL: imageUrl,
        Pokemon: selectedPokemon,
        Rank: rank as RecommendedRank,
        Money: isNaN(money) ? 0 : money,
        Items: items,
      },
      OriginalName: editingTrainerOriginalName || undefined
    };
    console.log(trainerObj);
    fetch('/save-trainer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainerObj)
    })
      .then(res => {
        console.log(res);
        if (res.ok) {
          saveStatus.textContent = 'Trainer saved to server!';
          saveStatus.style.color = '#16a34a';
          editingTrainerOriginalName = trainerName; // update to new name if changed
          // Clear form after save
          trainerNameInput.value = '';
          imageUrlInput.value = '';
          rankInput.value = '';
          moneyInput.value = '';
          itemsInput.value = '';
          selectedPokemon = [];
          renderSelectedList();
          // Refresh trainers and clear selection
          fetch('/trainer-list')
            .then(res => res.json())
            .then((data: any[]) => {
              allTrainers = data.map((tr: any) => ({
                trainer: {
                  Name: tr.Name,
                  ImageURL: tr.ImageURL || '',
                  Pokemon: Array.isArray(tr.Pokemon) ? tr.Pokemon.map((p: any) => ({ DexID: p.DexID, Number: p.Number })) : [],
                  Rank: tr.Rank || '',
                  Money: typeof tr.Money === 'number' ? tr.Money : 0,
                  Items: Array.isArray(tr.Items) ? tr.Items : [],
                },
                OriginalName: tr.Name
              }));
              populateTrainerSelect();
              trainerSelect.value = '';
            });
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
    allTrainers.forEach(trForm => {
      const opt = document.createElement('option');
      opt.value = trForm.trainer.Name;
      opt.textContent = trForm.trainer.Name;
      trainerSelect.appendChild(opt);
    });
  }

  // Populate Trainer Rank dropdown sorted by RecommendedRankNumber
  function populateRankDropdown() {
    console.log("hello");
    // Get all enum values (keys) and sort by RecommendedRankNumber
    const rankEntries = Object.values(RecommendedRank)
      .filter(v => typeof v === 'string')
      .sort((a, b) => (RecommendedRankNumber[a as RecommendedRank] ?? 0) - (RecommendedRankNumber[b as RecommendedRank] ?? 0));
    console.log(rankEntries);
      rankInput.innerHTML = '<option value="">-- Select Rank --</option>';
    rankEntries.forEach(rank => {
      const opt = document.createElement('option');
      opt.value = rank;
      opt.textContent = rank;
      rankInput.appendChild(opt);
    });
  }

  // Call this after DOMContentLoaded
  populateRankDropdown();

  // Fetch all trainers on load
  fetch('/trainer-list')
    .then(res => res.json())
    .then((data: any[]) => {
      allTrainers = data.map((tr: any) => ({
        trainer: {
          Name: tr.Name,
          ImageURL: tr.ImageURL || '',
          Pokemon: Array.isArray(tr.Pokemon) ? tr.Pokemon.map((p: any) => ({ DexID: p.DexID, Number: p.Number })) : [],
          Rank: tr.Rank || '',
          Money: typeof tr.Money === 'number' ? tr.Money : 0,
          Items: Array.isArray(tr.Items) ? tr.Items : [],
        },
        OriginalName: tr.Name
      }));
      populateTrainerSelect();
    });

  trainerSelect.addEventListener('change', () => {
    const selected = allTrainers.find(t => t.trainer.Name === trainerSelect.value);
    if (selected) {
      loadTrainerToForm(selected);
      saveStatus.textContent = `Editing trainer: ${selected.trainer.Name}`;
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
