// Single source of truth for the two automatic note flags.
//
// ORS flag (wellbeing): YES when ORS dropped >= orsDeterThreshold from the
//   client's baseline (first scored session). No distress-cutoff test.
// SRS flag (alliance): YES when SRS is below srsCutoff OR dropped >=
//   srsDeclineThreshold from the previous session.
//
// A scale that wasn't recorded returns null (N/A), not false.
export interface FlagInputs {
  orsRecorded: boolean;
  orsTotal: number;
  initialOrs: number | null;
  srsRecorded: boolean;
  srsTotal: number;
  prevSrs: number | null;
  orsDeterThreshold: number;
  srsDeclineThreshold: number;
  srsCutoff: number;
}

export interface FlagResult {
  orsFlag: boolean | null;
  srsFlag: boolean | null;
  orsReason: string | null;
  srsReason: string | null;
}

export function computeNoteFlags(p: FlagInputs): FlagResult {
  let orsFlag: boolean | null = null;
  let orsReason: string | null = null;
  if (p.orsRecorded && p.orsTotal > 0) {
    if (p.initialOrs != null && p.initialOrs - p.orsTotal >= p.orsDeterThreshold) {
      orsFlag = true;
      orsReason = `ORS down ${Math.round(p.initialOrs - p.orsTotal)} from baseline (${p.initialOrs})`;
    } else {
      orsFlag = false;
    }
  }

  let srsFlag: boolean | null = null;
  let srsReason: string | null = null;
  if (p.srsRecorded && p.srsTotal > 0) {
    if (p.srsTotal < p.srsCutoff) {
      srsFlag = true;
      srsReason = `SRS ${p.srsTotal} below cutoff ${p.srsCutoff}`;
    } else if (p.prevSrs != null && p.prevSrs - p.srsTotal >= p.srsDeclineThreshold) {
      srsFlag = true;
      srsReason = `SRS down ${Math.round(p.prevSrs - p.srsTotal)} from last session`;
    } else {
      srsFlag = false;
    }
  }

  return { orsFlag, srsFlag, orsReason, srsReason };
}
