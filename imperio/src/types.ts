export type ScenarioId = "1871";
export type CountryId = "france" | "britain" | "russia" | "austria_hungary" | "german_empire";
export type Asset = import("./components/Asset").Asset;

// src/types.ts
export type GameAction = "IDLE" | "BUILD" | "COLONIZE" | "CAMPAIGN";

export type PlayerId = string;

export interface Factory {
  id: string;
  name: string;
  cost: number;
}
export interface Plantation {
  id: string;
  name: string;
  cost: number;
}
export interface Territory {
  id: string;
  name: string;
  cost: number;
  defense: number;
}

export interface PlayerAssets {
  factories: Factory[];
  plantations: Plantation[];
  territories: Territory[];
}

export interface Player {
  id: PlayerId;
  name: string;
  gold: number;
  vp: number;
  assets: PlayerAssets;
}
