# User Personal Info API Documentation (v1.1)

## Endpoint: `/br-general/users/me/personal`

### Method
`GET`

### Auth Required
✅ Yes — Requires a valid `Authorization: Bearer <access_token>` header.

---

### Description
Retrieves the authenticated user's **personal details**, their **latest subscription plan**, and a list of **test topics** they have taken.

This endpoint combines user data, the most recent subscription entry, and related test sessions for an overview of the user's profile.

---

### Request Headers

```
Authorization: Bearer <access_token>
```

---

### Example Request

```bash
curl -X GET http://localhost:8000/br-general/users/me/personal \
  -H "Authorization: Bearer <your_access_token>"
```

---

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | User’s registered email address |
| `name` | string | User’s display name |
| `role` | enum(`PATIENT`, `DOCTOR`) | User’s assigned role |
| `plan` | enum(`FREE`, `BASIC`) | Active subscription plan |
| `consultations_used` | int | Number of consultations already used |
| `consultations_included` | int | Total consultations provided in the plan |
| `days_to_end` | int | Number of days remaining until the subscription ends |
| `test_topics` | array | List of user tests (each includes `id` and `title`) |

---

### Example Successful Response

```json
{
  "email": "test4545@gmail.com",
  "name": "test4545",
  "role": "PATIENT",
  "plan": "BASIC",
  "consultations_used": 2,
  "consultations_included": 5,
  "days_to_end": 23,
  "test_topics": [
    {"id": "cmgtest123", "title": "Memory Focus Test"},
    {"id": "cmgtest456", "title": "Cognitive Speed Evaluation"}
  ]
}
```

---

### Example Response (No Active Subscription or Tests)

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "DOCTOR",
  "plan": "FREE",
  "consultations_used": 0,
  "consultations_included": 0,
  "days_to_end": 0,
  "test_topics": []
}
```

---

### Notes

- Returns default values (`FREE`, `0`, `0`, `0`) if no subscription exists.
- Includes all unique test topics user has participated in.
- Useful for dashboards or account profile pages displaying personal and activity data.
- Tokens should be refreshed if expired before calling this endpoint.

---

## Endpoint: `/br-general/users/me/tests/{test_id}`

### Method
`GET`

### Auth Required
✅ Yes — Requires a valid `Authorization: Bearer <access_token>` header.

---

### Description
Returns all test sessions and answers for the authenticated user for a specific test ID.
Also includes the **test title** and **description** at the top of the response.

---

### Path Parameters

| Parameter | Type | Description |
|------------|------|-------------|
| `test_id` | string | The unique ID of the test to retrieve results for |

---

### Example Request

```bash
curl -X GET http://localhost:8000/br-general/users/me/tests/cmgtest123 \
  -H "Authorization: Bearer <your_access_token>"
```

---

### Example Response

```json
{
  "test_id": "cmgtest123",
  "title": "Cognitive Focus Test",
  "description": "Measures attention and memory retention patterns over multiple sessions.",
  "sessions": [
    {
      "session_id": "cmgsession1xyz",
      "created_at": "2025-10-05T14:11:00Z",
      "finished_at": "2025-10-05T14:16:00Z",
      "answers": [
        {
          "question_id": "cmgquestion123",
          "question_text": "How often do you lose focus while reading?",
          "answer": "Occasionally"
        },
        {
          "question_id": "cmgquestion456",
          "question_text": "Do you have trouble remembering details?",
          "answer": "No"
        }
      ]
    }
  ]
}
```

---

### Notes

- Returns all completed and active sessions for the given `test_id`.
- Each session includes a list of user answers with question text and chosen options.
- Useful for analytics, reports, or displaying detailed test history per user.

---

**Version:** 1.1.0  
**Last Updated:** 2025-10-06  
**Author:** br-general-python API Team
