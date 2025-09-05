import GameView, { type Country } from "./components/GameView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Globe2, Play } from "lucide-react";
import { useState } from "react";

const SCENARIO_ID = "1871";

const countryFlag: Record<Country, string> = {
  France: "🇫🇷",
  Britain: "🇬🇧",
  Russia: "🇷🇺",
  "Austria-Hungary": "🇦🇹",
  "German Empire": "🏴",
};

type Screen = "menu" | "choose" | "game";

function MainMenu({ onNewGame }: { onNewGame: () => void }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 grid place-items-center p-6">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Imperio</CardTitle>
          <CardDescription>Grand strategy in the age of empires.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onNewGame} className="rounded-2xl h-12 text-base">
            <Play className="h-4 w-4 mr-2" /> New Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CountrySelect({
  onSelect,
  onBack,
}: {
  onSelect: (c: Country) => void;
  onBack: () => void;
}) {
  const countries: Country[] = ["France", "Britain", "Russia", "Austria-Hungary", "German Empire"];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <Card className="w-full max-w-2xl mx-auto shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5" /> New Game — Scenario {SCENARIO_ID}
            </CardTitle>
            <Button variant="ghost" onClick={onBack} className="rounded-2xl">
              Back
            </Button>
          </div>
          <CardDescription>Choose a country to begin your campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {countries.map((c) => (
              <Button
                key={c}
                variant="outline"
                className="justify-start h-14 rounded-2xl"
                onClick={() => onSelect(c)}
              >
                <span className="text-2xl mr-3">{countryFlag[c]}</span>
                {c}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  if (screen === "game" && selectedCountry) {
    return (
      <GameView
        scenarioId={SCENARIO_ID}
        selectedCountry={selectedCountry}
        onExit={() => {
          setSelectedCountry(null);
          setScreen("menu");
        }}
      />
    );
  }

  if (screen === "choose") {
    return (
      <CountrySelect
        onBack={() => setScreen("menu")}
        onSelect={(c) => {
          setSelectedCountry(c);
          setScreen("game");
        }}
      />
    );
  }

  return <MainMenu onNewGame={() => setScreen("choose")} />;
}
