// Wording from business/commercial: "Data, product, and the three-year plan" (12 Aug 2026).
// This is the consent text given to the client at intake. Do not paraphrase it: consent
// binds Deepen to the purpose named here, and we cannot go back to clients later to widen it.

export const CLIENT_INTAKE_CONSENT = {
  body:
    "• Clinical Tracking: Your therapist uses Deepen.health to record session notes and securely track your session-to-session progress.\n" +
    "• Anonymous Research: With your permission, your anonymized scores (with all identifying details removed) help build industry averages to study treatment effectiveness.\n" +
    "• Strict Privacy: Your responses are strictly private to your therapist. No data is ever sold or shared, and you can opt out at any time.",
  yes: "Yes, my anonymous scores may be used this way",
  no: "No",
} as const;

// Short line shown above the check-in itself (when automated delivery ships).
export const CLIENT_CHECK_IN_NOTICE =
  "Your answers here are recorded and saved to your file. Nobody sees them except your counsellor. They use them to help see how you are doing, session to session.";
