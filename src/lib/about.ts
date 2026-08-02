/**
 * The About page's structured content.
 *
 * Copy rather than records, so it lives in code rather than in content/ —
 * there is one of each of these and none of it is a collection. Every line
 * below is either approved wording or a fact that can be checked from
 * outside this site; nothing here is an adjective.
 */

/** The line, 2012 to now. Its job is to show one path, not four hobbies. */
export const TIMELINE: { period: string; role: string; detail?: string }[] = [
  {
    period: "2012",
    role: "Enrolled at AIUB, Computer Science",
    detail: "Joined the AIUB Photography Club the same year.",
  },
  {
    period: "2013–2014",
    role: "Director of Photography, ASH Production",
    detail: "Assistant director, cinematographer, technical supervisor.",
  },
  {
    period: "2015",
    role: "Content Creator, Back Benchers Media",
    detail: "Travel photography, and writing about the technical side of it.",
  },
  {
    period: "2018",
    role: "Founded STUDIO 13 at AIUB",
    detail:
      "A virtual reality classroom and workshop programme, built with Md. Sharif Ul Abedin and Farhana Sayed Juthi. Its courses were later absorbed into AIUB's own curriculum.",
  },
  {
    period: "2018–2019",
    role: "Instructor, AIUB Continuing Education Center",
    detail: "Virtual and Mixed Reality Fundamentals — 72 hours plus consulting.",
  },
  {
    period: "2018",
    role: "Animator, Keerti Creations",
  },
  {
    period: "2019",
    role: "Left AIUB with majors in two departments",
    detail: "Computer Science, and Journalism and Mass Communication.",
  },
  {
    period: "2021",
    role: "COO, Keerti Creations",
  },
  {
    period: "2023",
    role: "CEO, Keerti Creations",
    detail:
      "Photogrammetry, 3D animation, 3D modelling and 3D printing. The heritage work begins in earnest.",
  },
  {
    period: "2024–2025",
    role: "Two national exhibitions for the Bangladesh Shilpakala Academy",
    detail:
      "The AR/VR component of the 6th National Sculpture Exhibition and of পোস্টারে জুলাই অভ্যুত্থান — exhibited elements, not documentation made afterwards.",
  },
  {
    period: "2025",
    role: "Drone light show training, China",
    detail:
      "Selected as one of nine from around 500 applicants nationwide for a month-long Bangladesh–China programme, run on the Bangladesh side through the Shilpakala Academy. A trainee, not an instructor.",
  },
  {
    period: "2026",
    role: "Three papers deposited, each with a DOI",
    detail:
      "And back at AIUB in July, running an augmented reality workshop in the building he started in.",
  },
];

/** Institutions with long relationships. All externally checkable. */
export const INSTITUTIONS: {
  name: string;
  relationship: string;
  href?: string;
  hrefLabel?: string;
}[] = [
  {
    name: "American International University-Bangladesh",
    relationship:
      "Student from 2012, Instructor at the Continuing Education Center, founder of STUDIO 13. No faculty post today — still invited back to run workshops.",
    href: "https://www.aiub.edu/esab-aiub-unit-face-organized-interactive-workshop-on-virtual-reality",
    hrefLabel: "AIUB's own record of a 2018 STUDIO 13 workshop",
  },
  {
    name: "Bangladesh Shilpakala Academy",
    relationship:
      "The AR/VR components of two consecutive national exhibitions, a third for a memorial exhibition, and the national selection for the China delegation. The Academy tours this work through schools and colleges.",
  },
  {
    name: "Bangladesh Tourism Board",
    relationship:
      "Twenty-one 360° tours published on the national tourism portal, vtour.beautifulbangladesh.gov.bd.",
    href: "https://vtour.beautifulbangladesh.gov.bd/virtualtour/SompuraMahavira_WEB/",
    hrefLabel: "Somapura Mahavihara, 203 panoramas",
  },
  {
    name: "Google",
    relationship: "Street View Trusted certification.",
  },
];

/** Things that can be checked without taking his word for any of it. */
export const VERIFIABLE: { label: string; value: string; href?: string }[] = [
  {
    label: "ORCID",
    value: "0009-0005-4498-0287",
    href: "https://orcid.org/0009-0005-4498-0287",
  },
  {
    label: "Papers",
    value: "Three, deposited on Zenodo with DOIs, CC BY 4.0",
  },
  {
    label: "Tours",
    value: "21 on the Bangladesh Tourism Board's portal",
  },
  {
    label: "Certification",
    value: "Google Street View Trusted",
  },
  {
    label: "Degree",
    value: "BSc, AIUB, 2012–2019 — Computer Science, and Journalism and Mass Communication",
  },
];

/** Where else he appears, and under which name. */
export const PROFILES: { label: string; href: string }[] = [
  { label: "ORCID", href: "https://orcid.org/0009-0005-4498-0287" },
  { label: "Zenodo", href: "https://zenodo.org/records/21744242" },
  { label: "Sketchfab", href: "https://sketchfab.com/shourov" },
  { label: "ArtStation", href: "https://www.artstation.com/shourovhassan13" },
  { label: "500px", href: "https://500px.com/p/shourovhassan" },
  { label: "Behance", href: "https://www.behance.net/kirtistudios" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/khondoker-hassan-217a0816b",
  },
];
