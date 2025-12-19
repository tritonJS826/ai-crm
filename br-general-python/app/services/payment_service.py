from datetime import datetime, timedelta, timezone
from app.db import db


class PaymentService:
    async def save_payment(self, payment_data: dict, user_id: str):
        """Return a mock 'payment record' for response, without DB write."""
        now = datetime.now(timezone.utc)
        return {
            "id": payment_data["id"],  # add this field for schema match
            "paymentId": payment_data["id"],
            "status": payment_data["status"],
            "amount": float(payment_data["amount"]["value"]),
            "currency": payment_data["amount"]["currency"],
            "description": payment_data.get("description", ""),
            "createdAt": now,
        }

    async def handle_payment_succeeded(self, payment_data: dict):
        """Create or extend subscription when YooKassa confirms success."""
        payment_id = payment_data.get("id")
        user_id = payment_data.get("metadata", {}).get("user_id")
        # For future use, if needed:
        # amount = float(payment_data["amount"]["value"])

        if not user_id:
            print(f"No user_id found in payment metadata for {payment_id}")
            return None

        start = datetime.now(timezone.utc)
        end = start + timedelta(days=30)

        subscription = await db.subscription.create(
            data={
                "userId": user_id,
                "plan": "BASIC",
                "startedAt": start,
                "endsAt": end,
                "consultationsIncluded": 0,
                "consultationsUsed": 0,
            }
        )

        return subscription


payment_service = PaymentService()
