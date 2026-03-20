insert into public.universities (
  id,
  name,
  short_name,
  country,
  website_url,
  logo_url,
  is_active
) values
  (
    '13d5feeb-80f6-4f1a-a541-d2447eb713d4',
    'University of Leeds',
    'Leeds',
    'UK',
    'https://www.leeds.ac.uk',
    null,
    true
  ),
  (
    '0ae7b769-2ce3-4578-9f82-03f6af5e2102',
    'University of Bristol',
    'Bristol',
    'UK',
    'https://www.bristol.ac.uk',
    null,
    true
  ),
  (
    '2da9d9c0-5c4b-4724-ab67-dc23bc665835',
    'University of York',
    'York',
    'UK',
    'https://www.york.ac.uk',
    null,
    true
  )
on conflict (id) do nothing;

insert into public.source_sites (
  id,
  university_id,
  name,
  base_url,
  source_type,
  parser_type,
  is_active,
  crawl_frequency,
  last_crawled_at,
  notes
) values
  (
    'c7d1d9d4-a4fd-4b19-8cb1-962cfe30392f',
    '13d5feeb-80f6-4f1a-a541-d2447eb713d4',
    'Leeds Skills Sample Writing',
    'https://library.leeds.ac.uk/skills-writing-samples',
    'mixed',
    'html',
    true,
    'weekly',
    now() - interval '1 day',
    'Placeholder public sample writing library feed.'
  ),
  (
    '11a6cdad-6754-4c93-bc23-546ac386fa0e',
    '0ae7b769-2ce3-4578-9f82-03f6af5e2102',
    'Bristol Assessment Rubrics',
    'https://www.bristol.ac.uk/academic-quality/rubrics',
    'rubric',
    'html',
    true,
    'weekly',
    now() - interval '2 days',
    'Placeholder public rubric descriptors.'
  ),
  (
    '8f19d1d6-c02f-4251-854f-9ebf5289ed84',
    '2da9d9c0-5c4b-4724-ab67-dc23bc665835',
    'York Feedback Guide PDFs',
    'https://www.york.ac.uk/students/studying/feedback-guides',
    'feedback_guide',
    'mixed',
    true,
    'monthly',
    now() - interval '6 days',
    'Placeholder public feedback guidance pages.'
  )
on conflict (id) do nothing;

insert into public.source_pages (
  id,
  source_site_id,
  university_id,
  page_url,
  page_title,
  page_type,
  content_hash,
  raw_text,
  content_length,
  http_status,
  access_level,
  first_seen_at,
  last_seen_at,
  last_changed_at,
  is_deleted
) values
  (
    '0db8c87f-1962-4f5c-b4b6-8d12d89c43f7',
    'c7d1d9d4-a4fd-4b19-8cb1-962cfe30392f',
    '13d5feeb-80f6-4f1a-a541-d2447eb713d4',
    'https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example',
    'History dissertation example with marker commentary',
    'example',
    'sample-hash-1',
    'Public page describing a high-scoring history dissertation example, noting strong argument structure, primary source handling, and concise marker commentary.',
    1420,
    200,
    'public',
    now() - interval '20 days',
    now() - interval '1 day',
    now() - interval '10 days',
    false
  ),
  (
    'e0b1918a-7dc8-410e-bec3-56714318e594',
    '11a6cdad-6754-4c93-bc23-546ac386fa0e',
    '0ae7b769-2ce3-4578-9f82-03f6af5e2102',
    'https://www.bristol.ac.uk/academic-quality/rubrics/law-coursework-rubric',
    'Law coursework marking rubric',
    'rubric',
    'sample-hash-2',
    'Public rubric page outlining 70+, 60-69, 50-59, and below descriptors for legal analysis, structure, authority usage, and referencing.',
    1240,
    200,
    'public',
    now() - interval '18 days',
    now() - interval '2 days',
    now() - interval '11 days',
    false
  )
on conflict (source_site_id, page_url) do nothing;

insert into public.crawl_runs (
  id,
  trigger_type,
  status,
  started_at,
  finished_at,
  pages_checked,
  pages_new,
  pages_updated,
  pages_failed,
  error_log,
  created_by
) values
  (
    '5b4e6dbf-55c8-414e-9e16-3e6ec0227b74',
    'scheduled',
    'completed',
    now() - interval '1 day',
    now() - interval '1 day' + interval '7 minutes',
    14,
    1,
    2,
    0,
    null,
    'system'
  )
on conflict (id) do nothing;

insert into public.normalization_runs (
  id,
  crawl_run_id,
  source_page_id,
  status,
  model_name,
  prompt_version,
  input_tokens,
  output_tokens,
  raw_model_response,
  error_log,
  started_at,
  finished_at
) values
  (
    '90fc8780-fb52-481b-bd5d-163f6f4873c1',
    '5b4e6dbf-55c8-414e-9e16-3e6ec0227b74',
    '0db8c87f-1962-4f5c-b4b6-8d12d89c43f7',
    'completed',
    'gpt-5.4-mini',
    'library-normalization-v1',
    1124,
    418,
    '{"record_type":"high_scoring_example","title":"History dissertation example"}'::jsonb,
    null,
    now() - interval '1 day',
    now() - interval '1 day' + interval '1 minute'
  ),
  (
    '9dc26d27-a79f-4aba-899c-76e60e4b1aa7',
    '5b4e6dbf-55c8-414e-9e16-3e6ec0227b74',
    'e0b1918a-7dc8-410e-bec3-56714318e594',
    'completed',
    'gpt-5.4-mini',
    'library-normalization-v1',
    1048,
    352,
    '{"record_type":"rubric","rubric_name":"Law coursework marking rubric"}'::jsonb,
    null,
    now() - interval '1 day',
    now() - interval '1 day' + interval '2 minutes'
  )
on conflict (id) do nothing;

insert into public.high_scoring_examples (
  id,
  source_page_id,
  university_id,
  department,
  programme_level,
  assignment_type,
  title,
  year_label,
  exact_score,
  score_band,
  public_excerpt,
  strengths,
  weaknesses,
  marker_comments_summary,
  ai_summary,
  source_url,
  access_level,
  is_verified,
  verified_by,
  verified_at
) values (
  'e6c93838-25ad-4f89-8f77-bf2b52831552',
  '0db8c87f-1962-4f5c-b4b6-8d12d89c43f7',
  '13d5feeb-80f6-4f1a-a541-d2447eb713d4',
  'History',
  'masters',
  'dissertation',
  'History dissertation example',
  '2024 archive',
  82,
  '80+',
  'The public summary emphasises a disciplined chapter structure, close engagement with primary evidence, and strong synthesis between historiography and argument.',
  '["章节结构清楚，研究问题与论证路径能被快速识别。","史料与二手文献之间建立了清晰的分析关系。","结论能够回到研究问题，而不是只重复前文。"]'::jsonb,
  '["部分章节之间的过渡还可以更凝练。","个别方法论说明略显简短。","脚注规范性仍有少量可优化空间。"]'::jsonb,
  '["Marker commentary highlights strong analytical control.","Evidence selection is described as purposeful rather than decorative.","Technical presentation is strong but not flawless."]'::jsonb,
  'This example signals that high-scoring UK dissertation writing often combines clear chapter architecture with sustained analytical control and carefully chosen evidence.',
  'https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example',
  'public',
  true,
  'editor@ukoffer.example',
  now() - interval '1 day'
)
on conflict (source_page_id) do nothing;

insert into public.rubrics (
  id,
  source_page_id,
  university_id,
  department,
  programme_level,
  rubric_name,
  rubric_text,
  rubric_json,
  score_ranges,
  source_url,
  is_verified
) values (
  '71edb7f8-f51f-43d0-ae1d-aa8dde428d2f',
  'e0b1918a-7dc8-410e-bec3-56714318e594',
  '0ae7b769-2ce3-4578-9f82-03f6af5e2102',
  'Law',
  'undergraduate',
  'Law coursework marking rubric',
  'Official public descriptors summarising expectations for legal reasoning, authority use, structure, originality, and technical referencing across major score bands.',
  '{"criteria":[{"criterion":"Legal analysis","descriptor":"Demonstrates confident analysis of authorities and legal issues.","band_label":"70+"},{"criterion":"Structure","descriptor":"Sustains a clear and disciplined argument structure.","band_label":"60-69"}],"notes":["Neutral university presentation only.","Source remains the original public rubric URL."]}'::jsonb,
  '[{"label":"70+","minimum":70,"maximum":100,"descriptor":"Consistently analytical, well supported, and technically secure."},{"label":"60-69","minimum":60,"maximum":69,"descriptor":"Clear, competent, and well evidenced, with some limits in depth or precision."}]'::jsonb,
  'https://www.bristol.ac.uk/academic-quality/rubrics/law-coursework-rubric',
  true
)
on conflict (source_page_id) do nothing;

insert into public.marker_feedback_patterns (
  id,
  source_page_id,
  university_id,
  programme_level,
  feedback_type,
  feedback_text,
  category,
  source_url
) values
  (
    '10d250bb-cbc7-4a25-b434-0fbbe2d9e611',
    '0db8c87f-1962-4f5c-b4b6-8d12d89c43f7',
    '13d5feeb-80f6-4f1a-a541-d2447eb713d4',
    'masters',
    'strength',
    'Clear paragraph focus helps readers follow the line of argument.',
    'structure',
    'https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example'
  ),
  (
    'd0ed65a0-c628-438e-bc9d-f6c5227d5678',
    '0db8c87f-1962-4f5c-b4b6-8d12d89c43f7',
    '13d5feeb-80f6-4f1a-a541-d2447eb713d4',
    'masters',
    'weakness',
    'Sections remain descriptive and stop short of interpretation.',
    'critical_thinking',
    'https://library.leeds.ac.uk/skills-writing-samples/history-dissertation-example'
  )
on conflict (id) do nothing;
