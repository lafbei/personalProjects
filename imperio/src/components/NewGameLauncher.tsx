import { useState } from "react";
import { ArrowLeft, Play } from "lucide-react";

// ------- Types
export type ScenarioId = "1871";
export type CountryId = "france" | "britain" | "russia" | "austria_hungary" | "german_empire";

type NewGameLauncherProps = {
  onStart: (opts: { scenarioId: ScenarioId; countryId: CountryId }) => void;
  onCancel?: () => void; // optional: go back to opening screen
  className?: string;
};

// ------- Public component
export default function NewGameLauncher({
  onStart,
  onCancel,
  className = "",
}: NewGameLauncherProps) {
  const [step, setStep] = useState<"scenarios" | "countries">("scenarios");
  const [scenario, setScenario] = useState<ScenarioId | null>(null);

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 ${className}`}
    >
      <div className="max-w-3xl mx-auto">
        <Header
          onBack={step === "countries" ? () => setStep("scenarios") : onCancel}
          canGoBack={!!onCancel || step === "countries"}
        />

        {step === "scenarios" && (
          <ScenarioList
            onPick={(id) => {
              setScenario(id);
              setStep("countries");
            }}
          />
        )}

        {step === "countries" && scenario && (
          <CountrySelect
            scenarioId={scenario}
            onStart={(countryId) => onStart({ scenarioId: scenario, countryId })}
          />
        )}
      </div>
    </div>
  );
}

// ------- Header
function Header({ onBack, canGoBack }: { onBack?: () => void; canGoBack?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {canGoBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-slate-800/70 hover:bg-slate-700/70 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </button>
      )}
      <h1 className="ml-auto mr-auto text-3xl font-extrabold tracking-wide">New Game</h1>
    </div>
  );
}

// ------- Scenario list (only one for now)
function ScenarioList({ onPick }: { onPick: (id: ScenarioId) => void }) {
  return (
    <div className="grid place-items-center">
      <div className="w-full max-w-xl">
        <p className="text-slate-300 mb-4">Choose a scenario to begin:</p>
        <div className="grid gap-4">
          <ScenarioCard
            title="1871"
            subtitle="Europe after the unification of Germany"
            onClick={() => onPick("1871")}
          />
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl p-5 bg-slate-800/70 hover:bg-slate-700 transition text-left shadow-lg shadow-black/30 border border-slate-700/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{title}</div>
          <div className="text-slate-300">{subtitle}</div>
        </div>
        <div className="text-slate-400 group-hover:text-slate-200">Start ▶</div>
      </div>
    </button>
  );
}

// ------- Country select
function CountrySelect({
  scenarioId,
  onStart,
}: {
  scenarioId: ScenarioId;
  onStart: (country: CountryId) => void;
}) {
  const countries: {
    id: CountryId;
    name: string;
    Flag: React.FC<{ className?: string }>;
    blurb?: string;
  }[] = [
    {
      id: "france",
      name: "France",
      Flag: FlagFrance,
      blurb: "Republic rebuilding after defeat in the Franco‑Prussian War.",
    },
    {
      id: "britain",
      name: "Britain",
      Flag: FlagBritain,
      blurb: "Global empire with unmatched navy and far‑flung interests.",
    },
    {
      id: "russia",
      name: "Russia",
      Flag: FlagRussia,
      blurb: "Vast resources and manpower, but slow to modernize.",
    },
    {
      id: "austria_hungary",
      name: "Austria‑Hungary",
      Flag: FlagAustriaHungary,
      blurb: "Dual monarchy balancing many peoples and frontiers.",
    },
    {
      id: "german_empire",
      name: "German Empire",
      Flag: FlagGermanEmpire1871,
      blurb: "Newly unified power under Prussia’s leadership.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Scenario {scenarioId}</h2>
        <p className="text-slate-300 mt-2">
          Europe stands at a crossroads. Industrial might, colonial ambition, and shifting alliances
          define the era. Choose your nation and write a new chapter of history.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries.map((c) => (
          <button
            key={c.id}
            onClick={() => onStart(c.id)}
            className="group rounded-2xl p-4 bg-slate-800/70 hover:bg-slate-700 transition shadow-lg shadow-black/30 border border-slate-700/60 text-left"
          >
            <div className="flex items-center gap-3">
              <c.Flag className="h-10 w-14" />
              <div>
                <div className="font-semibold text-lg">{c.name}</div>
                {c.blurb && <div className="text-xs text-slate-300">{c.blurb}</div>}
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-sm text-slate-300 group-hover:text-slate-100">
              <Play className="h-4 w-4" /> Start here
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ------- Flag components (asset‑free, inline)
function Frame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`shrink-0 rounded-md overflow-hidden ring-1 ring-slate-700/60 bg-slate-900 ${className}`}
      aria-hidden
    >
      <div className="aspect-[7/5] w-full h-full">{children}</div>
    </div>
  );
}

function FlagFrance({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <div className="flex h-full w-full">
        <div className="flex-1 bg-[#0055A4]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#EF4135]"></div>
      </div>
    </Frame>
  );
}

function FlagRussia({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#0039A6]"></div>
        <div className="flex-1 bg-[#D52B1E]"></div>
      </div>
    </Frame>
  );
}

function FlagGermanEmpire1871({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 bg-black"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#DD0000]"></div>
      </div>
    </Frame>
  );
}

function FlagAustriaHungary({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <div className="grid grid-cols-2 h-full w-full">
        {/* Austria (left): red-white-red */}
        <div className="flex flex-col">
          <div className="flex-1 bg-[#ED2939]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#ED2939]"></div>
        </div>
        {/* Hungary (right): red-white-green */}
        <div className="flex flex-col">
          <div className="flex-1 bg-[#CD2A3E]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#436F4D]"></div>
        </div>
      </div>
    </Frame>
  );
}

function FlagBritain({ className }: { className?: string }) {
  // Use emoji inside a framed box for a clean look without external assets
  return (
    <Frame className={`${className} flex items-center justify-center text-[26px]`}>
      <div className="flex items-center justify-center w-full h-full select-none">🇬🇧</div>
    </Frame>
  );
}
