import { Pokemon, PokemonType, PokemonTypeColor, RecommendedRank, RecommendedRankNumber } from './pokemon.js';
import { createPokemonCard } from './domComponents.js';

let trainerData: any[] = []; // Store trainer data globally

fetch('/trainer-list')
  .then(res => res.json())
  .then((trainers: any[]) => {
    trainerData = trainers;

    // Collect all unique dex ids of all the pokemon of all the trainers
    const trainerDexIds = new Set<string>();
    trainers.forEach(trainer => {
      if (Array.isArray(trainer.Pokemon)) {
        trainer.Pokemon.forEach((p: Pokemon) => {
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
            .sort((a, b) => (RecommendedRankNumber[a as RecommendedRank] ?? 0) - (RecommendedRankNumber[b as RecommendedRank] ?? 0));
          rankEntries.forEach(rank => {
            const opt = document.createElement('option');
            opt.value = rank;
            opt.textContent = rank;
            rankFilter.appendChild(opt);
          });
        }

        function renderCards(showTrainerOnly: boolean, typeFilter: string = '', nameFilter: string = '', rankFilterVal: string = '') {
          if (!pokedexDiv) return;
          pokedexDiv.innerHTML = '';
          pokemonArray.slice(1, pokemonArray.length).forEach((pokemon: Pokemon) => {
            const isTrainerPokemon = trainerDexIds.has(pokemon.DexID);
            let showDetails = true;
            if (showTrainerOnly && !isTrainerPokemon) showDetails = false;

            // Type filter
            if (
              typeFilter &&
              pokemon.Type1 !== typeFilter &&
              pokemon.Type2 !== typeFilter
            ) {
              return;
            }
            // Rank filter
            if (
              rankFilterVal &&
              pokemon.RecommendedRank !== rankFilterVal
            ) {
              return;
            }
            // Name filter (case-insensitive, partial match)
            if (
              nameFilter &&
              !pokemon.Name.toLowerCase().includes(nameFilter.toLowerCase())
            ) {
              return;
            }

            const card = createPokemonCard(pokemon, { showDetails });
            pokedexDiv.appendChild(card);
          });
        }

        // Initial render: show all details
        renderCards(false);

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
          renderCards(showTrainerOnly, type, name, rank);
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
    const pokedexDiv = document.getElementById('pokedex');
    if (pokedexDiv) pokedexDiv.innerHTML = 'Failed to load trainer data.';
  });