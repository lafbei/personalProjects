import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe2, Flag, History, Crown, XCircle, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import AssetCard, { type Asset as AssetType } from "./Asset";
import { MOCK_ASSETS } from "../../data/mock_assets";

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
  min: number;   // integer
  base: number;  // integer
  max: number;   // integer
  ladder: readonly number[]; // exactly 10 integer steps, ascending, duplicates allowed
};

// 10-point ladders (all integers). Duplicates used for cheaper goods.
const MARKET_GOODS: Record<MarketGoodKey, MarketGood> = {
  Grain: {
    key: "Grain",
    min: 1, base: 3, max: 5,
    ladder: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  },
  Coal: {
    key: "Coal",
    min: 2, base: 6, max: 12,
    ladder: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
  },
  Iron: {
    key: "Iron",
    min: 2, base: 5, max: 10,
    ladder: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10],
  },
  Timber: {
    key: "Timber",
    min: 1, base: 3, max: 6,
    ladder: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6],
  },
  Cotton: {
    key: "Cotton",
    min: 3, base: 7, max: 12,
    ladder: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  Steel: {
    key: "Steel",
    min: 5, base: 9, max: 16,
    ladder: [5, 6, 7, 8, 9, 10, 11, 12, 14, 16],
  },
  Textiles: {
    key: "Textiles",
    min: 3, base: 6, max: 10,
    ladder: [3, 4, 5, 6, 7, 8, 9, 10, 10, 10],
  },
  Artillery: {
    key: "Artillery",
    min: 10, base: 20, max: 30,
    ladder: [10, 12, 14, 16, 18, 20, 22, 24, 26, 30],
  },
};

// current market uses an index into the ladder + lastIndex to compute Δ (integer)
type MarketState = Record<MarketGoodKey, { index: number; lastIndex: number }>;

function closestIndex(ladder: readonly number[], target: number) {
  let best = 0;
  let diff = Math.abs(ladder[0] - target);
  for (let i = 1; i < ladder.length; i++) {
    const d = Math.abs(ladder[i] - target);
    if (d < diff) { best = i; diff = d; }
  }
  return best;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ACTIONS = ["Build", "Operate", "Colonize", "Campaign", "Pass"] as const;
type ActionType = (typeof ACTIONS)[number];


export type GameViewProps = {
  scenarioId: string; // e.g. "1871"
  selectedCountry: Country; // the human player (for now everyone is manual)
  onExit?: () => void;
};

// Initial prestige (mock)
const INITIAL_PRESTIGE: Record<Country, number> = {
  Britain: 120,
  "German Empire": 115,
  France: 100,
  Russia: 90,
  "Austria-Hungary": 80,
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
  const [round, setRound] = useState(1);
  // controls the Action Log overlay
  const [showLog, setShowLog] = useState(false);


  const [prestige] = useState<Record<Country, number>>(INITIAL_PRESTIGE);
  const [passed, setPassed] = useState<Record<Country, boolean>>({
    Britain: false,
    "German Empire": false,
    France: false,
    Russia: false,
    "Austria-Hungary": false,
  });

  // Assets state
  const [assets, setAssets] = useState<AssetType[]>(MOCK_ASSETS);

  // Pending action selection (for asset-targeted actions)
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

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
      const price = g.ladder[s.index];                // integer
      const last = g.ladder[s.lastIndex];             // integer
      const delta = price - last;                     // integer change
      const level = s.index + 1;                      // 1..10
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


  // Order is by ascending prestige at the START of a round
  const order = useMemo<Country[]>(() => {
    return (Object.keys(prestige) as Country[]).sort((a, b) => prestige[a] - prestige[b]);
  }, [prestige]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset currentIndex when round changes
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [round]);


  const [log, setLog] = useState<
    {
      round: number;
      country: Country;
      action: ActionType;
      targetId?: string;
      targetName?: string;
      note?: string;
      ts: number;
    }[]
  >([]);

  const currentCountry = order[currentIndex];

  function WorldMapPanel() {
    return (
      <div className="aspect-[16/10] xl:aspect-auto h-full">
        <div className="h-full grid place-items-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border text-slate-500">
          <div className="text-center p-6">
            <div className="text-sm">Map Placeholder</div>
            <div className="text-xs">Hook up your map tiles / vector layers here.</div>
          </div>
        </div>
      </div>
    );
  }

  function nextActiveIndex(from: number): number {
    if (order.length === 0) return 0;
    let i = (from + 1) % order.length;
    let guard = 0;
    while (passed[order[i]] && guard < order.length) {
      i = (i + 1) % order.length;
      guard++;
    }
    return i;
  }

  function everyoneHasPassedIf(actor: Country) {
    return order.every((c) => (c === actor ? true : passed[c]));
  }

  // ---------- Action flow ----------
function performActionClick(action: ActionType) {
  const actor = currentCountry;

  if (action === "Pass") {
    setPassed((p) => ({ ...p, [actor]: true }));
    setLog((L) => [
      { round, country: actor, action, ts: Date.now(), note: "Passed for the round" },
      ...L,
    ]);

    if (everyoneHasPassedIf(actor)) {
      startNextRound();      // ⬅️ go straight to the next round
      return;
    }

    setCurrentIndex((i) => nextActiveIndex(i));
    return;
  }

  // Asset-targeted actions: Build, Operate, Colonize, Campaign
  setPendingAction(action);
}



  function finalizeAssetAction(action: Exclude<ActionType, "Pass">, target: AssetType) {
  const actor = currentCountry;

  setAssets((prev) =>
    prev.map((a) => {
      if (a.id !== target.id) return a;

      if (action === "Build") {
        return { ...a, owner: actor, status: "Operational", level: a.level > 0 ? a.level : 1 };
      }
      if (action === "Operate") {
        return a; // placeholder
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

  setLog((L) => [
    { round, country: actor, action, targetId: target.id, targetName: target.name, ts: Date.now() },
    ...L,
  ]);

  setPendingAction(null);
  setCurrentIndex((i) => nextActiveIndex(i));
}


  function startNextRound() {
  setPassed({
    Britain: false,
    "German Empire": false,
    France: false,
    Russia: false,
    "Austria-Hungary": false,
  });
  setRound((r) => r + 1);
  setPendingAction(null);
}


  // Eligible assets for the currently pending action
  const eligibleAssets: AssetType[] = useMemo(() => {
    if (!pendingAction) return [];
    const actor = currentCountry;
    return assets.filter((a) => {
      if (pendingAction === "Build") {
        return a.status === "Planned" && (a.owner === null || a.owner === actor);
      }
      if (pendingAction === "Operate") {
        return a.status === "Operational" && a.owner === actor && !!a.production;
      }
      if (pendingAction === "Colonize") {
        return (
          a.kind === "Colony" &&
          a.owner === null &&
          !!a.colonization &&
          a.colonization.progress < a.colonization.required
        );
      }
      if (pendingAction === "Campaign") {
        return a.owner !== null && a.owner !== actor && (a.conquerable ?? true);
      }
      return false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction, assets, currentIndex]);

  return (
    <>
      <div className="h-full w-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
        <TopBar
          scenarioId={scenarioId}
          round={round}
          current={currentCountry}
          onExit={onExit}
        />

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_360px] gap-4 p-4">
        {/* Left: Turn Order & Prestige */}
        <WorldMarketPanel rows={marketRows} />

        {/* Center: Either Action Log, Events, or Asset Picker */}
        {pendingAction ? (
          <AssetPickerPanel
            action={pendingAction as Exclude<ActionType, "Pass">}
            assets={eligibleAssets}
            actor={currentCountry} // <-- add this
            onCancel={() => setPendingAction(null)}
            onChoose={(asset) =>
              finalizeAssetAction(pendingAction as Exclude<ActionType, "Pass">, asset)
            }
          />
        ) : (
          <WorldMapPanel />
        )}

        {/* Right: Actions */}
        <div className="space-y-4 xl:h-[calc(100vh-96px)]">
          <ActionsPanel
            disabled={passed[currentCountry]}
            current={currentCountry}
            onPick={performActionClick}
            isHuman={currentCountry === selectedCountry}
          />


          <TurnOrderPanel
            order={order}
            current={currentCountry}
            passed={passed}
            prestige={prestige}
          />
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
  round,
  current,
  onExit,
}: {
  scenarioId: string;
  round: number;
  current: Country;
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
              <Globe2 className="h-4 w-4" /> Round {round}
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
function TurnOrderPanel({
  order,
  current,
  passed,
  prestige,
}: {
  order: Country[];
  current: Country;
  passed: Record<Country, boolean>;
  prestige: Record<Country, number>;
}) {
  return (
    <Card className="xl:h-[calc(100vh-96px)] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" /> Turn Order
        </CardTitle>
        <CardDescription>Lowest prestige acts first each round</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[520px] pr-2">
          <div className="space-y-2">
            {order.map((c) => (
              <div
                key={c}
                className={`p-3 rounded-2xl border bg-white flex items-center justify-between ${c === current ? "border-slate-400" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{countryFlag[c]}</span>
                  <div>
                    <div className="font-medium">{c}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Prestige:{" "}
                      <span className="tabular-nums">{prestige[c]}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${passed[c] ? "bg-slate-100 text-slate-600" : c === current ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-600"}`}
                >
                  {passed[c] ? "Passed" : c === current ? "Acting" : "Waiting"}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// --- Center: Asset Picker ---
function AssetPickerPanel({
  action,
  assets,
  onCancel,
  onChoose,
  actor, // add this
}: {
  action: Exclude<ActionType, "Pass" | "Trade">;
  assets: AssetType[];
  onCancel: () => void;
  onChoose: (asset: AssetType) => void;
  actor: Country; // add this
}) {
  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Select target for {action}</CardTitle>
            <CardDescription>Choose an asset to proceed.</CardDescription>
          </div>
          <Button variant="ghost" onClick={onCancel} className="rounded-2xl">
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="text-sm text-slate-600">
            No eligible targets. Close and choose a different action.
          </div>
        ) : (
          <ScrollArea className="h-[620px] pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assets.map((a) => (
                <div key={a.id}>
                  <AssetCard
                    asset={a}
                    currentCountry={actor}
                    onBuild={action === "Build" ? () => onChoose(a) : undefined}
                    onOperate={action === "Operate" ? () => onChoose(a) : undefined}
                    onColonize={action === "Colonize" ? () => onChoose(a) : undefined}
                    onConquer={action === "Campaign" ? () => onChoose(a) : undefined}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
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
  const actions: ActionType[] = ["Build", "Operate", "Colonize", "Campaign", "Pass"];

  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)]">
      <CardHeader className="pb-2">
        <CardTitle>Choose Action</CardTitle>
        <CardDescription>
          {isHuman ? <>Your turn as <span className="font-medium">{current}</span></>
                   : <>Acting for <span className="font-medium">{current}</span> (AI TBD)</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <Button
              key={a}
              variant={a === "Pass" ? "secondary" : "default"}
              className="h-12 rounded-2xl justify-between"
              onClick={() => onPick(a)}
              disabled={disabled}
            >
              <span>{a}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ))}
        </div>
        {disabled && (
          <div className="text-xs text-slate-500 mt-3">
            This player has already passed or the phase is not active.
          </div>
        )}
      </CardContent>
    </Card>
  );
}


function ActionLogOverlay({
  log,
  onClose,
}: {
  log: {
    round: number;
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
            <CardDescription>One action per activation, pass to leave the round</CardDescription>
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
                      <span className="font-medium">Round {entry.round}</span> •{" "}
                      <span className="tabular-nums">{new Date(entry.ts).toLocaleTimeString()}</span>
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


