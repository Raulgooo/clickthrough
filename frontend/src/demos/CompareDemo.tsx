import { useState } from "react";
import {
  ComparisonTable,
  ConclusionCard,
  UncertaintyNote,
  Panel,
  Label,
} from "@/primitives";
import { OverlayPositioner } from "@/renderer/OverlayPositioner";

export default function CompareDemo() {
  const [highlightColumn, setHighlightColumn] = useState<string>("air15");

  return (
    <div className="relative min-h-screen bg-surface-container-low">
      {/* Host page: Product grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[800px] mx-auto">
          <div
            className={`bg-white border border-outline-variant rounded-lg p-4 cursor-pointer transition-colors ${
              highlightColumn === "pro14" ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => setHighlightColumn("pro14")}
          >
            <div className="w-full h-[120px] bg-surface-container rounded mb-2" />
            <div className="font-body-sm text-body-sm font-medium text-on-background">
              MacBook Pro 14&quot;
            </div>
            <div className="font-label-mono text-label-mono text-on-surface-variant">
              $1,999
            </div>
          </div>

          <div
            className={`bg-white border border-outline-variant rounded-lg p-4 cursor-pointer transition-colors ${
              highlightColumn === "air15" ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => setHighlightColumn("air15")}
          >
            <div className="w-full h-[120px] bg-surface-container rounded mb-2" />
            <div className="font-body-sm text-body-sm font-medium text-on-background">
              MacBook Air 15&quot;
            </div>
            <div className="font-label-mono text-label-mono text-on-surface-variant">
              $1,299
            </div>
          </div>

          <div
            className={`bg-white border border-outline-variant rounded-lg p-4 cursor-pointer transition-colors ${
              highlightColumn === "pro16" ? "ring-1 ring-primary" : ""
            }`}
            onClick={() => setHighlightColumn("pro16")}
          >
            <div className="w-full h-[120px] bg-surface-container rounded mb-2" />
            <div className="font-body-sm text-body-sm font-medium text-on-background">
              MacBook Pro 16&quot;
            </div>
            <div className="font-label-mono text-label-mono text-on-surface-variant">
              $2,499
            </div>
          </div>
        </div>
      </div>

      {/* Clickthrough Overlay */}
      <div className="absolute top-4 left-4 z-[100]">
        <OverlayPositioner mode="native_insertion">
          <div className="w-[420px] max-w-[calc(100vw-32px)] ct-panel-enter">
            <Panel chrome="standard" className="bg-surface border-outline">
              {/* Header */}
              <div className="flex items-center gap-2 p-3 border-b border-outline">
                <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
                  CT
                </div>
                <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Product Comparison
                </span>
              </div>

              {/* Comparison Table */}
              <div className="p-3 border-b border-outline">
                <ComparisonTable
                  highlightColumn={highlightColumn}
                  columns={[
                    { key: "spec", label: "Spec" },
                    { key: "pro14", label: "Pro 14" },
                    { key: "air15", label: "Air 15" },
                    { key: "pro16", label: "Pro 16" },
                  ]}
                  rows={[
                    { spec: "Chip", pro14: "M3 Pro", air15: "M3", pro16: "M3 Max" },
                    { spec: "Memory", pro14: "18GB", air15: "16GB", pro16: "36GB" },
                    { spec: "Storage", pro14: "512GB", air15: "256GB", pro16: "512GB" },
                    { spec: "Battery", pro14: "18h", air15: "18h", pro16: "22h" },
                    { spec: "Price", pro14: "$1,999", air15: "$1,299", pro16: "$2,499" },
                  ]}
                />
              </div>

              {/* Recommendation */}
              <div className="p-3 border-b border-outline">
                <Label tone="muted" size="sm">
                  Recommendation
                </Label>
                <div className="mt-2">
                  <ConclusionCard
                    verdict="true"
                    headline="Best value"
                    summary={`MacBook Air 15" at $1,299. Unless you need the extra GPU cores or memory bandwidth of the Pro models, the Air offers the best performance per dollar.`}
                    confidence={85}
                  />
                </div>
              </div>

              {/* Uncertainty */}
              <div className="p-3">
                <UncertaintyNote
                  reason="Clickthrough does not know your specific workflow requirements (video editing, development, design). Your actual needs may change this recommendation."
                />
              </div>
            </Panel>
          </div>
        </OverlayPositioner>
      </div>
    </div>
  );
}
