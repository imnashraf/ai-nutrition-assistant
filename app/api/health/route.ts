/**
 * GET /api/health
 *
 * Lightweight readiness check. Verifies all required environment variables
 * are present. Does NOT make a live DB or model call — just confirms config.
 *
 * Use this after deployment to confirm env vars are set correctly before
 * running the full eval.
 */
export function GET() {
  const required = [
    "GROQ_API_KEY",
    "GROQ_MODEL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return Response.json(
      {
        ok: false,
        missing,
        message: "One or more required environment variables are not set.",
      },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    message: "All required environment variables are present.",
    timestamp: new Date().toISOString(),
  });
}
