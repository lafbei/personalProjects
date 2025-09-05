import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe2, Flag, History, Crown, Check, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import AssetCard, { type Asset as AssetType } from "./Asset";
import { MOCK_ASSETS } from "../../data/mock_assets";

// --- Types ---
export type Country = "France" | "Britain" | "Russia" | "Austria-Hungary" | "German Empire";

type Phase = "Action" | "Events";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ACTIONS = ["Build", "Operate", "Trade", "Colonize", "Campaign", "Pass"] as const;
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
  const [phase, setPhase] = useState<Phase>("Action");

  const [prestige] = useState<Record<Country, number>>(INITIAL_PRESTIGE);
  const [passed, setPassed] = useState<Record<Country, boolean>>({
    Britain: false,
    "German Empire": false,
    France: false,
    Russia: false,
    "Austria-Hungary": false,
  });

  // Track actions used per country for the current round
  const [usedActions, setUsedActions] = useState<
    Record<Country, Partial<Record<ActionType, boolean>>>
  >({
    Britain: {},
    "German Empire": {},
    France: {},
    Russia: {},
    "Austria-Hungary": {},
  });

  // Assets state
  const [assets, setAssets] = useState<AssetType[]>(MOCK_ASSETS);

  // Pending action selection (for asset-targeted actions)
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  // Order is by ascending prestige at the START of a round
  const order = useMemo<Country[]>(() => {
    return (Object.keys(prestige) as Country[]).sort((a, b) => prestige[a] - prestige[b]);
  }, [prestige, round]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset currentIndex when round or phase changes back to Action
  React.useEffect(() => {
    if (phase === "Action") setCurrentIndex(0);
  }, [phase, round]);

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

  function markActionUsed(c: Country, a: ActionType) {
    setUsedActions((prev) => ({
      ...prev,
      [c]: { ...prev[c], [a]: true },
    }));
  }

  function isActionUsed(c: Country, a: ActionType) {
    return !!usedActions[c]?.[a];
  }

  function everyoneHasPassedIf(actor: Country) {
    return order.every((c) => (c === actor ? true : passed[c]));
  }

  // ---------- Action flow ----------
  function performActionClick(action: ActionType) {
    if (phase !== "Action") return;
    const actor = currentCountry;

    // Prevent double-usage within the same round
    if (action !== "Pass" && isActionUsed(actor, action)) return;

    // Immediate actions
    if (action === "Pass") {
      setPassed((p) => ({ ...p, [actor]: true }));
      setLog((L) => [
        { round, country: actor, action, ts: Date.now(), note: "Passed for the round" },
        ...L,
      ]);

      if (everyoneHasPassedIf(actor)) {
        setPhase("Events");
        return;
      }

      setCurrentIndex((i) => nextActiveIndex(i));
      return;
    }

    if (action === "Trade") {
      markActionUsed(actor, action);
      setLog((L) => [
        { round, country: actor, action, ts: Date.now(), note: "Traded on the world market" },
        ...L,
      ]);
      setCurrentIndex((i) => nextActiveIndex(i));
      return;
    }

    // Asset-targeted actions: Build, Operate, Colonize, Campaign
    setPendingAction(action);
  }

  function finalizeAssetAction(action: Exclude<ActionType, "Pass" | "Trade">, target: AssetType) {
    const actor = currentCountry;
    // Apply very simple effects for now
    setAssets((prev) => {
      return prev.map((a) => {
        if (a.id !== target.id) return a;
        if (action === "Build") {
          // Claim planned asset and make it operational
          return {
            ...a,
            owner: actor,
            status: "Operational",
            level: a.level > 0 ? a.level : 1,
          } as AssetType;
        }
        if (action === "Operate") {
          // No economy yet; just a placeholder (could boost prestige slightly later)
          return a;
        }
        if (action === "Colonize") {
          if (a.colonization) {
            const next = a.colonization.progress + 1;
            const complete = next >= a.colonization.required;
            return {
              ...a,
              owner: complete ? actor : a.owner,
              status: complete ? "Operational" : a.status,
              colonization: {
                ...a.colonization,
                progress: Math.min(next, a.colonization.required),
              },
            } as AssetType;
          }
          return a;
        }
        if (action === "Campaign") {
          // Transfer ownership; mark as damaged? keep simple for now
          return { ...a, owner: actor } as AssetType;
        }
        return a;
      });
    });

    markActionUsed(actor, action);
    setLog((L) => [
      {
        round,
        country: actor,
        action,
        targetId: target.id,
        targetName: target.name,
        ts: Date.now(),
      },
      ...L,
    ]);

    setPendingAction(null);
    setCurrentIndex((i) => nextActiveIndex(i));
  }

  function startNextRound() {
    // Reset passes and used actions; bump round; go back to Action
    setPassed({
      Britain: false,
      "German Empire": false,
      France: false,
      Russia: false,
      "Austria-Hungary": false,
    });
    setUsedActions({
      Britain: {},
      "German Empire": {},
      France: {},
      Russia: {},
      "Austria-Hungary": {},
    });
    setRound((r) => r + 1);
    setPhase("Action");
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
    <div className="h-full w-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <TopBar
        scenarioId={scenarioId}
        round={round}
        phase={phase}
        current={currentCountry}
        onExit={onExit}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_360px] gap-4 p-4">
        {/* Left: Turn Order & Prestige */}
        <TurnOrderPanel
          order={order}
          current={currentCountry}
          passed={passed}
          prestige={prestige}
        />

        {/* Center: Either Action Log, Events, or Asset Picker */}
        {phase === "Events" ? (
          <EventsPanel onNextRound={startNextRound} round={round} />
        ) : pendingAction ? (
          <AssetPickerPanel
            action={pendingAction as Exclude<ActionType, "Pass" | "Trade">}
            assets={eligibleAssets}
            actor={currentCountry} // <-- add this
            onCancel={() => setPendingAction(null)}
            onChoose={(asset) => finalizeAssetAction(pendingAction as Exclude<ActionType, "Pass" | "Trade">, asset)}
          />
        ) : (
          <ActionLogPanel log={log} />
        )}

        {/* Right: Actions */}
        <ActionsPanel
          disabled={phase !== "Action" || passed[currentCountry]}
          current={currentCountry}
          onPick={performActionClick}
          used={usedActions[currentCountry]}
          isHuman={currentCountry === selectedCountry}
        />
      </div>
    </div>
  );
}

// --- Top Bar ---
function TopBar({
  scenarioId,
  round,
  phase,
  current,
  onExit,
}: {
  scenarioId: string;
  round: number;
  phase: Phase;
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
              <Globe2 className="h-4 w-4" /> Round {round} • {phase} Phase
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

// --- Center: Action Log ---
function ActionLogPanel({
  log,
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
}) {
  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Action Log
        </CardTitle>
        <CardDescription>One action per activation, pass to leave the round</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[620px] pr-2">
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
  used,
  isHuman,
}: {
  current: Country;
  onPick: (a: ActionType) => void;
  disabled: boolean;
  used?: Partial<Record<ActionType, boolean>>;
  isHuman: boolean;
}) {
  const actions: ActionType[] = ["Build", "Operate", "Trade", "Colonize", "Campaign", "Pass"];

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
          {actions.map((a) => {
            const isUsed = (used && used[a]) ?? false;
            const isDisabled = disabled || (a !== "Pass" && isUsed);
            return (
              <Button
                key={a}
                variant={a === "Pass" ? "secondary" : isUsed ? "outline" : "default"}
                className="h-12 rounded-2xl justify-between"
                onClick={() => onPick(a)}
                disabled={isDisabled}
                title={isUsed && a !== "Pass" ? "Already used this round" : undefined}
              >
                <span>{a}</span>
                {isUsed && a !== "Pass" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            );
          })}
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

// --- Events Placeholder ---
function EventsPanel({ onNextRound, round }: { onNextRound: () => void; round: number }) {
  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)] grid place-items-center text-center">
      <CardHeader>
        <CardTitle>Events Phase</CardTitle>
        <CardDescription>We’ll add event draws and resolutions here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-600 mb-4">
          All countries have passed in Round {round}.
        </div>
        <Button onClick={onNextRound} className="rounded-2xl">
          Start Next Round
        </Button>
      </CardContent>
    </Card>
  );
}
