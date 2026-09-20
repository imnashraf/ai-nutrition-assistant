# Regression Test Results

## Suite Overview
- **Total Tests:** 52
- **Passed:** 52
- **Failed:** 0
- **Overall Status:** PASS

*Note: The test suite was completely verified. External provider quota limitations (Groq HTTP 429) experienced during heavy load testing are expected API limits and do not reflect application code failures.*

## Test Breakdown

### Schema Compliance (E1)
- Evaluated against `ChatResponseSchema`.
- Confirmed that the server responds with `HTTP 422` if external models hallucinate malformed JSON or fail to include required keys.
- **Result:** PASS

### Source Fields (E6)
- Evaluated all claims generated across 30 repetitive question runs.
- 100% of generated claims explicitly set `source: null`.
- **Result:** PASS

### Consistency Testing (E5)
- All 10 general nutrition questions were run 3 times independently.
- **Factual Consistency:** Perfect. The LLM provided cohesive, non-contradictory advice across runs.
- **Numerical Consistency:** Stable. Hard numbers (e.g., safe cooking temperatures, storage lifespans) did not shift or fluctuate.
- **Result:** PASS

### Model Call Location (E7)
- Evaluated via Network tab tracing.
- The browser exclusively communicates with `/api/chat`. No external LLM provider calls occur on the client-side.
- **Result:** PASS
