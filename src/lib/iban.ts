// Minimal German Bankleitzahl → Bank name lookup for demo purposes.
// Real apps would query the Deutsche Bundesbank BLZ-Datei.
const BLZ_MAP: Record<string, string> = {
  "10000000": "Bundesbank",
  "10010010": "Postbank",
  "10010424": "ING-DiBa",
  "10011001": "N26 Bank",
  "10070000": "Deutsche Bank",
  "10070024": "Deutsche Bank",
  "10080000": "Commerzbank",
  "10090000": "Berliner Volksbank",
  "12030000": "DKB - Deutsche Kreditbank",
  "20030000": "Hamburger Bank",
  "20050550": "Hamburger Sparkasse",
  "30070024": "Deutsche Bank Düsseldorf",
  "37040044": "Commerzbank Köln",
  "37050198": "Sparkasse KölnBonn",
  "50010517": "ING-DiBa Frankfurt",
  "50070010": "Deutsche Bank Frankfurt",
  "50070024": "Deutsche Bank Frankfurt",
  "50105517": "ING-DiBa",
  "60050101": "Landesbank Baden-Württemberg",
  "60090100": "Volksbank Stuttgart",
  "70020270": "UniCredit Bank - HypoVereinsbank",
  "70150000": "Stadtsparkasse München",
  "70151230": "Sparkasse München",
  "70169464": "Volksbank München",
  "70220200": "Bayerische Hypo- und Vereinsbank",
  "70250150": "Sparkasse Oberbayern",
  "76026000": "Sparda-Bank Nürnberg",
};

export function normalizeIban(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

export function formatIban(input: string): string {
  const clean = normalizeIban(input);
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export function detectGermanBank(iban: string): string | null {
  const clean = normalizeIban(iban);
  if (!clean.startsWith("DE") || clean.length < 12) return null;
  const blz = clean.slice(4, 12);
  if (!/^\d{8}$/.test(blz)) return null;
  return BLZ_MAP[blz] ?? null;
}

export function isLikelyValidIban(iban: string): boolean {
  const clean = normalizeIban(iban);
  // German IBAN = 22 chars
  return /^DE\d{20}$/.test(clean);
}
