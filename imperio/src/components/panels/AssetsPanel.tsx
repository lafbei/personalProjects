import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { XCircle } from "lucide-react";
import AssetCard, { type Asset as AssetType } from "../Asset";
import type { Country } from "../GameView";

type ActionType = "Build" | "Operate" | "Colonize" | "Campaign" | "Congress";

export default function AssetsPanel({
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
  const isOperate = pendingAction === "Operate";

  return (
    <Card className="shadow-sm xl:h-[calc(100vh-96px)] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{isOperate ? "Select asset to Operate" : "Assets"}</CardTitle>
            <CardDescription>
              {isOperate
                ? "Choose one of your assets to operate."
                : "Only your current holdings are shown."}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mine.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                currentCountry={actor}
                hideActions={isOperate}
                selectable={isOperate}
                onCardClick={isOperate ? () => onChoose("Operate", a) : undefined}
              />
            ))}
            {mine.length === 0 && <div className="text-sm text-slate-500">No assets yet.</div>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
