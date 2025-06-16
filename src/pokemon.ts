export interface Pokemon {
    Number:              number;
    DexID:               string;
    Name:                string;
    Type1:               Type;
    Type2:               Type;
    BaseHP:              number;
    Strength:            number;
    MaxStrength:         number;
    Dexterity:           number;
    MaxDexterity:        number;
    Vitality:            number;
    MaxVitality:         number;
    Special:             number;
    MaxSpecial:          number;
    Insight:             number;
    MaxInsight:          number;
    Ability1:            string;
    Ability2:            string;
    HiddenAbility:       string;
    EventAbilities:      EventAbilities;
    RecommendedRank:     RecommendedRank;
    GenderType:          GenderType;
    Legendary:           boolean;
    GoodStarter:         boolean;
    _id:                 string;
    DexCategory:         string;
    Height:              Height;
    Weight:              Weight;
    DexDescription:      string;
    BookImageName?:      string;
    BookShinyImageName?: string;
    Evolutions:          Evolution[];
    Image:               string;
    Moves:               Move[];
}

export enum EventAbilities {
    BattleBond = "Battle Bond",
    Empty = "",
    OwnTempo = "Own Tempo",
}

export interface Evolution {
    To?:      string;
    Kind:     Kind;
    Speed?:   Speed;
    From?:    string;
    Item?:    string;
    Stat?:    Stat;
    Value?:   number;
    Region?:  Region;
    Special?: string;
    Move?:    string;
    Gender?:  Gender;
    Game?:    string;
}

export enum Gender {
    Female = "Female",
    Male = "Male",
}

export enum Kind {
    Form = "Form",
    Item = "Item",
    Level = "Level",
    Mega = "Mega",
    Special = "Special",
    Stat = "Stat",
    Stone = "Stone",
    Trade = "Trade",
}

export enum Region {
    Alola = "Alola",
    Galar = "Galar",
}

export enum Speed {
    Fast = "Fast",
    Medium = "Medium",
    Slow = "Slow",
    Unknown = "Unknown",
}

export enum Stat {
    Beauty = "Beauty",
    Dexterity = "Dexterity",
    Happiness = "Happiness",
    Loyalty = "Loyalty",
    Strength = "Strength",
    Vitality = "Vitality",
}

export enum GenderType {
    Empty = "",
    F = "F",
    M = "M",
    N = "N",
}

export interface Height {
    Meters: number;
    Feet:   number;
}

export interface Move {
    Learned: RecommendedRank;
    Name:    string;
}

export enum RecommendedRank {
    Ace = "Ace",
    Amateur = "Amateur",
    Beginner = "Beginner",
    Master = "Master",
    Pro = "Pro",
    Starter = "Starter",
}

export enum Type {
    Bug = "Bug",
    Dark = "Dark",
    Dragon = "Dragon",
    Electric = "Electric",
    Empty = "",
    Fairy = "Fairy",
    Fighting = "Fighting",
    Fire = "Fire",
    Flying = "Flying",
    Ghost = "Ghost",
    Grass = "Grass",
    Ground = "Ground",
    Ice = "Ice",
    Normal = "Normal",
    Poison = "Poison",
    Psychic = "Psychic",
    Rock = "Rock",
    Steel = "Steel",
    Water = "Water",
}

export interface Weight {
    Kilograms: number;
    Pounds:    number;
}