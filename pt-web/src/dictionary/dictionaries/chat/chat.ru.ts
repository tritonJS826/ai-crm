export const chat = {
  title: "",
  conversationList: {
    searchPlaceholder: "",
    infoEmptyList: "",
  },
  messageList: {
    messageInputPlaceholder: "",
    sendButtonLabel: "",
  },
  companionProfile: {
    title: "",
    reassignmentTitle: "",
    notesTitle: "",
    notesAddButtonLabel: "",
  },
  suggestions: {title: ""},
} as const;

export type ChatDictRu = typeof chat;
