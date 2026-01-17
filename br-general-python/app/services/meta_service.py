"""
Service for Meta (WhatsApp, Messenger, Instagram) API operations.
"""

import hmac
import hashlib
from app.logging import logger
from typing import Optional, Dict, Any

import httpx

from app.schemas.source import Source
from app.settings import settings
from app.schemas.platform import Platform
from app.schemas.message import NormalizedMessage

META_API_VERSION = "v24.0"
META_API_BASE = f"https://graph.facebook.com/{META_API_VERSION}"
WHATSAPP_API_BASE = META_API_BASE
MESSENGER_API_BASE = f"{META_API_BASE}/me/messages"
HTTP_TIMEOUT = 15.0


class MetaService:
    """Service for sending messages via Meta platforms."""

    def __init__(self) -> None:
        self._init_config()
        self._client = httpx.AsyncClient(timeout=HTTP_TIMEOUT)

    def _init_config(self) -> None:
        self.whatsapp_phone_id = settings.whatsapp_phone_number_id
        self.whatsapp_token = settings.whatsapp_access_token
        self.messenger_token = settings.facebook_page_access_token
        self.instagram_token = (
            settings.instagram_page_access_token or settings.facebook_page_access_token
        )
        self.app_secret = settings.meta_app_secret

    @property
    def is_configured(self) -> bool:
        return settings.is_meta_configured

    # -------------------------
    # Webhook verification
    # -------------------------

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        if not self.app_secret or not signature or not signature.startswith("sha256="):
            return False

        expected_sig = signature[7:]
        computed_sig = hmac.new(
            self.app_secret.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(computed_sig, expected_sig)

    # -------------------------
    # Webhook normalization
    # -------------------------

    def normalize_webhook(self, payload: Dict[str, Any]) -> Optional[NormalizedMessage]:
        try:
            obj_type = payload.get("object")

            if obj_type == "whatsapp_business_account":
                return self._normalize_whatsapp(payload)

            if obj_type in ("page", "instagram"):
                return self._normalize_messenger_instagram(payload, obj_type)

            return None

        except Exception:
            logger.exception("Error normalizing webhook")
            return None

    @staticmethod
    def _normalize_whatsapp(payload: Dict[str, Any]) -> Optional[NormalizedMessage]:
        entry = (payload.get("entry") or [{}])[0]
        change = (entry.get("changes") or [{}])[0]
        value = change.get("value", {})

        messages = value.get("messages")
        contacts = value.get("contacts")

        if not messages or not contacts:
            return None

        msg = messages[0]
        contact = contacts[0]

        msg_from = msg.get("from")
        msg_id = msg.get("id")

        if not msg_from or not msg_id:
            return None

        return NormalizedMessage(
            platform=Platform.WHATSAPP,
            from_number=msg_from,
            wa_id=contact.get("wa_id", msg_from),
            name=contact.get("profile", {}).get("name"),
            message_id=msg_id,
            timestamp=int(msg.get("timestamp", 0)),
            type=msg.get("type", "text"),
            text=msg.get("text", {}).get("body"),
            phone_number_id=value.get("metadata", {}).get("phone_number_id"),
            source=Source.CUSTOMER,
        )

    def _normalize_messenger_instagram(
        self, payload: Dict[str, Any], obj_type: str
    ) -> Optional[NormalizedMessage]:
        platform = Platform.INSTAGRAM if obj_type == "instagram" else Platform.MESSENGER

        entry = (payload.get("entry") or [{}])[0]
        event = (entry.get("messaging") or [{}])[0]
        sender = event.get("sender", {})
        message = event.get("message", {})

        sender_id = sender.get("id")
        message_id = message.get("mid")

        if not sender_id or not message_id:
            return None

        return NormalizedMessage(
            platform=platform,
            from_number=sender_id,
            wa_id=sender_id,  # reuse for non-WA platforms
            name=None,
            message_id=message_id,
            timestamp=0,
            type="text",
            text=message.get("text"),
            phone_number_id="",
        )

    # -------------------------
    # Sending messages
    # -------------------------

    async def send_message(
        self,
        platform: Platform,
        to: str,
        text: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> Optional[str]:
        if not self.is_configured or not (text or image_url):
            return None

        try:
            if platform == Platform.WHATSAPP:
                return await self._send_whatsapp(to, text, image_url)
            if platform == Platform.MESSENGER:
                return await self._send_messenger(to, text, image_url)
            if platform == Platform.INSTAGRAM:
                return await self._send_instagram(to, text)

        except httpx.TimeoutException:
            logger.error("Timeout sending message to %s", platform)
        except Exception:
            logger.exception("Error sending message to %s", platform)

        return None

    async def _send_whatsapp(
        self, to: str, text: Optional[str], image_url: Optional[str]
    ) -> Optional[str]:
        if not self.whatsapp_phone_id or not self.whatsapp_token:
            return None

        url = f"{WHATSAPP_API_BASE}/{self.whatsapp_phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json",
        }

        payload = (
            {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "image",
                "image": {"link": image_url, "caption": text or ""},
            }
            if image_url
            else {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"body": text or ""},
            }
        )

        r = await self._client.post(url, headers=headers, json=payload)
        if r.status_code not in (200, 201):
            logger.error("WhatsApp API error: %s", r.text)
            return None

        return (r.json().get("messages") or [{}])[0].get("id")

    async def _send_messenger(
        self, to: str, text: Optional[str], image_url: Optional[str]
    ) -> Optional[str]:
        if not self.messenger_token:
            return None

        url = f"{MESSENGER_API_BASE}?access_token={self.messenger_token}"

        payload = (
            {
                "recipient": {"id": to},
                "message": {
                    "attachment": {
                        "type": "image",
                        "payload": {"url": image_url, "is_reusable": True},
                    }
                },
            }
            if image_url
            else {
                "recipient": {"id": to},
                "message": {"text": text},
            }
        )

        r = await self._client.post(url, json=payload)
        if r.status_code not in (200, 201):
            logger.error("Messenger API error: %s", r.text)
            return None

        return r.json().get("message_id")

    async def _send_instagram(self, to: str, text: Optional[str]) -> Optional[str]:
        if not self.instagram_token or not text:
            return None

        url = f"{MESSENGER_API_BASE}?access_token={self.instagram_token}"
        payload = {"recipient": {"id": to}, "message": {"text": text}}

        r = await self._client.post(url, json=payload)
        if r.status_code not in (200, 201):
            logger.error("Instagram API error: %s", r.text)
            return None

        return r.json().get("message_id")


meta_service = MetaService()
