### Building a multi-channel customer communication system where:

- Contacts _are external customers_
- Users _are internal agents_
- Conversations _group communication with one contact_
- Messages _are events inside conversations_
- ConversationParticipants _define which agents are assigned_
- Orders / Products _enable commerce inside conversations_
- EmailLog _is orthogonal system logging_

### Mental model to keep forever

- Users talk _inside_ the system
- Contacts talk _to_ the system
- Conversations are the context
- Messages are facts in time
- Direction = flow
- fromUserId = responsibility

### Message invariants (must always be true)

| direction | fromUserId | Meaning                 |
|-----------|------------|-------------------------|
| IN        | NULL       | Message sent by contact |
| OUT       | NOT NULL   | Message sent by agent   |
| OUT       | NULL       | System / bot message    |

These rules are enforced in service code, not in the database.

### Why Message does not reference Contact

Messages belong to a Conversation, not directly to a Contact.

Relationship chain:
Message → Conversation → Contact

This avoids:

- duplicated relationships
- inconsistent ownership
- hard-to-debug data corruption

Do NOT add contactId to Message.

### Why Conversation exists

Conversation provides:

- a stable context for messages
- open / closed state
- assignment to agents
- efficient inbox queries

Messages do not form conversations implicitly.

### ConversationParticipants

ConversationParticipants allows:

- multiple agents per conversation
- shared inboxes
- reassignment without losing history

Orders may optionally reference a Conversation,
because purchases can originate from chat, automation, or external links.

