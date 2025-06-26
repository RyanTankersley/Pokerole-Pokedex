import { Pokemon, RecommendedRank } from './pokemon.js';

export type AttributeType = 'attribute' | 'social' | 'skill';

export interface PokemonAttribute {
    type: AttributeType;
    key: string; // e.g. 'Strength', 'Tough', 'Brawl'
    label: string; // Human-readable label
    value: number;
    min: number;
    max: number;
}

export interface TrainerPokemon {
    DexID: string;
    Number: number;
    Victories: number;
    CurrentRank?: RecommendedRank;
    attributes: PokemonAttribute[];
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
    // You may want to pull min/max from poke or game rules
    const attributes: PokemonAttribute[] = [
        // Core attributes
        { type: 'attribute', key: 'Strength', label: 'Strength', value: 1, min: 1, max: 5 },
        { type: 'attribute', key: 'Dexterity', label: 'Dexterity', value: 1, min: 1, max: 5 },
        { type: 'attribute', key: 'Vitality', label: 'Vitality', value: 1, min: 1, max: 5 },
        { type: 'attribute', key: 'Special', label: 'Special', value: 1, min: 1, max: 5 },
        { type: 'attribute', key: 'Insight', label: 'Insight', value: 1, min: 1, max: 5 },
        // Social attributes
        { type: 'social', key: 'Tough', label: 'Tough', value: 1, min: 1, max: 5 },
        { type: 'social', key: 'Cool', label: 'Cool', value: 1, min: 1, max: 5 },
        { type: 'social', key: 'Beauty', label: 'Beauty', value: 1, min: 1, max: 5 },
        { type: 'social', key: 'Clever', label: 'Clever', value: 1, min: 1, max: 5 },
        { type: 'social', key: 'Cute', label: 'Cute', value: 1, min: 1, max: 5 },
        // Skills
        { type: 'skill', key: 'Brawl', label: 'Brawl', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Channel', label: 'Channel', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Clash', label: 'Clash', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Evasion', label: 'Evasion', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Alert', label: 'Alert', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Athletic', label: 'Athletic', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Nature', label: 'Nature', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Stealth', label: 'Stealth', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Allure', label: 'Allure', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Etiquette', label: 'Etiquette', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Intimidate', label: 'Intimidate', value: 1, min: 0, max: 5 },
        { type: 'skill', key: 'Perform', label: 'Perform', value: 1, min: 0, max: 5 },
    ];
    return {
        DexID: poke.DexID,
        Number: poke.Number,
        Victories: 0,
        CurrentRank: undefined,
        attributes
    };
}