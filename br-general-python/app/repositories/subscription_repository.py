from app.db import db


class SubscriptionRepository:
    async def get_by_user(self, user_id: str):
        """Return all subscriptions for a specific user (latest first)."""
        return await db.subscription.find_many(
            where={"userId": user_id}, order={"startedAt": "desc"}
        )


subscription_repo = SubscriptionRepository()
