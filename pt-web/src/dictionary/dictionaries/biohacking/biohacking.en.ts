/* eslint-disable max-len */
export const biohackingDict = {
  title: "Articles on Biohacking",
  subtitle: "Short and clear materials about health and energy",
  searchPlaceholder: "Search article",
  ariaSearchLabel: "Search by articles",
  empty: "Nothing found",
  cta: "Read",

  notFound: "Article not found",
  backToAll: "Back to all articles",
  articleEyebrow: "Article",
  back: "Back to list",
  listDefaultLabel: "List",

  paywallTitle: "Available with subscription",
  paywallText: "Get a subscription to read the full article.",
  buyBtn: "Buy subscription",

  articlesItems: [
    {
      id: "1",
      title: "Sleep hygiene: how to restore energy",
      subtitle: "Simple steps for quality sleep",
      excerpt:
        "Sleep is the foundation of recovery. A few stable habits improve sleep depth and daily performance.",
      img: "",
      isPaid: true,
    },
  ],

  articles: [
    {
      id: "1",
      img: "",
      title: "Sleep hygiene: how to restore energy",
      subtitle: "Simple steps for quality sleep",
      excerpt:
        "Sleep is the foundation of recovery. A few stable habits improve sleep depth and daily performance.",
      isPaid: true,
      paywallAtIndex: 3,
      content: [
        {
          type: "paragraph",
          text:
            "A consistent sleep schedule helps your nervous system switch into recovery mode and maintain balance. When you go to bed and wake up at the same time every day, the body learns to release hormones: melatonin in the evening to help you fall asleep, and cortisol in the morning to help you wake up. This rhythm reduces stress on the nervous system and allows you to spend more time in deep, restorative sleep stages.",
        },
        {
          type: "paragraph",
          text:
            "An irregular sleep schedule, such as late nights on weekends or trying to 'catch up' with long daytime naps, can disrupt your internal clock. This often leads to morning drowsiness, difficulty concentrating during the day, and restless sleep at night. Over time, such inconsistency can weaken the immune system, increase stress levels, and slow down recovery from physical and mental exertion.",
        },
        {
          type: "paragraph",
          text:
            "By sticking to a stable schedule, you create a sense of stability for your brain and body. It’s like training the nervous system: it understands when it can relax and when it needs to stay alert. Athletes often use this strategy to improve performance, as quality sleep means faster muscle recovery and better reaction times. But it’s just as important for anyone who wants to stay focused, calm, and energetic in daily life.",
        },
        {
          type: "paragraph",
          text:
            "A practical way to start is to establish an 'evening ritual' an hour before bed: dim the lights, put away gadgets, and do something calming—light stretching, reading, or listening to soft music. It’s also important to wake up at the same time, even if you slept less than you wanted the night before, because regularity gradually teaches the body to adjust naturally.",
        },
        {
          type: "paragraph",
          text:
            "On weekends it may be tempting to go to bed later and sleep longer, but even a 2–3 hour difference can disrupt your circadian rhythm and make Monday mornings much harder. A good rule is to keep bedtime and wake-up time within 30–60 minutes of your usual schedule, regardless of the day of the week.",
        },
        {
          type: "paragraph",
          text:
            "If you maintain this habit, you’ll notice improvements not only in sleep quality but also in mood, concentration, and overall stress resilience. The nervous system loves predictability, and a stable sleep schedule is one of the simplest and most effective ways to provide it.",
        },
        {
          type: "paragraph",
          text:
            "Most people notice improvements after 10–14 days of practice. Track your well-being and adjust the routine gradually.",
        },
        {
          type: "quote",
          text: "The quality of your day begins with the quality of your night.",
          author: "A reminder to take care of yourself",
        },
      ],
    },
  ],
} as const;

export type BiohackingDictEn = typeof biohackingDict;
