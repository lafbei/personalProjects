// src/data/starting_assets.ts
import type { Asset } from "../components/Assets";

export const STARTING_ASSETS: Asset[] = [
  // --- Austria-Hungary ---
  {
    id: "budapest-steelworks",
    name: "Budapest Steelworks",
    kind: "Factory",
    owner: "Austria-Hungary",
    production: { inputs: { Coal: 1, Iron: 1 }, outputs: { Steel: 1 } },
  },
  {
    id: "galicia-timber",
    name: "Galicia Timber Camp",
    kind: "Plantation",
    owner: "Austria-Hungary",
    production: { outputs: { Timber: 2 } },
  },

  // --- France ---
  {
    id: "alsace-artillery-works",
    name: "Alsace Artillery Works",
    kind: "Factory",
    owner: "France",
    production: { inputs: { Steel: 1 }, outputs: { Artillery: 1 } },
  },
  {
    id: "champagne-farms",
    name: "Champagne Grain Farms",
    kind: "Rural",
    owner: "France",
    production: { outputs: { Grain: 2 } },
  },

  // --- Britain ---
  {
    id: "manchester-textiles",
    name: "Manchester Textile Mill",
    kind: "Factory",
    owner: "Britain",
    production: { inputs: { Cotton: 2 }, outputs: { Textiles: 2 } },
  },
  {
    id: "northumberland-coal",
    name: "Northumberland Coal Field",
    kind: "Rural",
    owner: "Britain",
    production: { outputs: { Coal: 2 } },
  },

  // --- German Empire ---
  {
    id: "ruhr-steelworks",
    name: "Ruhr Steelworks",
    kind: "Factory",
    owner: "German Empire",
    production: { inputs: { Coal: 2, Iron: 2 }, outputs: { Steel: 2 } },
  },
  {
    id: "silesian-coal",
    name: "Silesian Coal Basin",
    kind: "Rural",
    owner: "German Empire",
    production: { outputs: { Coal: 2 } },
  },

  // --- Russia ---
  {
    id: "ural-iron",
    name: "Ural Iron Works",
    kind: "Rural",
    owner: "Russia",
    production: { outputs: { Iron: 2 } },
  },
  {
    id: "volga-grain",
    name: "Volga Grain Belt",
    kind: "Rural",
    owner: "Russia",
    production: { outputs: { Grain: 2 } },
  },

  // --- Neutral / buildable / colonizable ---
  {
    id: "bombay-cotton",
    name: "Bombay Cotton Mill",
    kind: "Factory",
    owner: null,
    buildCost: { Timber: 2, Iron: 1 },
    production: { inputs: { Cotton: 2 }, outputs: { Textiles: 2 } },
  },
  {
    id: "congo-plantation",
    name: "Congo Plantation",
    kind: "Plantation",
    owner: null,
    colonization: { progress: 1, required: 5 },
  },
];
