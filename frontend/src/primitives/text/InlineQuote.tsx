import { cn } from "@/utils/classNames";
import type { InlineQuoteProps } from "@/types/primitives";

export function InlineQuote({ quote, source, highlight, className }: InlineQuoteProps & { className?: string }) {
  const displayQuote = typeof quote === "string" && quote.trim() ? quote : "No quote available.";

  const renderQuote = () => {
    if (!highlight || !displayQuote.includes(highlight)) {
      return <span>{displayQuote}</span>;
    }
    const parts = displayQuote.split(highlight);
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <mark className="bg-transparent text-[#000000] font-semibold">{highlight}</mark>
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className={cn("pl-[12px] border-l-2 border-[#000000]", className)} data-ct-primitive="InlineQuote">
      <p className="font-['Geist'] text-[12px] text-[#6b6b6b] italic leading-relaxed">&ldquo;{renderQuote()}&rdquo;</p>
      {source && (
        <p className="font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] mt-[4px]">&mdash; {source}</p>
      )}
    </div>
  );
}
