export const home = {
  hero: {
    eyebrow: "Online mental health support",
    title: "Start your journey to sustainable calm.",
    subtitle:
      "Resources, tests, and specialists — all in one place, with a focus on gentle support.",
    benefits: [
      "Short diagnostics and personalized recommendations",
      "Consultations with specialists at a convenient time",
      "Clear articles about conditions and self-help",
      "Practices for restoring energy",
    ] as const,
    form: {
      label: "Where shall we start today?",
      placeholder: "I would like to…",
      options: {
        test: "Take a test",
        states: "Learn about conditions",
        contact: "Contact a specialist",
      },
      cta: "Start",
    },
  },

  about: {
    sectionAria: "About the project",
    eyebrow: "About",
    title: "Mental health support — simple, gentle, and close.",
    subtitle:
      "We bring together diagnostics, simple exercises, articles, and professional help." +
      " From first step to lasting results — at your own pace and format.",
    features: [
      {title: "Quick start", text: "Short initial screening and recommendations on the same day."},
      {title: "Personal plan", text: "Step-by-step goals and practices tailored to your lifestyle and request."},
      {title: "SOS help", text: "Panic attack, acute anxiety, burnout — instructions and exercises right here, right now."},
      {title: "1:1 guidance", text: "A team of specialists. Book consultations and case conferences when needed."},
      {title: "When it suits you", text: "Flexible schedule and online format. Reminders and progress tracking."},
      {title: "Health & energy", text: "Sleep, nutrition, habits, recovery — evidence-based biohacking practices."},
    ] as const,
  },

  services: {
    eyebrow: "Services",
    title: "Support based on data and simple steps.",
    subtitle:
      "Diagnostics, personal recommendations, and biohacking practices. No medication. Focused on daily progress.",
    servicesItems: [
      {
        title: "Diagnostics",
        text:
          "Main extended test and a set of short tests. Understanding the current state and personal recommendations.",
      },
      {
        title: "Biohacking & Energy",
        text:
          "Sleep, nutrition, habits, and resource recovery. Simple steps that truly stick.",
      },
      {
        title: "SOS / First Aid",
        text:
          "Quick instructions for panic attacks and other acute conditions. Selection of hotlines.",
      },
      {
        title: "Consultations with Specialists",
        text:
          "Personal consultations, answers to questions, support in achieving goals.",
      },
    ] as const,
  },
} as const;

export type HomeDictEn = typeof home;
