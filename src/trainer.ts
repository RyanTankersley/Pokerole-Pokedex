import { Pokemon, RecommendedRank } from './pokemon.js';

export enum AttributeType { 
    Attribute = 'Attribute',
    Social = 'Social',
    Skill = 'Skill'
}

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
        { type: AttributeType.Attribute, key: 'Strength', label: 'Strength', value: 1, min: poke.Strength, max: poke.MaxStrength },
        { type: AttributeType.Attribute, key: 'Dexterity', label: 'Dexterity', value: 1, min: poke.Dexterity, max: poke.MaxDexterity },
        { type: AttributeType.Attribute, key: 'Vitality', label: 'Vitality', value: 1, min: poke.Vitality, max: poke.MaxVitality },
        { type: AttributeType.Attribute, key: 'Special', label: 'Special', value: 1, min: poke.Special, max: poke.MaxSpecial },
        { type: AttributeType.Attribute, key: 'Insight', label: 'Insight', value: 1, min: poke.Insight, max: poke.MaxInsight },
        // Social attributes
        { type: AttributeType.Social, key: 'Tough', label: 'Tough', value: 1, min: 1, max: 5 },
        { type: AttributeType.Social, key: 'Cool', label: 'Cool', value: 1, min: 1, max: 5 },
        { type: AttributeType.Social, key: 'Beauty', label: 'Beauty', value: 1, min: 1, max: 5 },
        { type: AttributeType.Social, key: 'Clever', label: 'Clever', value: 1, min: 1, max: 5 },
        { type: AttributeType.Social, key: 'Cute', label: 'Cute', value: 1, min: 1, max: 5 },
        // Skills
        { type: AttributeType.Skill, key: 'Brawl', label: 'Brawl', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Channel', label: 'Channel', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Clash', label: 'Clash', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Evasion', label: 'Evasion', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Alert', label: 'Alert', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Athletic', label: 'Athletic', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Nature', label: 'Nature', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Stealth', label: 'Stealth', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Allure', label: 'Allure', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Etiquette', label: 'Etiquette', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Intimidate', label: 'Intimidate', value: 1, min: 0, max: 5 },
        { type: AttributeType.Skill, key: 'Perform', label: 'Perform', value: 1, min: 0, max: 5 },
    ];
    return {
        DexID: poke.DexID,
        Number: poke.Number,
        Victories: 0,
        CurrentRank: undefined,
        attributes
    };
}