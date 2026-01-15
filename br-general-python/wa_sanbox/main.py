import os
import requests
from dotenv import load_dotenv

from fastapi import FastAPI, Request, Query
from fastapi.responses import PlainTextResponse

load_dotenv()

app = FastAPI()

META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "test-token")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/webhooks/meta")
def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        return PlainTextResponse(hub_challenge)
    return PlainTextResponse("Verification failed", status_code=403)


@app.post("/webhooks/meta")
async def receive_message(request: Request):
    payload = await request.json()
    # print("RAW PAYLOAD RECEIVED >>>", payload)

    normalized = normalize_whatsapp_message(payload)
    if normalized:
        # print("NORMALIZED MESSAGE >>>", normalized)
        pass

    try:
        print(payload["entry"][0]["changes"][0]["value"]["messages"][0]["from"])
    except (KeyError, IndexError):
        pass

    normalized = normalize_whatsapp_message(payload)

    try:
        # pass
        to_send = None
        try:
            to_send = normalized["from"]
        except (TypeError, KeyError):
            pass

        if to_send:
            send_whatsapp_text(
                to=to_send,
                text=f"Hello 👋 {normalized['name'] or 'there'}!\nThis is an automated reply.",
                phone_number_id=os.environ["WHATSAPP_PHONE_NUMBER_ID"],
            )
    except requests.HTTPError as e:
        print("WHATSAPP SEND FAILED:", e.response.text)

    return {"status": "received"}


def normalize_whatsapp_message(payload: dict) -> dict | None:
    try:
        entry = payload["entry"][0]
        change = entry["changes"][0]
        value = change["value"]

        message = value["messages"][0]
        contact = value["contacts"][0]

        return {
            "platform": "whatsapp",
            "from": message["from"],
            "wa_id": contact["wa_id"],
            "name": contact["profile"].get("name"),
            "message_id": message["id"],
            "timestamp": int(message["timestamp"]),
            "type": message["type"],
            "text": message.get("text", {}).get("body"),
            "phone_number_id": value["metadata"]["phone_number_id"],
        }
    except (KeyError, IndexError):
        return None


def send_whatsapp_text(to: str, text: str, phone_number_id: str):
    url = f"https://graph.facebook.com/v24.0/{phone_number_id}/messages"

    headers = {
        "Authorization": f"Bearer {os.environ['WHATSAPP_ACCESS_TOKEN']}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()
