export interface AcademicSchoolProfile {
  id: string;
  name: string;
  shortName: string;
  supportNote: string;
  focusAreas: string[];
}

function createSchool(
  id: string,
  name: string,
  shortName: string,
  supportNote: string,
  focusAreas: string[]
): AcademicSchoolProfile {
  return { id, name, shortName, supportNote, focusAreas };
}

export const academicSchoolProfiles: AcademicSchoolProfile[] = [
  createSchool("uea", "University of East Anglia", "UEA", "Prioritise UEA module briefs, marking descriptors, and course packet language when available.", [
    "rubric alignment",
    "critical analysis",
    "module expectations"
  ]),
  createSchool("surrey", "University of Surrey", "Surrey", "Use Surrey-specific teaching materials and assessment wording before falling back to general standards.", [
    "assignment structure",
    "source use",
    "assessment fit"
  ]),
  createSchool("aberystwyth", "Aberystwyth University", "Aberystwyth", "Lean on uploaded Aberystwyth module documentation and school-level assignment expectations.", [
    "research fit",
    "argumentation",
    "presentation"
  ]),
  createSchool("lincoln", "University of Lincoln", "Lincoln", "Use Lincoln-facing criteria, brief language, and lecturer guidance as the primary evaluation frame.", [
    "deliverables",
    "clarity",
    "rubric-first"
  ]),
  createSchool("bangor", "Bangor University", "Bangor", "Use Bangor module guidance and lecturer-facing assessment cues to shape the evaluation lens.", [
    "assignment fit",
    "source use",
    "clarity of structure"
  ]),
  createSchool("oxford-brookes", "Oxford Brookes University", "Oxford Brookes", "Weight Oxford Brookes assignment requirements and uploaded school materials first.", [
    "brief interpretation",
    "criticality",
    "evidence synthesis"
  ]),
  createSchool("essex", "University of Essex", "Essex", "Prioritise Essex teaching notes, module briefs, and assessment descriptors when evaluating.", [
    "argument quality",
    "evidence use",
    "citation standards"
  ]),
  createSchool("kent", "University of Kent", "Kent", "Use Kent-specific rubrics, lecturer notes, and assignment wording as the core support layer.", [
    "school fit",
    "analysis",
    "structure"
  ]),
  createSchool("coventry", "Coventry University", "Coventry", "Evaluate in line with Coventry assignment demands and uploaded programme guidance.", [
    "applied analysis",
    "deliverables",
    "clarity"
  ]),
  createSchool("keele", "Keele University", "Keele", "Reference Keele-facing module materials and evaluation descriptors where available.", [
    "critical discussion",
    "structure",
    "academic tone"
  ]),
  createSchool("sunderland", "University of Sunderland", "Sunderland", "Use Sunderland module expectations and uploaded marking cues before general standards.", [
    "task response",
    "evidence handling",
    "language quality"
  ]),
  createSchool("hull", "University of Hull", "Hull", "Reference Hull-facing assignment criteria and uploaded feedback patterns where relevant.", [
    "argument quality",
    "evidence handling",
    "presentation standards"
  ]),
  createSchool("de-montfort", "De Montfort University", "DMU", "Use De Montfort materials and marking guidance as the primary reference frame.", [
    "rubric alignment",
    "criticality",
    "source integration"
  ]),
  createSchool("greenwich", "University of Greenwich", "Greenwich", "Prioritise Greenwich programme guidance and uploaded module-specific requirements.", [
    "module fit",
    "research depth",
    "assessment criteria"
  ]),
  createSchool("huddersfield", "University of Huddersfield", "Huddersfield", "Evaluate using Huddersfield assessment language and uploaded teaching materials first.", [
    "structure",
    "evidence",
    "academic style"
  ]),
  createSchool("middlesex", "Middlesex University", "Middlesex", "Use Middlesex school materials and module-specific criteria to shape the assessment.", [
    "deliverables",
    "argument",
    "referencing"
  ]),
  createSchool("uclan", "University of Central Lancashire", "UCLan", "Prioritise UCLan module documents and uploaded grading descriptors when relevant.", [
    "task focus",
    "clarity",
    "source application"
  ]),
  createSchool("south-wales", "University of South Wales", "USW", "Evaluate with attention to professional practice requirements and module-specific deliverables.", [
    "deliverables",
    "applied analysis",
    "academic tone"
  ]),
  createSchool("hertfordshire", "University of Hertfordshire", "Hertfordshire", "Lean on Hertfordshire rubrics, brief language, and uploaded notes before general standards.", [
    "rubric-first",
    "argument flow",
    "evidence fit"
  ]),
  createSchool("uwe", "University of the West of England", "UWE", "Lean on uploaded UWE teaching materials, briefs, and feedback markers before using general standards.", [
    "brief interpretation",
    "research depth",
    "referencing quality"
  ]),
  createSchool("teesside", "Teesside University", "Teesside", "Use Teesside module guidance and school-specific expectations as the first evaluation lens.", [
    "structure",
    "criticality",
    "presentation"
  ]),
  createSchool("northampton", "University of Northampton", "Northampton", "Reference Northampton materials and assignment descriptors to inform the report.", [
    "assessment fit",
    "source integration",
    "language quality"
  ]),
  createSchool("bradford", "University of Bradford", "Bradford", "Prioritise Bradford course materials, uploaded rubrics, and module expectations.", [
    "module expectations",
    "argument quality",
    "citation consistency"
  ]),
  createSchool("portsmouth", "University of Portsmouth", "Portsmouth", "Use Portsmouth-facing marking criteria and uploaded teaching resources when relevant.", [
    "deliverables",
    "critical analysis",
    "structure"
  ]),
  createSchool("westminster", "University of Westminster", "Westminster", "Weight Westminster module requirements, assessment descriptors, and uploaded materials first.", [
    "evidence use",
    "brief alignment",
    "academic tone"
  ]),
  createSchool("chichester", "University of Chichester", "Chichester", "Use Chichester school guidance and uploaded assignment instructions as core context.", [
    "clarity",
    "rubric fit",
    "analysis depth"
  ]),
  createSchool("swansea", "Swansea University", "Swansea", "Evaluate against Swansea documents, briefs, and uploaded course-level requirements before defaults.", [
    "criticality",
    "school style",
    "evidence use"
  ]),
  createSchool("cardiff", "Cardiff University", "Cardiff", "Weight Cardiff-specific assessment descriptors and disciplinary expectations first.", [
    "criticality",
    "evidence synthesis",
    "structure"
  ])
];

export function resolveAcademicSchoolProfile(input: string) {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return academicSchoolProfiles[0];
  }

  return (
    academicSchoolProfiles.find((school) => {
      return [school.id, school.name, school.shortName].some((value) => value.toLowerCase() === normalized);
    }) ?? {
      id: normalized.replace(/\s+/g, "-"),
      name: input.trim(),
      shortName: input.trim(),
      supportNote: "Use the uploaded school materials and project evidence as the primary evaluation context.",
      focusAreas: ["rubric alignment", "assignment fit", "evidence use"]
    }
  );
}

export function buildAcademicSchoolOptions(currentSchool?: string) {
  const base = [...academicSchoolProfiles];
  const normalizedCurrent = currentSchool?.trim();

  if (!normalizedCurrent) {
    return base;
  }

  const alreadyIncluded = base.some((school) => {
    return [school.name, school.shortName, school.id].some((value) => value.toLowerCase() === normalizedCurrent.toLowerCase());
  });

  if (alreadyIncluded) {
    return base;
  }

  return [
    {
      id: normalizedCurrent.toLowerCase().replace(/\s+/g, "-"),
      name: normalizedCurrent,
      shortName: normalizedCurrent,
      supportNote: "Use the uploaded school materials and project evidence as the primary evaluation context.",
      focusAreas: ["rubric alignment", "assignment fit", "evidence use"]
    },
    ...base
  ];
}
