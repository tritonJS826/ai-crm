from fastapi import APIRouter, HTTPException, Depends, Request
import uuid
import requests

from app.api.users import get_current_user

from app.services.payment_service import payment_service
from app.services.auth_service import AuthService

from app.repositories.user_repository import UserRepository
from app.repositories.subscription_repository import subscription_repo

from app.schemas.user import SubscriptionOut
from app.schemas.payment import PaymentCreateResponse

from app.settings import settings

router = APIRouter()

# in smallest currency unit, e.g. kopecks for RUB
base_price = str(1000)
# or 'USD', 'EUR', etc.
base_currency = "RUB"

auth_service = AuthService()
user_repo = UserRepository()


@router.post("/create", response_model=PaymentCreateResponse)
async def create_payment(current_user=Depends(get_current_user)):
    # Create a new YooKassa payment for the authenticated user
    user_id = current_user["user_id"]
    payment_id = str(uuid.uuid4())

    payload = {
        "amount": {"value": base_price, "currency": base_currency},
        "confirmation": {
            "type": "redirect",
            "return_url": f"{settings.frontend_url}/payment/success",
        },
        "capture": True,
        "description": "1-Month subscription",
        "metadata": {"user_id": user_id},
    }

    try:
        response = requests.post(
            "https://api.yookassa.ru/v3/payments",
            json=payload,
            auth=(settings.yookassa_shop_id, settings.yookassa_secret),
            headers={"Idempotence-Key": payment_id},
            timeout=15,
        )

        data = response.json()
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=response.status_code, detail=data)

        confirmation = data.get("confirmation", {}).get("confirmation_url")
        if not confirmation:
            raise HTTPException(
                status_code=400, detail="Missing confirmation URL in YooKassa response"
            )

        # after successful payment creation:
        payment_record = await payment_service.save_payment(data, user_id)

        return PaymentCreateResponse(
            confirmation_url=confirmation, payment=payment_record
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def yookassa_webhook(request: Request):
    """Handle YooKassa payment notifications."""
    try:
        body = await request.json()
        event = body.get("event")
        payment = body.get("object", {})

        if event == "payment.succeeded":
            await payment_service.handle_payment_succeeded(payment)
            return {"status": "ok", "message": "subscription created"}

        return {"status": "ignored"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscriptions", response_model=list[SubscriptionOut])
async def list_subscriptions(current_user=Depends(get_current_user)):
    """Return all subscriptions of the current user."""
    subs = await subscription_repo.get_by_user(current_user["user_id"])
    return subs
