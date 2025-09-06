// src/data/starting_assets.ts
import type { Asset } from "../src/components/Asset";

export const STARTING_ASSETS: Asset[] = [
  // --- Austria-Hungary ---
  {
    id: "budapest-steelworks",
    name: "Budapest Steelworks",
    kind: "Factory",
    region: "Budapest",
    owner: "Austria-Hungary",
    level: 1,
    status: "Operational",
    production: { inputs: { Coal: 1, Iron: 1 }, outputs: { Steel: 1 } },
  },
  {
    id: "galicia-timber",
    name: "Galicia Timber Camp",
    kind: "Plantation",
    region: "Galicia",
    owner: "Austria-Hungary",
    level: 1,
    status: "Operational",
    production: { outputs: { Timber: 2 } },
  },

  // --- France ---
  {
    id: "alsace-artillery-works",
    name: "Alsace Artillery Works",
    kind: "Factory",
    region: "Alsace",
    owner: "France",
    level: 1,
    status: "Operational",
    production: { inputs: { Steel: 1 }, outputs: { Artillery: 1 } },
  },
  {
    id: "belfort-fort",
    name: "Fort of Belfort",
    kind: "Fort",
    region: "Alsace",
    owner: "France",
    level: 1,
    status: "Operational",
  },

  // --- Britain ---
  {
    id: "manchester-textiles",
    name: "Manchester Textile Mill",
    kind: "Factory",
    region: "Manchester",
    owner: "Britain",
    level: 1,
    status: "Operational",
    production: { inputs: { Cotton: 2 }, outputs: { Textiles: 2 } },
  },
  {
    id: "liverpool-port",
    name: "Liverpool Port",
    kind: "Port",
    region: "Liverpool",
    owner: "Britain",
    level: 1,
    status: "Operational",
  },

  // --- German Empire ---
  {
    id: "ruhr-steelworks",
    name: "Ruhr Steelworks",
    kind: "Factory",
    region: "Ruhr",
    owner: "German Empire",
    level: 1,
    status: "Operational",
    production: { inputs: { Coal: 2, Iron: 2 }, outputs: { Steel: 2 } },
  },
  {
    id: "silesian-coal",
    name: "Silesian Coal Mine",
    kind: "Mine",
    region: "Silesia",
    owner: "German Empire",
    level: 1,
    status: "Operational",
    production: { outputs: { Coal: 2 } },
  },

  // --- Russia ---
  {
    id: "ural-iron",
    name: "Ural Iron Mine",
    kind: "Mine",
    region: "Urals",
    owner: "Russia",
    level: 1,
    status: "Operational",
    production: { outputs: { Iron: 2 } },
  },
  {
    id: "st-petersburg-port",
    name: "St. Petersburg Port",
    kind: "Port",
    region: "St. Petersburg",
    owner: "Russia",
    level: 1,
    status: "Operational",
  },

  // --- Neutral / buildable / colonizable ---
  {
    id: "bombay-cotton",
    name: "Bombay Cotton Mill",
    kind: "Factory",
    region: "Bombay",
    owner: null,
    level: 0,
    status: "Planned",
    buildCost: { Timber: 2, Iron: 1 },
    production: { inputs: { Cotton: 2 }, outputs: { Textiles: 2 } },
  },
  {
    id: "congo-outpost",
    name: "Congo Outpost",
    kind: "Colony",
    region: "Lower Congo",
    owner: null,
    level: 0,
    status: "Uncontrolled",
    colonization: { progress: 1, required: 5 },
    conquerable: true,
  },
];
