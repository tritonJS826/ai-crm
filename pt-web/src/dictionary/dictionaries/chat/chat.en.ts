export const chat = {
  title: "Chat",
  conversationList: {
    searchPlaceholder: "Search",
    infoEmptyList: "🚫 conversation list is empty 🚫",
  },
  messageList: {
    messageInputPlaceholder: "Type your message here...",
    sendButtonLabel: "SEND",
  },
  companionProfile: {
    title: "Profile",
    reassignmentTitle: "Reassignment",
    notesTitle: "Notes",
    notesAddButtonLabel: "+Add Note",
  },
  suggestions: {title: "Suggestions"},
} as const;

export type ChatDictEn = typeof chat;
