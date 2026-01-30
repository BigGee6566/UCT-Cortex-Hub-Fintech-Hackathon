from __future__ import annotations

from dataclasses import dataclass

import httpx

from app.core.config import get_settings


@dataclass(frozen=True)
class EmailMessage:
    to_email: str
    subject: str
    text: str
    html: str


class EmailService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def send(self, message: EmailMessage) -> None:
        provider = (self.settings.EMAIL_PROVIDER or "sendgrid").lower()
        if provider == "sendgrid":
            await self._send_sendgrid(message)
        else:
            raise RuntimeError(f"Unsupported email provider: {provider}")

    async def _send_sendgrid(self, message: EmailMessage) -> None:
        if not self.settings.SENDGRID_API_KEY or not self.settings.EMAIL_FROM:
            raise RuntimeError("Missing SendGrid configuration")

        payload = {
            "personalizations": [{"to": [{"email": message.to_email}]}],
            "from": {"email": self.settings.EMAIL_FROM},
            "subject": message.subject,
            "content": [
                {"type": "text/plain", "value": message.text},
                {"type": "text/html", "value": message.html},
            ],
        }

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {self.settings.SENDGRID_API_KEY}"},
                json=payload,
            )
            if response.status_code >= 300:
                raise RuntimeError(f"SendGrid error: {response.status_code} {response.text}")
