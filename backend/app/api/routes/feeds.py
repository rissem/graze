import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Feed,
    FeedCreate,
    FeedPublic,
    FeedsPublic,
    Message,
    UserFeed,
)

router = APIRouter(prefix="/feeds", tags=["feeds"])


@router.get("/", response_model=FeedsPublic)
def read_user_feeds(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve feeds followed by the current user.
    """
    # Get count of feeds followed by the user
    count_statement = (
        select(func.count())
        .select_from(Feed)
        .join(UserFeed)
        .where(UserFeed.user_id == current_user.id)
    )
    count = session.exec(count_statement).one()

    # Get feeds followed by the user
    statement = (
        select(Feed)
        .join(UserFeed)
        .where(UserFeed.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    feeds = session.exec(statement).all()

    return FeedsPublic(data=feeds, count=count)


@router.post("/follow/{feed_id}", response_model=FeedPublic)
def follow_feed(
    session: SessionDep, current_user: CurrentUser, feed_id: uuid.UUID
) -> Any:
    """
    Follow an existing feed.
    """
    # Check if feed exists
    feed = session.get(Feed, feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    # Check if user already follows this feed
    user_feed = session.exec(
        select(UserFeed).where(
            (UserFeed.user_id == current_user.id) & (UserFeed.feed_id == feed_id)
        )
    ).first()

    if user_feed:
        raise HTTPException(
            status_code=400, detail="You are already following this feed"
        )

    # Create the relationship
    user_feed = UserFeed(user_id=current_user.id, feed_id=feed_id)
    session.add(user_feed)
    session.commit()

    return feed


@router.delete("/unfollow/{feed_id}")
def unfollow_feed(
    session: SessionDep, current_user: CurrentUser, feed_id: uuid.UUID
) -> Message:
    """
    Unfollow a feed.
    """
    # Check if feed exists
    feed = session.get(Feed, feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")

    # Check if user follows this feed
    user_feed = session.exec(
        select(UserFeed).where(
            (UserFeed.user_id == current_user.id) & (UserFeed.feed_id == feed_id)
        )
    ).first()

    if not user_feed:
        raise HTTPException(status_code=400, detail="You are not following this feed")

    # Remove the relationship
    session.delete(user_feed)
    session.commit()

    return Message(message="Feed unfollowed successfully")


@router.post("/", response_model=FeedPublic)
def create_feed(
    *, session: SessionDep, current_user: CurrentUser, feed_in: FeedCreate
) -> Any:
    """
    Create a new RSS feed and follow it.
    """
    # Check if feed with same URL already exists
    statement = select(Feed).where(Feed.url == str(feed_in.url))
    existing_feed = session.exec(statement).first()

    if existing_feed:
        # Check if user already follows this feed
        user_feed = session.exec(
            select(UserFeed).where(
                (UserFeed.user_id == current_user.id)
                & (UserFeed.feed_id == existing_feed.id)
            )
        ).first()

        if user_feed:
            raise HTTPException(
                status_code=400, detail="You are already following a feed with this URL"
            )

        # User doesn't follow this feed yet, so create the relationship
        user_feed = UserFeed(user_id=current_user.id, feed_id=existing_feed.id)
        session.add(user_feed)
        session.commit()

        return existing_feed

    # Create new feed
    feed_data = feed_in.model_dump()
    feed_data["url"] = str(feed_in.url)  # Convert HttpUrl to string
    feed = Feed(**feed_data)
    session.add(feed)
    session.commit()
    session.refresh(feed)

    # Create the relationship
    user_feed = UserFeed(user_id=current_user.id, feed_id=feed.id)
    session.add(user_feed)
    session.commit()

    return feed


@router.get("/all", response_model=FeedsPublic)
def read_all_feeds(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve all feeds with pagination.
    """
    count_statement = select(func.count()).select_from(Feed)
    count = session.exec(count_statement).one()

    statement = select(Feed).offset(skip).limit(limit)
    feeds = session.exec(statement).all()

    return FeedsPublic(data=feeds, count=count)
