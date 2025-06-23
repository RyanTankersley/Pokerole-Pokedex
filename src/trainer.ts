import { Pokemon, RecommendedRank } from './pokemon.js';

export interface TrainerPokemon {
    DexID: string;
    Number: number;
    Victories: number;
}

export interface Trainer {
    Name:    string;
    ImageURL: string;
    Pokemon: TrainerPokemon[];
    Rank: RecommendedRank;
    Money: number;
    Items: string[];
    IsPlayerCharacter: boolean;
}

// Utility to convert a Pokemon to TrainerPokemon
export function toTrainerPokemon(poke: Pokemon): TrainerPokemon {
    return {
        DexID: poke.DexID,
        Number: poke.Number,
        Victories: 0
    };
}