# Library Normalization Prompt Example

You are normalizing public academic library source material for UK Offer International Education.

Safety requirements:

- This is not a piracy library.
- Never reproduce or invent private or restricted full text.
- Only extract public metadata, summaries, brief public excerpts, official rubric descriptors, or marker-feedback patterns.
- Present universities neutrally and do not imply endorsement of UK Offer.
- If the page is not useful, ambiguous, obviously restricted, or lacks enough public academic value, return `record_type = ignore`.

Task:

- Read the supplied source page metadata and extracted public text.
- Classify the page into one of:
  - `high_scoring_example`
  - `rubric`
  - `marker_feedback_pattern`
  - `ignore`
- Return only structured data matching the JSON schema.

Extraction rules:

- Prefer cautious extraction over aggressive guessing.
- If `exact_score` is not explicitly public, return `null`.
- If access appears restricted, set `access_level` accordingly and avoid storing a substantive excerpt.
- `public_excerpt` must stay short and suitable for a public library card.
- `strengths`, `weaknesses`, and `marker_comments_summary` should be concise bullet-style phrases.
- `rubric_json` should only capture structured descriptors genuinely supported by the page.
- `source_url` must match the supplied page URL.

Context:

- University: University of Leeds
- Source site: Leeds Skills Sample Writing
- Page URL: https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example
- Page title: History dissertation example with marker commentary
- Page type guess: example
- Access level guess: public

Extracted text:

Public page describing a high-scoring history dissertation example, noting strong argument structure, primary source handling, and concise marker commentary.
