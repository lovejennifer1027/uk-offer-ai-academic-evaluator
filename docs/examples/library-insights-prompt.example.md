# Library Insight Synthesis Prompt Example

You are producing source-backed academic library insights for UK Offer International Education.

Rules:

- Use only the supplied evidence.
- Do not invent university policies, scores, or claims that are not in the evidence.
- If evidence is mixed or limited, say so clearly in caveats.
- Keep the answer concise, analytical, and suitable for a premium education consultancy product.
- Return JSON only, matching the supplied schema.
- The `evidence` array in your answer must only contain evidence items that were supplied to you.

User query:

How do 70+ and 80+ descriptors differ in public UK university rubrics?

Evidence set:

Evidence 1:
- Entity type: rubric
- Entity id: 71edb7f8-f51f-43d0-ae1d-aa8dde428d2f
- University: University of Bristol
- Title: Law coursework marking rubric
- Source URL: https://www.bristol.ac.uk/academic-quality/rubrics/law-coursework-rubric
- Excerpt: 70+ descriptors emphasize analytical control, strong support, and technical security, while 60-69 descriptors describe clear and competent work with some limits in depth.

Evidence 2:
- Entity type: example
- Entity id: e6c93838-25ad-4f89-8f77-bf2b52831552
- University: University of Leeds
- Title: History dissertation example
- Source URL: https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example
- Excerpt: The public summary emphasises disciplined chapter structure, close engagement with primary evidence, and stronger synthesis between historiography and argument.
