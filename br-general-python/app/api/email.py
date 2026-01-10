from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
import logging

from app.schemas.email import EmailSendRequest, EmailSendResponse
from app.services.email_service import EmailService
from app.api.users import get_current_user
from app.schemas.user import Role

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/send", response_model=EmailSendResponse, status_code=202)
async def send_email(
    payload: EmailSendRequest,
    bg: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    async def _task():
        try:
            await EmailService.send(
                to=payload.to,
                subject=payload.subject,
                text=payload.text,
                html=payload.html,
                template=payload.template,
                params=payload.params,
            )
        except Exception as e:
            logger.error(f"Email send failed: {e}")

    bg.add_task(_task)
    return EmailSendResponse(accepted=True)
