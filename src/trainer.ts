import { Pokemon, RecommendedRank } from './pokemon.js';

export interface Trainer {
    Name:    string;
    ImageURL: string;
    Pokemon: Pokemon[];
    Rank: RecommendedRank;
    Money: number;
    Items: string[];
}