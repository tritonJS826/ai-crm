export const profileDictEn = {
  page: {
    title: "Profile",
    subtitle: "Your data and subscription status.",
    logoutBtn: "Log out",
  },
  user: {
    title: "User data",
    name: "Name",
    preferredContactEmail: "Email",
    city: "City",
    phone: "Phone",
    language: "Language",
    preferredContactPhone: "Phone",
  },
  plan: {
    title: "Subscription",
    baseTitle: "Basic plan",
    supportTitle: "Paid subscription",
    buyBtn: "Buy subscription",
    scheduleBtn: "Schedule a consultation",
    statsIncluded: "Consultations in plan",
    statsDaysLeft: "Days left",
    descActivePrefix: "Subscription is active.",
    descActiveSuffix:
      "Priority booking and emergency call are available.",
    descInactive:
      "Purchase a subscription to get priority booking and emergency calls.",
    priorityBooking: "Priority booking",
    emergencyCall: "Emergency call",
    hint: "Support Plan purchase will be available soon.",
  },
  tests: {
    title: "Test results",
    subtitle: "The latest test completion is shown first",
    name: "Name",
  },
  actions: {
    save: "Save",
    cancel: "Cancel",
  },
  history: {
    titlePrefix: "History:",
    emptyTitle: "Test history",
    emptySubtitle: "No data for the selected test",
    date: "Date",
    name: "Session",
    status: "Status",
    recommendation: "Recommendation",
    finished: "Finished",
    inProgress: "In progress",
    question: "Question",
    answer: "Answer",
  },
  conditions: {
    panic: "Panic attack",
    depression: "Depression",
    burnout: "Burnout",
  },
  status: {
    low: "Low",
    moderate: "Moderate",
    high: "High",
  },
  recommendations: {
    panic: {
      low: "Continue breathing techniques, add short daily walks.",
      moderate:
        "Practice grounding, track triggers, 4–6 breathing for 5 minutes.",
      high:
        "Avoid excess caffeine, 4–6 breathing, plan to reduce avoidance.",
    },
    depression: {
      low: "7–8 hours of sleep, light activity 20–30 minutes, keep social contacts.",
      moderate:
        "Structure your day, keep an activity journal, set gentle weekly goals.",
      high: "Consult a professional, reduce workload.",
    },
    burnout: {
      low: "Take short breaks, balance rest and work.",
      moderate:
        "Plan recovery windows, delegate tasks where possible.",
      high:
        "Redistribute workload, schedule recovery windows, take micro-breaks every hour.",
    },
  },
} as const;

export type ProfileDictEn = typeof profileDictEn;
