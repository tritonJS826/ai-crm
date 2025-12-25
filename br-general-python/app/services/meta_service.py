"""
Service for Meta (WhatsApp, Messenger, Instagram) API operations.
"""

import hmac
import hashlib
import logging
from typing import Optional, Dict, Any

import httpx

from app.settings import settings
from app.schemas.contact import Platform
from app.schemas.webhook import NormalizedMessage

logger = logging.getLogger(__name__)

WHATSAPP_API_BASE = "https://graph.facebook.com/v17.0"
MESSENGER_API_BASE = "https://graph.facebook.com/v17.0/me/messages"
HTTP_TIMEOUT = 15.0


class MetaService:
    """Service for sending messages via Meta platforms."""

    def __init__(self) -> None:
        self._init_config()

    def _init_config(self) -> None:
        """Initialize configuration from settings."""
        self.whatsapp_phone_id = settings.whatsapp_phone_number_id
        self.whatsapp_token = settings.whatsapp_access_token
        self.messenger_token = settings.facebook_page_access_token
        self.instagram_token = (
            settings.instagram_page_access_token or settings.facebook_page_access_token
        )
        self.app_secret = settings.meta_app_secret

    @property
    def is_configured(self) -> bool:
        """Check if Meta API is properly configured."""
        return settings.is_meta_configured

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify Meta webhook signature."""
        if not self.app_secret:
            logger.warning("Meta app secret not configured")
            return False

        if not signature or not signature.startswith("sha256="):
            return False

        expected_sig = signature[7:]
        computed_sig = hmac.new(
            self.app_secret.encode("utf-8"),
            payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(computed_sig, expected_sig)

    def normalize_webhook(
        self,
        payload: Dict[str, Any],
    ) -> Optional[NormalizedMessage]:
        """
        Normalize Meta webhook payload to internal format.

        Handles WhatsApp, Messenger, and Instagram message formats.
        """
        try:
            obj_type = payload.get("object")

            if obj_type == "whatsapp_business_account":
                return self._normalize_whatsapp(payload)

            if obj_type in ("page", "instagram"):
                return self._normalize_messenger_instagram(payload, obj_type)

            return None

        except Exception as e:
            logger.error(f"Error normalizing webhook: {e}")
            return None

    def _normalize_whatsapp(
        self,
        payload: Dict[str, Any],
    ) -> Optional[NormalizedMessage]:
        """Normalize WhatsApp webhook payload."""
        entries = payload.get("entry", [])
        if not entries:
            return None

        entry = entries[0]
        changes = entry.get("changes", [])
        if not changes:
            return None

        value = changes[0].get("value", {})
        messages = value.get("messages", [])
        if not messages:
            return None

        msg = messages[0]
        msg_from = msg.get("from", "")
        msg_id = msg.get("id", "")

        if not msg_from or not msg_id:
            logger.warning("WhatsApp message missing required fields")
            return None

        contacts = value.get("contacts", [])
        contact = contacts[0] if contacts else {}

        return NormalizedMessage(
            platform=Platform.WHATSAPP.value,
            platform_user_id=msg_from,
            text=msg.get("text", {}).get("body"),
            remote_message_id=msg_id,
            contact_name=contact.get("profile", {}).get("name"),
            contact_phone=msg_from,
        )

    def _normalize_messenger_instagram(
        self,
        payload: Dict[str, Any],
        obj_type: str,
    ) -> Optional[NormalizedMessage]:
        """Normalize Messenger/Instagram webhook payload."""
        platform = (
            Platform.INSTAGRAM.value
            if obj_type == "instagram"
            else Platform.MESSENGER.value
        )

        entries = payload.get("entry", [])
        if not entries:
            return None

        entry = entries[0]
        messaging = entry.get("messaging", [])
        if not messaging:
            return None

        msg_event = messaging[0]
        sender = msg_event.get("sender", {})
        message = msg_event.get("message", {})

        sender_id = sender.get("id", "")
        msg_id = message.get("mid", "")

        if not sender_id or not message:
            return None

        return NormalizedMessage(
            platform=platform,
            platform_user_id=sender_id,
            text=message.get("text"),
            remote_message_id=msg_id,
        )

    async def send_message(
        self,
        platform: Platform,
        to: str,
        text: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> Optional[str]:
        """
        Send a message to the specified platform.

        Returns remote message ID on success, None on failure.
        """
        if not self.is_configured:
            logger.error("Meta API not configured")
            return None

        if not text and not image_url:
            logger.warning("Attempted to send empty message")
            return None

        try:
            if platform == Platform.WHATSAPP:
                return await self._send_whatsapp(to, text, image_url)
            elif platform == Platform.MESSENGER:
                return await self._send_messenger(to, text, image_url)
            elif platform == Platform.INSTAGRAM:
                return await self._send_instagram(to, text, image_url)
            else:
                logger.error(f"Unknown platform: {platform}")
                return None

        except httpx.TimeoutException:
            logger.error(f"Timeout sending message to {platform}")
            return None
        except Exception as e:
            logger.error(f"Error sending message to {platform}: {e}")
            return None

    async def _send_whatsapp(
        self,
        to: str,
        text: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> Optional[str]:
        """Send message via WhatsApp Cloud API."""
        if not self.whatsapp_phone_id or not self.whatsapp_token:
            logger.error("WhatsApp credentials not configured")
            return None

        url = f"{WHATSAPP_API_BASE}/{self.whatsapp_phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json",
        }

        if image_url:
            payload = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "image",
                "image": {
                    "link": image_url,
                    "caption": text or "",
                },
            }
        else:
            payload = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"body": text or ""},
            }

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(url, headers=headers, json=payload)

            if response.status_code not in (200, 201):
                logger.error(
                    f"WhatsApp API error [{response.status_code}]: {response.text}"
                )
                return None

            data = response.json()
            messages = data.get("messages", [])
            return messages[0].get("id") if messages else None

    async def _send_messenger(
        self,
        to: str,
        text: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> Optional[str]:
        """Send message via Messenger API."""
        if not self.messenger_token:
            logger.error("Messenger token not configured")
            return None

        url = f"{MESSENGER_API_BASE}?access_token={self.messenger_token}"
        message_id: Optional[str] = None

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            if image_url:
                payload = {
                    "recipient": {"id": to},
                    "message": {
                        "attachment": {
                            "type": "image",
                            "payload": {"url": image_url, "is_reusable": True},
                        }
                    },
                }
                response = await client.post(url, json=payload)
                if response.status_code not in (200, 201):
                    logger.error(f"Messenger image error: {response.text}")

            if text:
                payload = {
                    "recipient": {"id": to},
                    "message": {"text": text},
                }
                response = await client.post(url, json=payload)

                if response.status_code not in (200, 201):
                    logger.error(f"Messenger API error: {response.text}")
                    return None

                data = response.json()
                message_id = data.get("message_id")

        return message_id

    async def _send_instagram(
        self,
        to: str,
        text: Optional[str] = None,
        image_url: Optional[str] = None,
    ) -> Optional[str]:
        """Send message via Instagram Messaging API."""
        token = self.instagram_token
        if not token:
            logger.error("Instagram token not configured")
            return None

        url = f"https://graph.facebook.com/v17.0/me/messages?access_token={token}"

        if not text:
            logger.warning("Instagram DM requires text content")
            return None

        payload = {
            "recipient": {"id": to},
            "message": {"text": text},
        }

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(url, json=payload)

            if response.status_code not in (200, 201):
                logger.error(f"Instagram API error: {response.text}")
                return None

            data = response.json()
            return data.get("message_id")

    async def send_product_card(
        self,
        platform: Platform,
        to: str,
        title: str,
        price: str,
        image_url: Optional[str],
        buy_url: str,
    ) -> Optional[str]:
        """Send a product card with buy button."""
        if platform == Platform.WHATSAPP:
            caption = f"*{title}*\n{price}\n\nBuy now: {buy_url}"
            return await self._send_whatsapp(to, caption, image_url)

        elif platform in (Platform.MESSENGER, Platform.INSTAGRAM):
            return await self._send_generic_template(
                platform=platform,
                to=to,
                title=title,
                subtitle=price,
                image_url=image_url,
                button_url=buy_url,
            )

        return None

    async def _send_generic_template(
        self,
        platform: Platform,
        to: str,
        title: str,
        subtitle: str,
        image_url: Optional[str],
        button_url: str,
    ) -> Optional[str]:
        """Send generic template (Messenger/Instagram)."""
        token = (
            self.instagram_token
            if platform == Platform.INSTAGRAM
            else self.messenger_token
        )

        if not token:
            logger.error(f"{platform.value} token not configured")
            return None

        url = f"https://graph.facebook.com/v17.0/me/messages?access_token={token}"

        element: Dict[str, Any] = {
            "title": title,
            "subtitle": subtitle,
            "buttons": [
                {
                    "type": "web_url",
                    "url": button_url,
                    "title": "Buy Now",
                }
            ],
        }

        if image_url:
            element["image_url"] = image_url

        payload = {
            "recipient": {"id": to},
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [element],
                    },
                }
            },
        }

        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            response = await client.post(url, json=payload)

            if response.status_code not in (200, 201):
                logger.error(f"Template send error: {response.text}")
                return None

            data = response.json()
            return data.get("message_id")


meta_service = MetaService()
