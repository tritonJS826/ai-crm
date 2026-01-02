from app.services.whatsapp_normalizer import normalize_whatsapp_payload


def test_empty_payload():
    result = normalize_whatsapp_payload({})
    assert result == []


def test_payload_without_messages():
    payload = {"entry": [{"changes": [{"value": {}}]}]}

    result = normalize_whatsapp_payload(payload)
    assert result == []


def test_single_text_message():
    payload = {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "id": "msg-id-1",
                                    "from": "123456789",
                                    "timestamp": "1700000000",
                                    "type": "text",
                                    "text": {"body": "Hello"},
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }

    result = normalize_whatsapp_payload(payload)

    assert len(result) == 1
    msg = result[0]

    assert msg["platform"] == "whatsapp"
    assert msg["from"] == "123456789"
    assert msg["message_id"] == "msg-id-1"
    assert msg["type"] == "text"
    assert msg["text"] == "Hello"
