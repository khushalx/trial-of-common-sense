import type { PlayerSelections } from "@/lib/playerInteractions";

export default function CourtRecord({
  selections,
  failedObjections,
}: {
  selections: PlayerSelections;
  failedObjections: string[];
}) {
  const entries = [
    selections.advice && ["Player advice", selections.advice.label],
    failedObjections.length > 0 && ["Failed objections", failedObjections.join(" · ")],
    selections.followUp && ["Cross-examination question", selections.followUp.label],
    selections.appeal && ["Final appeal", selections.appeal.label],
    selections.finalReaction && ["Final Gerald reaction", selections.finalReaction.label],
  ].filter(Boolean) as string[][];

  return (
    <details className="court-record">
      <summary>
        <span>Court record</span>
        <small>{entries.length} associate filing{entries.length === 1 ? "" : "s"}</small>
      </summary>
      <div>
        {entries.length === 0 ? (
          <p className="empty-record">No interventions entered.</p>
        ) : entries.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <p>{value}</p>
          </article>
        ))}
      </div>
    </details>
  );
}
