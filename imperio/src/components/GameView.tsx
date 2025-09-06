import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe2, Flag, History, XCircle, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import AssetCard, { type Asset as AssetType } from "./Asset";
import { STARTING_ASSETS } from "../../data/starting_assets";

// --- Types ---
export type Country = "France" | "Britain" | "Russia" | "Austria-Hungary" | "German Empire";

// ---- Integer market types ----
type MarketGoodKey =
  | "Grain"
  | "Coal"
  | "Iron"
  | "Timber"
  | "Cotton"
  | "Steel"
  | "Textiles"
  | "Artillery";

type MarketGood = {
  key: MarketGoodKey;
  min: number; // integer
  base: number; // integer
  max: number; // integer
  ladder: readonly number[]; // exactly 10 integer steps, ascending, duplicates allowed
};

// 10-point ladders (all integers). Duplicates used for cheaper goods.
const MARKET_GOODS: Record<MarketGoodKey, MarketGood> = {
  Grain: {
    key: "Grain",
    min: 1,
    base: 3,
    max: 5,
    ladder: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  },
  Coal: {
    key: "Coal",
    min: 2,
    base: 6,
    max: 12,
    ladder: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
  },
  Iron: {
    key: "Iron",
    min: 2,
    base: 5,
    max: 10,
    ladder: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10],
  },
  Timber: {
    key: "Timber",
    min: 1,
    base: 3,
    max: 6,
    ladder: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6],
  },
  Cotton: {
    key: "Cotton",
    min: 3,
    base: 7,
    max: 12,
    ladder: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  Steel: {
    key: "Steel",
    min: 5,
    base: 9,
    max: 16,
    ladder: [5, 6, 7, 8, 9, 10, 11, 12, 14, 16],
  },
  Textiles: {
    key: "Textiles",
    min: 3,
    base: 6,
    max: 10,
    ladder: [3, 4, 5, 6, 7, 8, 9, 10, 10, 10],
  },
  Artillery: {
    key: "Artillery",
    min: 10,
    base: 20,
    max: 30,
    ladder: [10, 12, 14, 16, 18, 20, 22, 24, 26, 30],
  },
};

// current market uses an index into the ladder + lastIndex to compute Δ (integer)
type MarketState = Record<MarketGoodKey, { index: number; lastIndex: number }>;

// Fixed turn order
const FIXED_ORDER: Country[] = ["Austria-Hungary", "France", "Britain", "German Empire", "Russia"];

// VP state shape
type VPMap = Record<Country, number>;

// simple VP rewards (tweak later)
const VP_REWARD = {
  Build: 2,
  Operate: 1,
  ColonizeComplete: 5,
  Campaign: 3,
} as const;

function closestIndex(ladder: readonly number[], target: number) {
  let best = 0;
  let diff = Math.abs(ladder[0] - target);
  for (let i = 1; i < ladder.length; i++) {
    const d = Math.abs(ladder[i] - target);
    if (d < diff) {
      best = i;
      diff = d;
    }
  }
  return best;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ACTIONS = ["Build", "Operate", "Colonize", "Campaign", "Congress"] as const;
type ActionType = (typeof ACTIONS)[number];

export type GameViewProps = {
  scenarioId: string; // e.g. "1871"
  selectedCountry: Country; // the human player (for now everyone is manual)
  onExit?: () => void;
};

// Flag emoji helper (temporary until we wire up proper assets)
const countryFlag: Record<Country, string> = {
  France: "🇫🇷",
  Britain: "🇬🇧",
  Russia: "🇷🇺", // placeholder
  "Austria-Hungary": "🇦🇹", // placeholder
  "German Empire": "🏴", // placeholder
};

// --- Main Component ---
export default function GameView({ scenarioId, selectedCountry, onExit }: GameViewProps) {
  // controls the Action Log overlay
  const [showLog, setShowLog] = useState(false);

  // Assets state
  const [assets, setAssets] = useState<AssetType[]>(STARTING_ASSETS);

  // Pending action selection (for asset-targeted actions)
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const [vp, setVP] = useState<VPMap>({
    Britain: 0,
    "German Empire": 0,
    France: 0,
    Russia: 0,
    "Austria-Hungary": 0,
  });
  const [winner, setWinner] = useState<Country | null>(null);

  type GoldMap = Record<Country, number>;

const [gold, setGold] = useState<GoldMap>({
  Britain: 100,
  "German Empire": 100,
  France: 100,
  Russia: 100,
  "Austria-Hungary": 100,
});

// Simple helpers you can call from actions later
function earnGold(c: Country, amount: number) {
  if (amount <= 0) return;
  setGold((prev) => ({ ...prev, [c]: prev[c] + amount }));
}
function spendGold(c: Country, amount: number): boolean {
  if (amount <= 0) return true;
  if (gold[c] < amount) return false;
  setGold((prev) => ({ ...prev, [c]: prev[c] - amount }));
  return true;
}


  // Market state: indices on the 10-step ladders (integers everywhere)
  const [market, setMarket] = useState<MarketState>(() => {
    const entries = Object.values(MARKET_GOODS).map((g) => {
      const idx = closestIndex(g.ladder, g.base);
      return [g.key, { index: idx, lastIndex: idx }] as const;
    });
    return Object.fromEntries(entries) as MarketState;
  });

  // Derived rows for the UI table
  const marketRows = useMemo(
    () =>
      (Object.keys(MARKET_GOODS) as MarketGoodKey[]).map((k) => {
        const g = MARKET_GOODS[k];
        const s = market[k];
        const price = g.ladder[s.index]; // integer
        const last = g.ladder[s.lastIndex]; // integer
        const delta = price - last; // integer change
        const level = s.index + 1; // 1..10
        return { key: k, price, delta, level, min: g.min, base: g.base, max: g.max };
      }),
    [market]
  );

  // (Optional) API to nudge a price up/down by steps (e.g., future Events/Operate effects)
  /*
function nudgePrice(key: MarketGoodKey, steps: number) {
  setMarket((prev) => {
    const s = prev[key];
    const g = MARKET_GOODS[key];
    const nextIndex = Math.min(9, Math.max(0, s.index + steps));
    return { ...prev, [key]: { index: nextIndex, lastIndex: s.index } };
  });
}*/

  const order = FIXED_ORDER;

  const [currentIndex, setCurrentIndex] = useState(0);
  React.useEffect(() => {
    // keep index in range if you ever change order length
    setCurrentIndex((i) => i % order.length);
  }, [order.length]);

  function nextActiveIndex(from: number): number {
    return (from + 1) % order.length;
  }

  const [log, setLog] = useState<
    {
      country: Country;
      action: ActionType;
      targetId?: string;
      targetName?: string;
      note?: string;
      ts: number;
    }[]
  >([]);

  const currentCountry = order[currentIndex];

  // ---------- Action flow ----------
  function performActionClick(action: ActionType) {
    if (winner) return; // game over
    const actor = currentCountry;

    if (action === "Congress") {
      setLog((L) => [{ country: actor, action, ts: Date.now(), note: "Attended Congress" }, ...L]);
      setCurrentIndex((i) => nextActiveIndex(i));
      return;
    }

    // Asset-targeted actions: Build, Operate, Colonize, Campaign
    setPendingAction(action);
  }

  function finalizeAssetAction(action: Exclude<ActionType, "Congress">, target: AssetType) {
    const actor = currentCountry;

    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== target.id) return a;

        if (action === "Build") {
          return { ...a, owner: actor, status: "Operational", level: a.level > 0 ? a.level : 1 };
        }
        if (action === "Operate") {
          return a; // production effects later
        }
        if (action === "Colonize" && a.colonization) {
          const next = a.colonization.progress + 1;
          const complete = next >= a.colonization.required;
          return {
            ...a,
            owner: complete ? actor : a.owner,
            status: complete ? "Operational" : a.status,
            colonization: { ...a.colonization, progress: Math.min(next, a.colonization.required) },
          };
        }
        if (action === "Campaign") {
          return { ...a, owner: actor };
        }
        return a;
      })
    );

    // VP awards (simple placeholders; tune later)
    setVP((prev) => {
      let add = 0;
      if (action === "Build") add = VP_REWARD.Build;
      else if (action === "Operate") add = VP_REWARD.Operate;
      else if (action === "Campaign") add = VP_REWARD.Campaign;
      else if (action === "Colonize") {
        const was = target.colonization?.progress ?? 0;
        const need = target.colonization?.required ?? 0;
        // if this click completes colonization, award completion VP
        if (was + 1 >= need && need > 0) add = VP_REWARD.ColonizeComplete;
      }

      const next = { ...prev, [actor]: prev[actor] + add };
      if (next[actor] >= 100) setWinner(actor);
      return next;
    });

    setLog((L) => [
      { country: actor, action, targetId: target.id, targetName: target.name, ts: Date.now() },
      ...L,
    ]);

    setPendingAction(null);
    setCurrentIndex((i) => nextActiveIndex(i));
  }

  return (
    <>
      <div className="h-full w-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <TopBar
          scenarioId={scenarioId}
          current={currentCountry}
          vp={vp}
          gold={gold}
          winner={winner}
          onExit={onExit}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_360px] gap-4 p-4">
          {/* Left: Turn Order & Prestige */}
          <WorldMarketPanel rows={marketRows} />

          <AssetsPanel
            assets={assets}
            actor={currentCountry}
            pendingAction={pendingAction}
            onCancel={() => setPendingAction(null)}
            onChoose={(action, asset) => finalizeAssetAction(action, asset)}
          />

          {/* Right: Actions */}
          <div className="space-y-4 xl:h-[calc(100vh-96px)]">
            <ActionsPanel
              disabled={!!winner}
              current={currentCountry}
              onPick={performActionClick}
              isHuman={currentCountry === selectedCountry}
            />

            <TurnOrderPanel order={order} current={currentCountry} vp={vp} />
          </div>
        </div>
      </div>
      {showLog && <ActionLogOverlay log={log} onClose={() => setShowLog(false)} />}
    </>
  );
}

// --- Top Bar ---
function TopBar({
  scenarioId,
  current,
  vp,
  gold,
  winner,
  onExit,
}: {
  scenarioId: string;
  current: Country;
  vp: Record<Country, number>;
  gold: Record<Country, number>;
  winner: Country | null;
  onExit?: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur bg-white/70 border-b">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="h-10 w-10 grid place-items-center text-2xl">🏛️</div>
          </motion.div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">
              Scenario {scenarioId}
            </div>
            <div className="text-base font-semibold flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              {winner ? (
                <>Winner: <span className="font-bold">{winner}</span></>
              ) : (
                <>First to <span className="font-bold">100 VP</span> wins</>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Card className="shadow-sm">
            <CardContent className="py-2 px-3">
              <div className="text-xs text-slate-500">Current</div>
              <div className="text-lg font-bold leading-none flex items-center gap-2">
                <span className="text-base">{countryFlag[current]}</span> {current}
              </div>
              <div className="mt-1 text-sm flex items-center gap-4">
                <span className="text-slate-600">VP: <span className="tabular-nums font-semibold">{vp[current]}</span></span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Coins className="h-4 w-4" /> <span className="tabular-nums font-semibold">{gold[current]}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {onExit && (
            <Button variant="destructive" onClick={onExit} className="rounded-2xl">
              Exit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


// --- Left: Turn Order ---
function TurnOrderPanel({ order, current, vp }: { order: Country[]; current: Country; vp: VPMap }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" /> Turn Order
        </CardTitle>
        <CardDescription>
          Fixed: Austria-Hungary → France → Britain → German Empire → Russia
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.map((c) => (
            <div
              key={c}
              className={`p-3 rounded-2xl border bg-white flex items-center justify-between ${
                c === current ? "border-slate-400" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{countryFlag[c]}</span>
                <div className="font-medium">{c}</div>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-700">
                VP: <span className="tabular-nums font-semibold">{vp[c]}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Right: Actions ---
function ActionsPanel({
  current,
  onPick,
  disabled,
  isHuman,
}: {
  current: Country;
  onPick: (a: ActionType) => void;
  disabled: boolean;
  isHuman: boolean;
}) {
  const actions: ActionType[] = ["Build", "Operate", "Colonize", "Campaign", "Congress"];

  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)]">
      <CardHeader className="pb-2">
        <CardTitle>Choose Action</CardTitle>
        <CardDescription>
          {isHuman ? (
            <>
              Your turn as <span className="font-medium">{current}</span>
            </>
          ) : (
            <>
              Acting for <span className="font-medium">{current}</span> (AI TBD)
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <Button
              key={a}
              variant={a === "Congress" ? "secondary" : "default"}
              className="h-12 rounded-2xl justify-between"
              onClick={() => onPick(a)}
              disabled={disabled}
            >
              <span>{a}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ))}
        </div>
        {disabled && <div className="text-xs text-slate-500 mt-3">Game over.</div>}
      </CardContent>
    </Card>
  );
}

function ActionLogOverlay({
  log,
  onClose,
}: {
  log: {
    country: Country;
    action: ActionType;
    note?: string;
    ts: number;
    targetId?: string;
    targetName?: string;
  }[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm p-4 md:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle>Action Log</CardTitle>
              </div>
              <Button variant="ghost" onClick={onClose} className="rounded-2xl" aria-label="Close">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] pr-2">
              <div className="space-y-2">
                {log.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No actions yet. The first player should choose an action.
                  </div>
                )}
                {log.map((entry) => (
                  <div key={entry.ts} className="p-3 rounded-2xl border bg-white">
                    <div className="text-sm">
                      <span className="tabular-nums">
                        {new Date(entry.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-base">
                      <span className="mr-2">{countryFlag[entry.country]}</span>
                      <span className="font-medium">{entry.country}</span> performed{" "}
                      <span className="font-semibold">{entry.action}</span>
                      {entry.targetName ? (
                        <span>
                          {" "}
                          on <span className="font-medium">{entry.targetName}</span>
                        </span>
                      ) : null}
                      {entry.note ? <span className="text-slate-500"> — {entry.note}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WorldMarketPanel({
  rows,
}: {
  rows: {
    key: MarketGoodKey;
    price: number;
    level: number;
    min: number;
    base: number;
    max: number;
  }[];
}) {
  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" /> World Market
        </CardTitle>
        <CardDescription>Integer price ladder</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[620px] pr-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="font-medium py-1 text-left">Good</th>
                <th className="font-medium py-1 text-right">Price (£)</th>
                <th className="font-medium py-1 text-right">Level</th>
                <th className="font-medium py-1 text-right whitespace-nowrap">Min • Base • Max</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b last:border-b-0">
                  <td className="py-2 text-left">{r.key}</td>
                  <td className="py-2 tabular-nums text-right">{r.price}</td>
                  <td className="py-2 tabular-nums text-right">{r.level}</td>
                  <td className="py-2 text-slate-500 tabular-nums text-right">
                    {r.min} • {r.base} • {r.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AssetsPanel({
  assets,
  actor,
  pendingAction,
  onCancel,
  onChoose,
}: {
  assets: AssetType[];
  actor: Country;
  pendingAction: ActionType | null;
  onCancel: () => void;
  onChoose: (action: Exclude<ActionType, "Congress">, a: AssetType) => void;
}) {
  const mine = assets.filter((a) => a.owner === actor);
  const world = assets.filter((a) => a.owner !== actor);

  // Helper: wire only the active action to each card
  const callbacksFor = (a: AssetType) => {
    if (!pendingAction) return {};
    if (pendingAction === "Build")     return { onBuild:    () => onChoose("Build", a) };
    if (pendingAction === "Operate")   return { onOperate:  () => onChoose("Operate", a) };
    if (pendingAction === "Colonize")  return { onColonize: () => onChoose("Colonize", a) };
    if (pendingAction === "Campaign")  return { onConquer:  () => onChoose("Campaign", a) };
    return {};
  };

  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {pendingAction ? `Select target for ${pendingAction}` : "Assets"}
            </CardTitle>
            <CardDescription>
              {pendingAction
                ? "Choose an eligible asset to proceed."
                : "Your holdings and other opportunities."}
            </CardDescription>
          </div>
          {pendingAction && (
            <Button variant="ghost" onClick={onCancel} className="rounded-2xl">
              <XCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[620px] pr-2">
          <div className="space-y-6">
            <section>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Your assets ({mine.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mine.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    currentCountry={actor}
                    {...callbacksFor(a)}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                World & neutral ({world.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {world.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    currentCountry={actor}
                    {...callbacksFor(a)}
                  />
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

