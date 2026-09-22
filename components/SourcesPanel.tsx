import type { Claim } from "@/types/chat";

export default function SourcesPanel({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) {
    return <p className="text-sm font-body-sm text-outline text-center mt-4">No sources for this response.</p>;
  }

  return (
    <ul className="space-y-4">
      {claims.map((claim, i) => {
        const src = claim.source;
        const isString = typeof src === 'string';
        const isObject = src && typeof src === 'object' ? src as { title: string, url: string, publisher?: string } : null;

        return (
        <li key={i} className="font-body-sm text-sm text-on-surface-variant border border-outline-variant rounded-xl p-4 bg-surface-container shadow-sm hover:shadow-md transition-shadow">
          <p className="font-medium text-on-surface mb-2">"{claim.claim_text}"</p>
          {src && isString ? (
            <a
              href={src}
              className="text-primary hover:underline mt-1 block truncate font-code-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {src}
            </a>
          ) : isObject && (
            <div className="mt-2 text-xs text-on-surface-variant border-t border-outline-variant pt-2 flex flex-col gap-1">
              <div className="font-semibold text-primary">{isObject.title}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {isObject.publisher && <span className="text-on-surface-variant/80 font-medium">{isObject.publisher}</span>}
                {isObject.url && (
                  <>
                    {isObject.publisher && <span className="text-outline">•</span>}
                    <a
                      href={isObject.url}
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
            </div>
          )}
        </li>
        );
      })}
    </ul>
  );
}
