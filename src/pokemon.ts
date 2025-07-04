export interface Pokemon {
    Number:              number;
    DexID:               string;
    Name:                string;
    Type1:               PokemonType;
    Type2:               PokemonType;
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

export enum PokemonType {
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

export const PokemonTypeColor: Record<PokemonType, string> = {
    [PokemonType.Bug]: "#91A119",
    [PokemonType.Dark]: "#624D4E",
    [PokemonType.Dragon]: "#5060E1",
    [PokemonType.Electric]: "#FAC000",
    [PokemonType.Empty]: "#A8A77A",
    [PokemonType.Fairy]: "#EF70EF",
    [PokemonType.Fighting]: "#FF8000",
    [PokemonType.Fire]: "#E62829",
    [PokemonType.Flying]: "#81B9EF",
    [PokemonType.Ghost]: "#704170",
    [PokemonType.Grass]: "#3FA129",
    [PokemonType.Ground]: "#915121",
    [PokemonType.Ice]: "#3DCEF3",
    [PokemonType.Normal]: "#9FA19F",
    [PokemonType.Poison]: "#9141CB",
    [PokemonType.Psychic]: "#EF4179",
    [PokemonType.Rock]: "#AFA981",
    [PokemonType.Steel]: "#60A1B8",
    [PokemonType.Water]: "#2980EF",
};

export const RecommendedRankNumber: Record<RecommendedRank, number> = {
    [RecommendedRank.Starter]: 1,
    [RecommendedRank.Beginner]: 2,
    [RecommendedRank.Amateur]: 3,
    [RecommendedRank.Ace]: 4,
    [RecommendedRank.Pro]: 4,
    [RecommendedRank.Master]: 6
};