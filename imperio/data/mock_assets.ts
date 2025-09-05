import type { Asset } from "../src/types";

// ---------------- Mock Data (optional for quick testing) ----------------
export const MOCK_ASSETS: Asset[] = [
  {
    id: "ruhr-steelworks",
    name: "Ruhr Steelworks",
    kind: "Factory",
    region: "Ruhr",
    owner: "German Empire",
    level: 1,
    status: "Operational",
    production: {
      inputs: { Coal: 2, Iron: 2 },
      outputs: { Steel: 2 },
    },
    upkeep: { Coal: 1 },
  },
  {
    id: "bombay-cotton",
    name: "Bombay Cotton Mill",
    kind: "Factory",
    region: "Bombay",
    owner: null,
    level: 0,
    status: "Planned",
    buildCost: { Timber: 2, Iron: 1 },
    production: {
      inputs: { Cotton: 2 },
      outputs: { Textiles: 2 },
    },
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
  {
    id: "alsace-fort",
    name: "Fort of Belfort",
    kind: "Fort",
    region: "Alsace",
    owner: "France",
    level: 1,
    status: "Damaged",
    conquerable: true,
  },
];

// ---------------- Example usage ----------------
// <AssetCard
//   asset={MOCK_ASSETS[0]}
//   currentCountry="German Empire"
//   onOperate={(id) => console.log("Operate", id)}
//   onUpgrade={(id) => console.log("Upgrade", id)}
// />
