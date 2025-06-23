import { Pokemon, RecommendedRank } from './pokemon.js';

export interface TrainerPokemon {
    DexID: string;
    Number: number;
    Victories: number;
    CurrentRank?: RecommendedRank;
    CurrentStrength?: number;
    CurrentDexterity?: number;
    CurrentVitality?: number;
    CurrentSpecial?: number;
    CurrentInsight?: number;
    // Social attributes
    CurrentTough?: number;
    CurrentCool?: number;
    CurrentBeauty?: number;
    CurrentClever?: number;
    CurrentCute?: number;
    // Skill fields
    SkillBrawl?: number;
    SkillChannel?: number;
    SkillClash?: number;
    SkillEvasion?: number;
    SkillAlert?: number;
    SkillAthletic?: number;
    SkillNature?: number;
    SkillStealth?: number;
    SkillAllure?: number;
    SkillEtiquette?: number;
    SkillIntimidate?: number;
    SkillPerform?: number;
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
        Victories: 0,
        CurrentRank: undefined,
        CurrentStrength: 1,
        CurrentDexterity: 1,
        CurrentVitality: 1,
        CurrentSpecial: 1,
        CurrentInsight: 1,
        // Social attributes
        CurrentTough: 1,
        CurrentCool: 1,
        CurrentBeauty: 1,
        CurrentClever: 1,
        CurrentCute: 1,
        // Skill fields
        SkillBrawl: 1,
        SkillChannel: 1,
        SkillClash: 1,
        SkillEvasion: 1,
        SkillAlert: 1,
        SkillAthletic: 1,
        SkillNature: 1,
        SkillStealth: 1,
        SkillAllure: 1,
        SkillEtiquette: 1,
        SkillIntimidate: 1,
        SkillPerform: 1
    };
}