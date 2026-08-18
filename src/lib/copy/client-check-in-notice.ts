// Wording from business/commercial: "Data, product, and the three-year plan" (12 Aug 2026).
// This is the consent text given to the client at intake. Do not paraphrase it: consent
// binds Deepen to the purpose named here, and we cannot go back to clients later to widen it.

export const CLIENT_INTAKE_CONSENT = {
  body:
    "Your counsellor uses Deepen to keep her notes and to follow how you are doing from one session to the next. " +
    "If you agree, your scores can also help build anonymous averages, with your name, contact details and anything that could identify you removed first. " +
    "Those averages let counsellors see whether the people they work with are getting better. " +
    "Your own answers are never shown to anyone but your counsellor. Nothing is sold, and nothing goes to an employer, an insurer or any other organisation. " +
    "Saying no changes nothing about your care, and you can change your mind whenever you like.",
  yes: "Yes, my anonymous scores may be used this way",
  no: "No",
} as const;

// Short line shown above the check-in itself (when automated delivery ships).
export const CLIENT_CHECK_IN_NOTICE =
  "Your answers here are recorded and saved to your file. Nobody sees them except your counsellor. They use them to help see how you are doing, session to session.";
