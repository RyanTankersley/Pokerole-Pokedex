import { Pokemon, PokemonType, PokemonTypeColor, RecommendedRank, RecommendedRankInfo, RecommendedRanks } from './pokemon.js';
import { createPokemonCard } from './domComponents.js';
import { Trainer, TrainerPokemon } from './trainer.js';
let trainerData: any[] = []; // Store trainer data globally

fetch('/trainer-list')
  .then(res => res.json())
  .then((trainers: any[]) => {
    trainerData = trainers;

    // Collect all unique dex ids of all the pokemon of all the trainers
    const trainerDexIds = new Set<string>();
    trainers.forEach(trainer => {
      const t = trainer as Trainer;
      if (t.IsPlayerCharacter && Array.isArray(t.Pokemon)) {
        t.Pokemon.forEach((p: TrainerPokemon) => {
          trainerDexIds.add(p.DexID);
        });
      }
    });

    // Now load pokedex after trainers are loaded
    fetch('/pokedex-list')
      .then(response => response.json())
      .then((pokemonArray: Pokemon[]) => {
        const pokedexDiv = document.getElementById('pokedex');
        if (!pokedexDiv) return;

        // Populate rank filter dropdown sorted by RecommendedRankNumber
        const rankFilter = document.getElementById('rank-filter') as HTMLSelectElement;
        if (rankFilter) {
          const rankEntries = Object.values(RecommendedRank)
            .filter(v => typeof v === 'string')
            .sort((a, b) => (RecommendedRanks[a as RecommendedRank].number ?? 0) - (RecommendedRanks[b as RecommendedRank].number ?? 0));
          rankEntries.forEach(rank => {
            const opt = document.createElement('option');
            opt.value = rank;
            opt.textContent = rank;
            rankFilter.appendChild(opt);
          });
        }

        // Detect if we are on the print page
        const isPrintPage = window.location.pathname.endsWith('pokedex-print.html');

        // Track selected Pokémon DexIDs
        const selectedDexIds = new Set<string>();

        function renderCards(showTrainerOnly: boolean, typeFilter: string = '', nameFilter: string = '', rankFilterVal: string = '') {
          if (!pokedexDiv) return;
          pokedexDiv.innerHTML = '';
          // Always show selected Pokémon, even if they don't match filters
          const selectedPokemon = pokemonArray.filter(p => selectedDexIds.has(p.DexID));
          // Filtered Pokémon (excluding already selected)
          const filtered = pokemonArray.slice(1).filter((pokemon: Pokemon) => {
            if (selectedDexIds.has(pokemon.DexID)) return false; // already included
            const isTrainerPokemon = trainerDexIds.has(pokemon.DexID);
            let showDetails = true;
            if ((isPrintPage || showTrainerOnly) && !isTrainerPokemon) showDetails = false;
            if (
              typeFilter &&
              pokemon.Type1 !== typeFilter &&
              pokemon.Type2 !== typeFilter
            ) {
              return false;
            }
            if (
              rankFilterVal &&
              pokemon.RecommendedRank !== rankFilterVal
            ) {
              return false;
            }
            if (
              nameFilter &&
              !pokemon.Name.toLowerCase().includes(nameFilter.toLowerCase())
            ) {
              return false;
            }
            return true;
          });
          // Render selected Pokémon first
          selectedPokemon.forEach((pokemon: Pokemon) => {
            const card = createPokemonCard(pokemon, { showDetails: true });
            if (!isPrintPage) {
              card.style.outline = '3px solid #f59e42';
              card.style.boxShadow = '0 0 0 3px #fde68a';
              card.style.background = '#fffbe6';
            }
            card.addEventListener('click', () => {
              selectedDexIds.delete(pokemon.DexID);
              rerender();
            });
            pokedexDiv.appendChild(card);
          });
          // Then render filtered Pokémon
          filtered.forEach((pokemon: Pokemon) => {
            const isTrainerPokemon = trainerDexIds.has(pokemon.DexID);
            let showDetails = true;
            if ((isPrintPage || showTrainerOnly) && !isTrainerPokemon) showDetails = false;
            const card = createPokemonCard(pokemon, { showDetails });
            card.addEventListener('click', () => {
              selectedDexIds.add(pokemon.DexID);
              rerender();
            });
            pokedexDiv.appendChild(card);
          });
        }

        // Initial render: show all details or only trainer if print page
        renderCards(isPrintPage);

        // Add event listeners for radio buttons and filters
        const showAllRadio = document.getElementById('show-all') as HTMLInputElement;
        const showTrainerRadio = document.getElementById('show-trainer') as HTMLInputElement;
        const typeFilter = document.getElementById('type-filter') as HTMLSelectElement;
        const nameSearch = document.getElementById('name-search') as HTMLInputElement;

        function getCurrentFilters() {
          return {
            showTrainerOnly: !!(showTrainerRadio && showTrainerRadio.checked),
            type: typeFilter ? typeFilter.value : '',
            rank: rankFilter ? rankFilter.value : '',
            name: nameSearch ? nameSearch.value.trim() : ''
          };
        }

        function rerender() {
          const { showTrainerOnly, type, rank, name } = getCurrentFilters();
          // Force showTrainerOnly to true if on print page
          renderCards(isPrintPage ? true : showTrainerOnly, type, name, rank);
        }

        if (showAllRadio && showTrainerRadio) {
          showAllRadio.addEventListener('change', rerender);
          showTrainerRadio.addEventListener('change', rerender);
        }
        if (typeFilter) {
          typeFilter.addEventListener('change', rerender);
        }
        if (rankFilter) {
          rankFilter.addEventListener('change', rerender);
        }
        if (nameSearch) {
          nameSearch.addEventListener('input', rerender);
        }
        // Initial render: show all details
        rerender();
      })
      .catch(err => {
        const pokedexDiv = document.getElementById('pokedex');
        if (pokedexDiv) pokedexDiv.innerHTML = 'Failed to load pokedex data.';
      });
  })
  .catch(err => {
        console.log(err);
    const pokedexDiv = document.getElementById('pokedex');
    if (pokedexDiv) pokedexDiv.innerHTML = 'Failed to load trainer data.';
  });