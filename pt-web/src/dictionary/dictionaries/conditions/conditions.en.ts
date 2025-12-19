export const conditionsDict = {
  title: "Conditions",
  subtitle: "Short and clear materials about mental health",
  searchPlaceholder: "Search articles",
  ariaSearchLabel: "Search articles",
  empty: "Nothing found",
  cta: "Read",

  notFound: "Article not found",
  backToAll: "Back to all articles",
  articleEyebrow: "Article",
  back: "Back to list",
  listDefaultLabel: "List",

  articles: [
    {
      id: "1",
      title: "Depression: How to Recognize It and What to Do",
      subtitle: "Understanding, Symptoms, and Support",
      excerpt:
        "Depression affects mood, thinking, and the body. It is treatable, especially when help is sought early.",
      content: [
        {
          type: "paragraph",
          text: "Depression is a common condition characterized by at least" +
          "two weeks of low mood, loss of interest, and reduced energy.",
        },
        {
          type: "list",
          title: "Common Symptoms",
          articles: [
            "Loss of interest in usual activities",
            "Sleep and appetite changes",
            "Decreased concentration and motivation",
            "Feelings of guilt or worthlessness",
            "Thoughts about meaninglessness",
          ],
        },
        {
          type: "paragraph",
          text: "Symptoms vary in intensity and duration. Track how much" +
          "they interfere with daily life.",
        },
        {
          type: "list",
          title: "What Helps",
          articles: [
            "Consulting a psychologist or psychiatrist",
            "Cognitive behavioral therapy",
            "Regular physical activity",
            "Support from loved ones",
            "Healthy sleep and nutrition",
          ],
        },
        {
          type: "quote",
          text: "Asking for help is a sign of strength.",
          author: "A supportive reminder",
        },
        {
          type: "paragraph",
          text: "If symptoms persist for more than two weeks and affect" +
          "daily life, seek professional help. Use emergency services if your condition worsens sharply.",
        },
      ],
    },
  ],
} as const;

export type ConditionsDictEn = typeof conditionsDict;
