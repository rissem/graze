import asyncio
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic.networks import EmailStr

from app.api.deps import get_current_active_superuser
from app.models import Message, SSEEvent
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/")
async def health_check() -> bool:
    return True


@router.get("/sse-ping/")
async def sse_ping() -> StreamingResponse:
    """
    SSE endpoint that sends "Pong" every 0.5 seconds for 10 seconds.

    Returns a streaming response with server-sent events.
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        for i in range(20):  # 10 seconds at 0.5 seconds per iteration
            if i % 2 == 0:  # Send "Pong" every 0.5 seconds
                event = SSEEvent(data="Pong", id=str(i // 2))
                yield f"id: {event.id}\ndata: {event.data}\n\n"
            await asyncio.sleep(
                0.25
            )  # Sleep for 0.25 seconds, so total 0.5 seconds with processing time

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
