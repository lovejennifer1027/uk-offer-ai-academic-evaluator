import type { LibrarySnapshot } from "@/lib/library/types";

function nowMinus(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const librarySeedSnapshot: LibrarySnapshot = {
  universities: [
    {
      id: "13d5feeb-80f6-4f1a-a541-d2447eb713d4",
      name: "University of Leeds",
      short_name: "Leeds",
      country: "UK",
      website_url: "https://www.leeds.ac.uk",
      logo_url: null,
      is_active: true,
      created_at: nowMinus(90),
      updated_at: nowMinus(4)
    },
    {
      id: "0ae7b769-2ce3-4578-9f82-03f6af5e2102",
      name: "University of Bristol",
      short_name: "Bristol",
      country: "UK",
      website_url: "https://www.bristol.ac.uk",
      logo_url: null,
      is_active: true,
      created_at: nowMinus(90),
      updated_at: nowMinus(5)
    },
    {
      id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      name: "University of York",
      short_name: "York",
      country: "UK",
      website_url: "https://www.york.ac.uk",
      logo_url: null,
      is_active: true,
      created_at: nowMinus(90),
      updated_at: nowMinus(7)
    }
  ],
  source_sites: [
    {
      id: "c7d1d9d4-a4fd-4b19-8cb1-962cfe30392f",
      university_id: "13d5feeb-80f6-4f1a-a541-d2447eb713d4",
      name: "Leeds Skills Sample Writing",
      base_url: "https://library.leeds.ac.uk/skills-writing-samples",
      source_type: "mixed",
      parser_type: "html",
      is_active: true,
      crawl_frequency: "weekly",
      last_crawled_at: nowMinus(1),
      notes: "Placeholder public sample writing library feed.",
      created_at: nowMinus(60),
      updated_at: nowMinus(2)
    },
    {
      id: "11a6cdad-6754-4c93-bc23-546ac386fa0e",
      university_id: "0ae7b769-2ce3-4578-9f82-03f6af5e2102",
      name: "Bristol Assessment Rubrics",
      base_url: "https://www.bristol.ac.uk/academic-quality/rubrics",
      source_type: "rubric",
      parser_type: "html",
      is_active: true,
      crawl_frequency: "weekly",
      last_crawled_at: nowMinus(2),
      notes: "Placeholder public rubric descriptors.",
      created_at: nowMinus(50),
      updated_at: nowMinus(3)
    },
    {
      id: "8f19d1d6-c02f-4251-854f-9ebf5289ed84",
      university_id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      name: "York Feedback Guide PDFs",
      base_url: "https://www.york.ac.uk/students/studying/feedback-guides",
      source_type: "feedback_guide",
      parser_type: "mixed",
      is_active: true,
      crawl_frequency: "monthly",
      last_crawled_at: nowMinus(6),
      notes: "Placeholder public feedback guidance pages.",
      created_at: nowMinus(40),
      updated_at: nowMinus(6)
    }
  ],
  source_pages: [
    {
      id: "0db8c87f-1962-4f5c-b4b6-8d12d89c43f7",
      source_site_id: "c7d1d9d4-a4fd-4b19-8cb1-962cfe30392f",
      university_id: "13d5feeb-80f6-4f1a-a541-d2447eb713d4",
      page_url: "https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example",
      page_title: "History dissertation example with marker commentary",
      page_type: "example",
      content_hash: "sample-hash-1",
      raw_html: null,
      raw_text:
        "Public page describing a high-scoring history dissertation example, noting strong argument structure, primary source handling, and concise marker commentary.",
      content_length: 1420,
      http_status: 200,
      access_level: "public",
      first_seen_at: nowMinus(20),
      last_seen_at: nowMinus(1),
      last_changed_at: nowMinus(10),
      is_deleted: false,
      created_at: nowMinus(20),
      updated_at: nowMinus(1)
    },
    {
      id: "e0b1918a-7dc8-410e-bec3-56714318e594",
      source_site_id: "11a6cdad-6754-4c93-bc23-546ac386fa0e",
      university_id: "0ae7b769-2ce3-4578-9f82-03f6af5e2102",
      page_url: "https://www.bristol.ac.uk/academic-quality/rubrics/law-coursework-rubric",
      page_title: "Law coursework marking rubric",
      page_type: "rubric",
      content_hash: "sample-hash-2",
      raw_html: null,
      raw_text:
        "Public rubric page outlining 70+, 60-69, 50-59, and below descriptors for legal analysis, structure, authority usage, and referencing.",
      content_length: 1240,
      http_status: 200,
      access_level: "public",
      first_seen_at: nowMinus(18),
      last_seen_at: nowMinus(2),
      last_changed_at: nowMinus(11),
      is_deleted: false,
      created_at: nowMinus(18),
      updated_at: nowMinus(2)
    },
    {
      id: "8ef30ceb-3699-467f-a730-d4dd7a569f15",
      source_site_id: "8f19d1d6-c02f-4251-854f-9ebf5289ed84",
      university_id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      page_url: "https://www.york.ac.uk/students/studying/feedback-guides/essay-feedback-summary.pdf",
      page_title: "Essay feedback summary",
      page_type: "feedback",
      content_hash: "sample-hash-3",
      raw_html: null,
      raw_text:
        "Public feedback guide summarising common tutor feedback on clarity, evidence, and critical analysis across undergraduate essays.",
      content_length: 980,
      http_status: 200,
      access_level: "public",
      first_seen_at: nowMinus(17),
      last_seen_at: nowMinus(6),
      last_changed_at: nowMinus(14),
      is_deleted: false,
      created_at: nowMinus(17),
      updated_at: nowMinus(6)
    }
  ],
  crawl_runs: [
    {
      id: "5b4e6dbf-55c8-414e-9e16-3e6ec0227b74",
      trigger_type: "scheduled",
      status: "completed",
      started_at: nowMinus(1),
      finished_at: nowMinus(1),
      pages_checked: 14,
      pages_new: 1,
      pages_updated: 2,
      pages_failed: 0,
      error_log: null,
      created_by: "system",
      created_at: nowMinus(1)
    },
    {
      id: "5c97895b-8dbc-4934-a4ec-1cd0b8189f9f",
      trigger_type: "manual",
      status: "partial",
      started_at: nowMinus(7),
      finished_at: nowMinus(7),
      pages_checked: 11,
      pages_new: 0,
      pages_updated: 1,
      pages_failed: 1,
      error_log: "One placeholder PDF failed to parse during local seed generation.",
      created_by: "admin@example.com",
      created_at: nowMinus(7)
    }
  ],
  normalization_runs: [
    {
      id: "90fc8780-fb52-481b-bd5d-163f6f4873c1",
      crawl_run_id: "5b4e6dbf-55c8-414e-9e16-3e6ec0227b74",
      source_page_id: "0db8c87f-1962-4f5c-b4b6-8d12d89c43f7",
      status: "completed",
      model_name: "gpt-5.4-mini",
      prompt_version: "library-normalization-v1",
      input_tokens: 1124,
      output_tokens: 418,
      raw_model_response: {
        record_type: "high_scoring_example",
        title: "History dissertation example"
      },
      error_log: null,
      started_at: nowMinus(1),
      finished_at: nowMinus(1),
      created_at: nowMinus(1)
    },
    {
      id: "9dc26d27-a79f-4aba-899c-76e60e4b1aa7",
      crawl_run_id: "5b4e6dbf-55c8-414e-9e16-3e6ec0227b74",
      source_page_id: "e0b1918a-7dc8-410e-bec3-56714318e594",
      status: "completed",
      model_name: "gpt-5.4-mini",
      prompt_version: "library-normalization-v1",
      input_tokens: 1048,
      output_tokens: 352,
      raw_model_response: {
        record_type: "rubric",
        rubric_name: "Law coursework marking rubric"
      },
      error_log: null,
      started_at: nowMinus(1),
      finished_at: nowMinus(1),
      created_at: nowMinus(1)
    }
  ],
  high_scoring_examples: [
    {
      id: "e6c93838-25ad-4f89-8f77-bf2b52831552",
      source_page_id: "0db8c87f-1962-4f5c-b4b6-8d12d89c43f7",
      university_id: "13d5feeb-80f6-4f1a-a541-d2447eb713d4",
      department: "History",
      programme_level: "masters",
      assignment_type: "dissertation",
      title: "History dissertation example",
      year_label: "2024 archive",
      exact_score: 82,
      score_band: "80+",
      public_excerpt:
        "The public summary emphasises a disciplined chapter structure, close engagement with primary evidence, and strong synthesis between historiography and argument.",
      strengths: [
        "章节结构清楚，研究问题与论证路径能被快速识别。",
        "史料与二手文献之间建立了清晰的分析关系。",
        "结论能够回到研究问题，而不是只重复前文。"
      ],
      weaknesses: [
        "部分章节之间的过渡还可以更凝练。",
        "个别方法论说明略显简短。",
        "脚注规范性仍有少量可优化空间。"
      ],
      marker_comments_summary: [
        "Marker commentary highlights strong analytical control.",
        "Evidence selection is described as purposeful rather than decorative.",
        "Technical presentation is strong but not flawless."
      ],
      ai_summary:
        "This example signals that high-scoring UK dissertation writing often combines clear chapter architecture with sustained analytical control and carefully chosen evidence.",
      source_url: "https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example",
      access_level: "public",
      is_verified: true,
      verified_by: "editor@ukoffer.example",
      verified_at: nowMinus(1),
      created_at: nowMinus(10),
      updated_at: nowMinus(1)
    },
    {
      id: "58ba488b-ef6a-4ba7-84e7-dfd7c2f02ba0",
      source_page_id: "8ef30ceb-3699-467f-a730-d4dd7a569f15",
      university_id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      department: "English",
      programme_level: "undergraduate",
      assignment_type: "essay",
      title: "Essay feedback summary patterns",
      year_label: "Current guide",
      exact_score: null,
      score_band: "70+ patterns",
      public_excerpt:
        "The guide repeatedly links stronger essays with clearer paragraph purpose, closer evidence analysis, and more explicit critical positioning.",
      strengths: [
        "高分段常见优势是段落目标明确。",
        "证据与论点之间的解释关系更紧密。",
        "写作语气更稳定，避免口语化滑坡。"
      ],
      weaknesses: [
        "若只做描述而缺少解释，分数通常难以上探。",
        "引用不一致会拖累整体专业感。",
        "结尾如果只总结而不判断，容易停在中高分。"
      ],
      marker_comments_summary: [
        "Feedback language often rewards explicit interpretation.",
        "Weak scripts are described as descriptive rather than analytical."
      ],
      ai_summary:
        "Even where exact scores are not published, public feedback guides still reveal repeatable markers of higher-band UK university writing.",
      source_url: "https://www.york.ac.uk/students/studying/feedback-guides/essay-feedback-summary.pdf",
      access_level: "public",
      is_verified: false,
      verified_by: null,
      verified_at: null,
      created_at: nowMinus(13),
      updated_at: nowMinus(6)
    }
  ],
  rubrics: [
    {
      id: "71edb7f8-f51f-43d0-ae1d-aa8dde428d2f",
      source_page_id: "e0b1918a-7dc8-410e-bec3-56714318e594",
      university_id: "0ae7b769-2ce3-4578-9f82-03f6af5e2102",
      department: "Law",
      programme_level: "undergraduate",
      rubric_name: "Law coursework marking rubric",
      rubric_text:
        "Official public descriptors summarising expectations for legal reasoning, authority use, structure, originality, and technical referencing across major score bands.",
      rubric_json: {
        criteria: [
          {
            criterion: "Legal analysis",
            descriptor: "Demonstrates confident analysis of authorities and legal issues.",
            band_label: "70+"
          },
          {
            criterion: "Structure",
            descriptor: "Sustains a clear and disciplined argument structure.",
            band_label: "60-69"
          }
        ],
        notes: ["Neutral university presentation only.", "Source remains the original public rubric URL."]
      },
      score_ranges: [
        {
          label: "70+",
          minimum: 70,
          maximum: 100,
          descriptor: "Consistently analytical, well supported, and technically secure."
        },
        {
          label: "60-69",
          minimum: 60,
          maximum: 69,
          descriptor: "Clear, competent, and well evidenced, with some limits in depth or precision."
        }
      ],
      source_url: "https://www.bristol.ac.uk/academic-quality/rubrics/law-coursework-rubric",
      is_verified: true,
      created_at: nowMinus(12),
      updated_at: nowMinus(2)
    }
  ],
  marker_feedback_patterns: [
    {
      id: "10d250bb-cbc7-4a25-b434-0fbbe2d9e611",
      source_page_id: "8ef30ceb-3699-467f-a730-d4dd7a569f15",
      university_id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      programme_level: "undergraduate",
      feedback_type: "strength",
      feedback_text: "Clear paragraph focus helps readers follow the line of argument.",
      category: "structure",
      source_url: "https://www.york.ac.uk/students/studying/feedback-guides/essay-feedback-summary.pdf",
      created_at: nowMinus(6)
    },
    {
      id: "d0ed65a0-c628-438e-bc9d-f6c5227d5678",
      source_page_id: "8ef30ceb-3699-467f-a730-d4dd7a569f15",
      university_id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      programme_level: "undergraduate",
      feedback_type: "weakness",
      feedback_text: "Sections remain descriptive and stop short of interpretation.",
      category: "critical_thinking",
      source_url: "https://www.york.ac.uk/students/studying/feedback-guides/essay-feedback-summary.pdf",
      created_at: nowMinus(6)
    },
    {
      id: "b9c10223-8ac8-4b24-922a-0b200afad5ef",
      source_page_id: "8ef30ceb-3699-467f-a730-d4dd7a569f15",
      university_id: "2da9d9c0-5c4b-4724-ab67-dc23bc665835",
      programme_level: "undergraduate",
      feedback_type: "suggestion",
      feedback_text: "Explain why each quotation matters instead of letting evidence stand alone.",
      category: "literature",
      source_url: "https://www.york.ac.uk/students/studying/feedback-guides/essay-feedback-summary.pdf",
      created_at: nowMinus(6)
    }
  ],
  library_embeddings: [
    {
      id: "df8d3cb1-f98b-411f-afab-4fa8315c9af8",
      entity_type: "example",
      entity_id: "e6c93838-25ad-4f89-8f77-bf2b52831552",
      chunk_text:
        "History dissertation example highlighting strong chapter architecture, primary evidence handling, and analytical control.",
      chunk_index: 0,
      embedding: null,
      created_at: nowMinus(1)
    },
    {
      id: "73457abf-2bcc-4993-b8a8-cf442ef42a01",
      entity_type: "rubric",
      entity_id: "71edb7f8-f51f-43d0-ae1d-aa8dde428d2f",
      chunk_text:
        "Law coursework rubric describing 70+ and 60-69 expectations for legal analysis, structure, and referencing.",
      chunk_index: 0,
      embedding: null,
      created_at: nowMinus(1)
    }
  ]
};

export function createLibrarySeedSnapshot(): LibrarySnapshot {
  return JSON.parse(JSON.stringify(librarySeedSnapshot)) as LibrarySnapshot;
}
