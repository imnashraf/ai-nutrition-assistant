import type { Claim } from "@/types/chat";

export default function SourcesPanel({ claims }: { claims: Claim[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Sources</h2>
        <p className="text-xs text-gray-400 mt-0.5">Citations appear here</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {claims.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-8">
            No sources for this response.
            <br />
            Citations will appear in Milestone 2.
          </p>
        ) : (
          <ul className="space-y-3">
            {claims.map((claim, i) => (
              <li key={i} className="text-xs text-gray-600 border rounded-lg p-3 bg-gray-50">
                <p>{claim.claim_text}</p>
                {claim.source && typeof claim.source === 'string' ? (
                  <a
                    href={claim.source}
                    className="text-blue-500 hover:underline mt-1 block truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {claim.source}
                  </a>
                ) : claim.source && (
                  <div className="mt-2 text-[10px] text-gray-500 border-t pt-2">
                    <div className="font-semibold">{claim.source.title}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-gray-400">{claim.source.publisher}</span>
                      {claim.source.url && (
                        <>
                          <span className="text-gray-300">•</span>
                          <a
                            href={claim.source.url}
                            className="text-blue-500 hover:underline truncate"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Source Link
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
