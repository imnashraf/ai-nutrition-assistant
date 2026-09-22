import type { Claim, Source } from "@/types/chat";

export default function SourcesPanel({ claims, sources }: { claims: Claim[]; sources?: Source[] }) {
  if (claims.length === 0 && (!sources || sources.length === 0)) {
    return <p className="text-sm font-body-sm text-outline text-center mt-4">No sources for this response.</p>;
  }

  return (
    <div className="space-y-6">
      {claims.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Claims</h4>
          <ul className="space-y-3">
            {claims.map((claim, i) => (
              <li key={`claim-${i}`} className="font-body-sm text-sm text-on-surface-variant border border-outline-variant rounded-xl p-3 bg-surface-container shadow-sm">
                "{claim.claim_text}"
              </li>
            ))}
          </ul>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Sources</h4>
          <ul className="space-y-3">
            {sources.map((source, i) => (
              <li key={`source-${i}`} className="font-body-sm text-sm text-on-surface-variant border border-outline-variant rounded-xl p-3 bg-surface-container shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1">
                <div className="font-semibold text-primary">{source.title}</div>
                <div className="flex items-center gap-1 mt-0.5 text-xs">
                  {source.publisher && <span className="text-on-surface-variant/80 font-medium">{source.publisher}</span>}
                  {source.url && (
                    <>
                      {source.publisher && <span className="text-outline">•</span>}
                      <a
                        href={source.url}
                        className="text-secondary hover:underline truncate inline-flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        View Source
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
