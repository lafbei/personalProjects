import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Factory,
  Pickaxe,
  Ship,
  Wheat,
  Building2,
  Castle,
  MapPinned,
  Hammer,
  Swords,
} from "lucide-react";

// ---------------- Types ----------------
export type CountryName = "France" | "Britain" | "Russia" | "Austria-Hungary" | "German Empire";

export type Good =
  | "Grain"
  | "Coal"
  | "Iron"
  | "Timber"
  | "Cotton"
  | "Steel"
  | "Textiles"
  | "Artillery";

export type AssetKind = "Factory" | "Mine" | "Plantation" | "Railway" | "Port" | "Colony" | "Fort";

export type ProductionProfile = {
  inputs?: Partial<Record<Good, number>>;
  outputs?: Partial<Record<Good, number>>;
};

export type AssetStatus =
  | "Planned"
  | "UnderConstruction"
  | "Operational"
  | "Damaged"
  | "Uncontrolled"; // exists on map but not owned/usable

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  region: string; // e.g. "Alsace", "Bengal", "Ruhr"
  owner: CountryName | null;
  level: number; // upgrade level / capacity
  status: AssetStatus;
  conquerable?: boolean; // default true
  colonization?: { progress: number; required: number }; // only for kind === "Colony" (or neutral outposts)
  production?: ProductionProfile; // used by Operate later
  buildCost?: Partial<Record<Good, number>>;
  upkeep?: Partial<Record<Good, number>>;
}

// --------------- Icons for kinds ---------------
const KindIcon: Record<AssetKind, React.ReactNode> = {
  Factory: <Factory className="h-4 w-4" />,
  Mine: <Pickaxe className="h-4 w-4" />,
  Plantation: <Wheat className="h-4 w-4" />,
  Railway: <Building2 className="h-4 w-4" />,
  Port: <Ship className="h-4 w-4" />,
  Colony: <MapPinned className="h-4 w-4" />,
  Fort: <Castle className="h-4 w-4" />,
};

// --------------- Helpers ---------------
function fmtGoods(record?: Partial<Record<Good, number>>) {
  if (!record) return "—";
  const entries = Object.entries(record) as [Good, number][];
  if (!entries.length) return "—";
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([g, n]) => (
        <span key={g} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
          {g} <span className="tabular-nums">{n}</span>
        </span>
      ))}
    </div>
  );
}

function statusLabel(s: AssetStatus) {
  switch (s) {
    case "Planned":
      return "Planned";
    case "UnderConstruction":
      return "Under construction";
    case "Operational":
      return "Operational";
    case "Damaged":
      return "Damaged";
    case "Uncontrolled":
      return "Uncontrolled";
  }
}

// --------------- Component ---------------
export type AssetCardProps = {
  asset: Asset;
  currentCountry: CountryName;
  // Turn-logic integration via callbacks (GameView will decide legality / consume action points)
  onBuild?: (id: string) => void;
  onColonize?: (id: string) => void;
  onConquer?: (id: string) => void;
  onOperate?: (id: string) => void;
  onUpgrade?: (id: string) => void;
  // Optional external disabling (e.g., if a different action was chosen this activation)
  disabledReason?: string;
};

export default function AssetCard({
  asset,
  currentCountry,
  onBuild,
  onColonize,
  onConquer,
  onOperate,
  onUpgrade,
  disabledReason,
}: AssetCardProps) {
  const isOwnedByMe = asset.owner === currentCountry;
  const isNeutral = asset.owner === null;
  const conquerable = asset.conquerable ?? true;

  // Default availability rules (game state can still override by not wiring callbacks)
  const canBuild = (isOwnedByMe || isNeutral) && asset.status === "Planned" && !!onBuild;
  const canColonize =
    asset.kind === "Colony" &&
    isNeutral &&
    asset.colonization &&
    asset.colonization.progress < asset.colonization.required &&
    !!onColonize;
  const canConquer = !!asset.owner && !isOwnedByMe && conquerable && !!onConquer;
  const canOperate =
    isOwnedByMe && asset.status === "Operational" && !!asset.production && !!onOperate;
  const canUpgrade = isOwnedByMe && asset.status === "Operational" && !!onUpgrade;

  const globallyDisabled = !!disabledReason;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {KindIcon[asset.kind]}
            {asset.name}
            <span className="text-xs text-slate-500">• {asset.kind}</span>
          </CardTitle>
          <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Lv {asset.level}
          </div>
        </div>
        <CardDescription>
          <span className="mr-2">Region: {asset.region}</span>
          <span className="mr-2">Owner: {asset.owner ?? "—"}</span>
          <span>Status: {statusLabel(asset.status)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Production */}
        {asset.production && (
          <div className="rounded-xl border p-3 bg-white">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Production</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Inputs</div>
                {fmtGoods(asset.production.inputs)}
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Outputs</div>
                {fmtGoods(asset.production.outputs)}
              </div>
            </div>
          </div>
        )}

        {/* Costs */}
        {(asset.buildCost || asset.upkeep) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {asset.buildCost && (
              <div className="rounded-xl border p-3 bg-white">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Build Cost
                </div>
                {fmtGoods(asset.buildCost)}
              </div>
            )}
            {asset.upkeep && (
              <div className="rounded-xl border p-3 bg-white">
                <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Upkeep</div>
                {fmtGoods(asset.upkeep)}
              </div>
            )}
          </div>
        )}

        {/* Colonization progress */}
        {asset.kind === "Colony" && asset.colonization && (
          <div className="rounded-xl border p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wide text-slate-500">Colonization</div>
              <div className="text-xs tabular-nums text-slate-600">
                {asset.colonization.progress}/{asset.colonization.required}
              </div>
            </div>
            <Progress value={(asset.colonization.progress / asset.colonization.required) * 100} />
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            disabled={globallyDisabled || !canBuild}
            onClick={() => onBuild && onBuild(asset.id)}
            title={disabledReason || (canBuild ? "Build this asset" : "Can't build now")}
            className="rounded-2xl"
          >
            <Hammer className="h-4 w-4 mr-2" /> Build
          </Button>

          <Button
            variant="secondary"
            disabled={globallyDisabled || !canOperate}
            onClick={() => onOperate && onOperate(asset.id)}
            title={disabledReason || (canOperate ? "Operate this asset" : "Can't operate now")}
            className="rounded-2xl"
          >
            <Factory className="h-4 w-4 mr-2" /> Operate
          </Button>

          <Button
            variant="outline"
            disabled={globallyDisabled || !canColonize}
            onClick={() => onColonize && onColonize(asset.id)}
            title={disabledReason || (canColonize ? "Advance colonization" : "Can't colonize now")}
            className="rounded-2xl"
          >
            <MapPinned className="h-4 w-4 mr-2" /> Colonize
          </Button>

          <Button
            variant="destructive"
            disabled={globallyDisabled || !canConquer}
            onClick={() => onConquer && onConquer(asset.id)}
            title={disabledReason || (canConquer ? "Attempt conquest" : "Can't conquer now")}
            className="rounded-2xl"
          >
            <Swords className="h-4 w-4 mr-2" /> Campaign
          </Button>

          <Button
            variant="outline"
            disabled={globallyDisabled || !canUpgrade}
            onClick={() => onUpgrade && onUpgrade(asset.id)}
            title={disabledReason || (canUpgrade ? "Upgrade this asset" : "Can't upgrade now")}
            className="rounded-2xl"
          >
            Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------- Mock Data (optional for quick testing) ----------------
// Moved MOCK_ASSETS to a separate file 'mockAssets.ts' to enable Fast Refresh compatibility.

// ---------------- Example usage ----------------
// import { MOCK_ASSETS } from "./mockAssets";
// <AssetCard
//   asset={MOCK_ASSETS[0]}
//   currentCountry="German Empire"
//   onOperate={(id) => console.log("Operate", id)}
//   onUpgrade={(id) => console.log("Upgrade", id)}
// />
