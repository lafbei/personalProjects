// src/components/Assets.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Factory as FactoryIcon, Wheat, Sprout } from "lucide-react";

// ---------------- Types ----------------
export type CountryName = "France" | "Britain" | "Russia" | "Austria-Hungary" | "German Empire";

export type Good =
  | "Grain" | "Coal" | "Iron" | "Timber" | "Cotton" | "Steel" | "Textiles" | "Artillery"
  | "Silk" | "Dye" | "Engines" | "Tools" | "Explosives" | "Sulfur" | "Lead" | "Oil"
  | "Groceries" | "Clothes" | "Furniture";

export type AssetKind = "Factory" | "Plantation" | "Rural";

export type ProductionProfile = {
  inputs?: Partial<Record<Good, number>>;
  outputs?: Partial<Record<Good, number>>;
};

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  owner: CountryName | null;
  // removed: region, status, level, upkeep
  colonization?: { progress: number; required: number }; // for Plantation/Rural when neutral
  production?: ProductionProfile; // mainly for Factory (but allowed for others)
  buildCost?: Partial<Record<Good, number>>;
}

// --------------- Icons for kinds ---------------
const KindIcon: Record<AssetKind, React.ReactNode> = {
  Factory: <FactoryIcon className="h-4 w-4" />,
  Plantation: <Wheat className="h-4 w-4" />,
  Rural: <Sprout className="h-4 w-4" />,
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

// --------------- Component ---------------
export type AssetCardProps = {
  asset: Asset;
  currentCountry: CountryName;

  // Pass exactly ONE of these to make the card clickable for that action
  onBuild?: (id: string) => void;
  onColonize?: (id: string) => void;
  onConquer?: (id: string) => void;
  onOperate?: (id: string) => void;

  disabledReason?: string; // disables click
};

export default function AssetCard({
  asset,
  currentCountry,
  onBuild,
  onColonize,
  onConquer,
  onOperate,
  disabledReason,
}: AssetCardProps) {
  const isOwnedByMe = asset.owner === currentCountry;
  const isNeutral = asset.owner === null;

  // Availability rules with simplified model
  const canBuild =
    asset.kind === "Factory" && isNeutral && !!onBuild; // build only unowned factories

  const canColonize =
    (asset.kind === "Plantation" || asset.kind === "Rural") &&
    isNeutral &&
    !!asset.colonization &&
    asset.colonization.progress < asset.colonization.required &&
    !!onColonize;

  const canConquer =
    (asset.kind === "Plantation" || asset.kind === "Rural") &&
    !!asset.owner &&
    !isOwnedByMe &&
    !!onConquer;

  const canOperate = isOwnedByMe && !!asset.production && !!onOperate;

  // Card becomes clickable only when exactly one action applies
  const candidates: Array<() => void> = [];
  if (canBuild) candidates.push(() => onBuild!(asset.id));
  if (canColonize) candidates.push(() => onColonize!(asset.id));
  if (canConquer) candidates.push(() => onConquer!(asset.id));
  if (canOperate) candidates.push(() => onOperate!(asset.id));

  const clickable = !disabledReason && candidates.length === 1;
  const handleClick = clickable ? candidates[0] : undefined;

  return (
    <Card
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick?.();
              }
            }
          : undefined
      }
      className={[
        "shadow-sm transition",
        clickable
          ? "cursor-pointer ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400"
          : "",
        disabledReason ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
      title={disabledReason}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {KindIcon[asset.kind]}
            {asset.name}
            <span className="text-xs text-slate-500">• {asset.kind}</span>
          </CardTitle>
          {/* removed: Level */}
        </div>
        <CardDescription>
          <span className="mr-2">Owner: {asset.owner ?? "—"}</span>
          {/* removed: Region / Status */}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Production (shown if present) */}
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

        {/* Build Cost (keep) */}
        {asset.buildCost && (
          <div className="rounded-xl border p-3 bg-white">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Build Cost</div>
            {fmtGoods(asset.buildCost)}
          </div>
        )}

        {/* Colonization progress (Plantation/Rural) */}
        {(asset.kind === "Plantation" || asset.kind === "Rural") && asset.colonization && (
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
        {/* No buttons — click-to-act when a single action applies */}
      </CardContent>
    </Card>
  );
}
