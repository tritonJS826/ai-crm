import type {Test} from "src/services/tests.api";

export const testsMockEn: Record<string, Test> = {
  "1": {
    id: "1",
    name: "Depression screening test",
    questions: [
      {id: 1, type: "text", question: "How did you sleep last night?", placeholder: "For example: well / 7 hours"},
      {
        id: 2,
        type: "checkbox",
        question: "What helped you today? (choose multiple)",
        options: ["Sleep", "Walk", "Talk with a loved one", "Exercise"],
      },
      {id: 3, type: "radio", question: "How is your mood now?", options: ["Calm", "Tense", "Joyful"]},
    ],
  },
};
