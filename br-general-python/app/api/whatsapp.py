from fastapi import APIRouter, Request, HTTPException, Response

from app.services.whatsapp_normalizer import normalize_whatsapp_payload
from app.settings import settings
from app.services.whatsapp_security import verify_signature
from app.repositories.whatsapp_message_repository import save_inbound_whatsapp_message

router = APIRouter()


@router.get("")
async def verify_webhook(
    hub_mode: str | None = None,
    hub_challenge: str | None = None,
    hub_verify_token: str | None = None,
):
    # TEMP: verification logic will be added next step
    if hub_challenge:
        return Response(content=hub_challenge, status_code=200)
    return Response(status_code=403)


@router.post("")
async def receive_message(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")

    if not verify_signature(settings.whatsapp_access_token, raw_body, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    messages = normalize_whatsapp_payload(payload)

    for msg in messages:
        await save_inbound_whatsapp_message(msg)

    return {"status": "ok"}
