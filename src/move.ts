export interface Move {
  Name: string
  Type: string
  Power: number
  Damage1: string
  Damage2: string
  Accuracy1: string
  Accuracy2: string
  Target: string
  Effect: string
  Description: string
  _id: string
  Attributes?: Attributes
  AddedEffects?: AddedEffects
  Category: string
}

export interface Attributes {
  Priority?: number
  AlwaysCrit?: boolean
  AccuracyReduction?: number
  Lethal?: boolean
  BlockDamagePool?: number
  Recoil?: boolean
  ShieldMove?: boolean
  SwitcherMove?: boolean
  SuccessiveActions?: boolean
  NeverFail?: boolean
  SoundBased?: boolean
  PhysicalRanged?: boolean
  FistBased?: boolean
  Rampage?: boolean
  IgnoreDefenses?: boolean
  HighCritical?: boolean
  Charge?: boolean
  DestroyShield?: boolean
  UserFaints?: boolean
  MustRecharge?: boolean
  ResistedWithDefense?: boolean
  IgnoreShield?: boolean
  DoubleAction?: boolean
  ResetTerrain?: boolean
}

export interface AddedEffects {
  Ailments?: Ailment[]
  StatChanges?: StatChange[]
  TerrainEffect?: string
  Heal?: Heal
  FixedDamage?: FixedDamage
  IgnoreShield?: boolean
  AilmentHeal?: string[]
}

export interface Ailment {
  Type: string
  Affects: string
  ChanceDice?: number
  Rounds?: number
  TargetType?: string
}

export interface StatChange {
  Stats: string[]
  Stages: number
  Affects: string
  ChanceDice?: number
}

export interface Heal {
  Type: string
  Target: string
  WillPointCost?: number
  Percentage?: number
}

export interface FixedDamage {
  Type: string
  Value?: number
  MaxValue?: number
  Target: string
}