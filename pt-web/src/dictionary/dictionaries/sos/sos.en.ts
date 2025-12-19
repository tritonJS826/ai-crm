export const sosDict = {
  page: {
    title: "Support",
    subtitle:
      "In an emergency, call right away. Then you can send a request for a consultation and read self-help materials.",
  },
  emergency: {
    title: "Emergency help",
    callNow: "Call the hotline",
    ariaLabel: "Call the hotline",
    busyText: "Unfortunately all lines are busy right now. Please try again later.",
  },
  consultation: {
    title: "Consultation with a specialist",
    lead: "Leave a request and we will contact you to arrange a suitable time.",
    cta: "Send a consultation request",
  },
  selfhelp: {
    title: "Self-help",
    lead: "Read short recommendations to help yourself in the moment.",
  },
  selfhelpItems: [
    {id: "panic", link: "#panic-attack", title: "Panic attack", desc: "How to recognize an episode and what to do right now."},
    {id: "anxiety", link: "#anxiety", title: "Anxiety", desc: "Ways to reduce tension and regain control."},
    {id: "depression", link: "#depression", title: "Depression", desc: "When to seek help and basic support steps."},
  ],
  form: {
    title: "Consultation request",
    subtitle: "Fill out the form below. We will contact you and arrange a convenient time.",
    labels: {
      name: "Name*",
      email: "Email*",
      phone: "Phone",
      topic: "Topic*",
      preferredAt: "Preferred time",
      message: "Message",
    },
    placeholders: {
      phone: "Optional",
      topic: "For example: anxiety, panic attack…",
      preferredAt: "For example: after 6 PM or on weekends",
      message: "Briefly describe your request or task",
    },
    submit: "Send request",
    backToSupport: "Back to support",
    sentTitle: "Request sent",
    sentTextPrefix: "Request number:",
    sentTextSuffix: "We will contact you.",
    goHome: "Home",
    goSupport: "Support",
    error: "Failed to send the request. Please try again.",
  },
} as const;
export type SosDictEn = typeof sosDict;
