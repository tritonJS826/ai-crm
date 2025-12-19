# app/services/email_service.py
from email.message import EmailMessage
from pathlib import Path
from typing import Optional, Dict, Any
from prisma import Prisma

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.settings import settings

import logging

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


class EmailService:
    """SMTP-backed email sender."""

    def __init__(self, db: Prisma | None = None) -> None:
        self.db = db or Prisma()
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.user = settings.smtp_user
        self.password = settings.smtp_password
        self.use_starttls = settings.smtp_starttls
        self.use_ssl = settings.smtp_ssl
        self.sender_email = str(settings.smtp_sender_email)
        self.sender_name = settings.smtp_sender_name

    def _render_template(self, template: str, params: Dict[str, Any]) -> str:
        tpl = _env.get_template(template)
        return tpl.render(**params)

    def _build_message(
        self,
        to: str,
        subject: str,
        text: Optional[str] = None,
        html: Optional[str] = None,
    ) -> EmailMessage:
        msg = EmailMessage()
        sender = f"{self.sender_name} <{self.sender_email}>"
        msg["From"] = sender
        msg["To"] = to
        msg["Subject"] = subject

        if html:
            # Always add text fallback
            msg.set_content(text or "Your email client does not support HTML.")
            msg.add_alternative(html, subtype="html")
        else:
            msg.set_content(text or "")

        return msg

    async def log_email(
        self,
        *,
        to: str,
        subject: str,
        body: str,
        template: str = "",
        status: str = "SENT",
        error: Optional[str] = None,
    ) -> None:
        """Public wrapper to store email logs in DB."""

        await self.db.connect()
        try:
            await self.db.emaillog.create(
                data={
                    "to": to,
                    "subject": subject,
                    "template": template,
                    "body": body,
                    "status": status,
                    "error": error,
                }
            )
        finally:
            await self.db.disconnect()

    async def send(
        self,
        *,
        to: str,
        subject: str,
        text: Optional[str] = None,
        html: Optional[str] = None,
        template: Optional[str] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> None:
        if template:
            html = self._render_template(template, params or {})

        message = self._build_message(to=to, subject=subject, text=text, html=html)

        try:
            if self.use_ssl:
                await aiosmtplib.send(
                    message,
                    hostname=self.host,
                    port=self.port,
                    username=self.user,
                    password=self.password,
                    use_tls=True,
                    timeout=30,
                )
            else:
                async with aiosmtplib.SMTP(
                    hostname=self.host, port=self.port, timeout=30
                ) as smtp:
                    if self.use_starttls:
                        await smtp.starttls()
                    if self.user and self.password:
                        await smtp.login(self.user, self.password)
                    await smtp.send_message(message)

            # Log success
            await self.log_email(
                to=to,
                subject=subject,
                body=html or text or "",
                template=template or "",
                status="SENT",
                error=None,
            )

        except Exception as e:
            # log failure
            await self.log_email(
                to=to,
                subject=subject,
                body=html or text or "",
                template=template or "",
                status="FAILED",
                error=str(e),
            )
            logger.error(f"Error sending email to {to}: {e}")
            raise
