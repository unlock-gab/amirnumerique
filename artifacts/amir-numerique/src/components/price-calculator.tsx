import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/hooks/use-i18n";
import { Calculator } from "lucide-react";

interface PriceCalculatorProps {
  pricePerM2: number;
  onCalculated?: (data: { width: number; height: number; unit: string; area: number; totalPrice: number }) => void;
  currency?: string;
}

export function PriceCalculator({ pricePerM2, onCalculated, currency = "DA" }: PriceCalculatorProps) {
  const { t } = useI18n();
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [unit, setUnit] = useState<"cm" | "m">("cm");

  const wNum = parseFloat(width) || 0;
  const hNum = parseFloat(height) || 0;
  const wM = unit === "cm" ? wNum / 100 : wNum;
  const hM = unit === "cm" ? hNum / 100 : hNum;
  const area = wM * hM;
  const totalPrice = area * pricePerM2;

  useEffect(() => {
    if (area > 0 && onCalculated) {
      onCalculated({ width: wNum, height: hNum, unit, area, totalPrice });
    }
  }, [area, totalPrice, unit, wNum, hNum]);

  return (
    <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4" data-testid="price-calculator">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Calculateur de prix</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">{t("width")}</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={width}
            onChange={e => setWidth(e.target.value)}
            placeholder="0"
            data-testid="input-width"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">{t("height")}</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="0"
            data-testid="input-height"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">{t("unit")}</Label>
          <Select value={unit} onValueChange={(v: "cm" | "m") => setUnit(v)}>
            <SelectTrigger data-testid="select-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">cm</SelectItem>
              <SelectItem value="m">m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {area > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="text-center p-3 rounded-lg bg-background border border-border">
            <div className="text-xs text-muted-foreground mb-1">{t("area")}</div>
            <div className="font-bold text-lg" data-testid="display-area">
              {area.toFixed(2)} m²
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">{t("estimatedPrice")}</div>
            <div className="font-bold text-lg text-primary" data-testid="display-price">
              {Math.round(totalPrice).toLocaleString()} {currency}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
