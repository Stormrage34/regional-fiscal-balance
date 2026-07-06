# Social Media Distribution Guardrails

## Open Fiscal Ledger — OG Image Asset Policy

### Rule 1: Algorithm Multiplier
Primary promotional posts MUST directly upload the raw generated `.png` asset (not a URL preview, not a link card). Platform-native image uploads receive maximum initial algorithmic weight and reach on LinkedIn, X/Twitter, and Facebook. A URL shared as a link preview signals "off-platform destination" and depresses early engagement signals.

**Do**: Attach `{municipality-slug}.png` as a native image upload to the primary post.
**Don't**: Post a URL and let the platform auto-generate a link preview card.

### Rule 2: Link Suppression Workaround
Do NOT include any external hyperlinks inside the primary parent post/tweet. All site URLs (https://fiskalenradar.org) must be placed exclusively within the secondary threaded response (second comment / reply tweet) to prevent algorithm shadow-demotion.

**Rationale**: X/Twitter, LinkedIn, and Facebook all apply reach penalties to posts containing outbound links in the primary body. A link-free image post receives full organic distribution; the link in a follow-up reply is visible to engaged users but invisible to the content-scoring filter.

**Post structure**:
1. **Primary post**: Image asset + 1-2 sentence non-clickable caption without URL
2. **Thread reply**: "🔗 Explore the full dataset: https://fiskalenradar.org"

### Rule 3: Hashtag Hygiene
Limit hashtags to 2-3 per post maximum. Place them at the end of the caption, not inline. Platform algorithms increasingly penalize hashtag-stuffed content.

**Recommended**: `#OpenFiscalLedger #Macedonia #FiscalTransparency`

### Rule 4: Post Timing
Schedule municipality spotlights in descending order of fiscal impact (largest drain/deficit first, highest surplus first). This maximizes early engagement with the most "surprising" data points.

### Rule 5: Variant Strategy
For each municipality post, generate two visual variants:
- **Wide (1200×630)**: Standard OG aspect ratio for X/Twitter/LinkedIn
- **Square (1080×1080)**: Instagram-optimized format (generate separately if needed using the same pipeline with a square viewport)
