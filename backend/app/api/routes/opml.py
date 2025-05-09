import xml.etree.ElementTree as ET
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import Feed, FeedCreate, OpmlImportResponse, UserFeed

router = APIRouter(prefix="/opml", tags=["opml"])


@router.post("/import", response_model=OpmlImportResponse)
async def import_opml(
    session: SessionDep,
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> Any:
    """
    Import feeds from an OPML file
    """
    # Check file type
    if not file.filename or not file.filename.endswith((".opml", ".xml")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only OPML files are supported.",
        )

    # Parse OPML file
    try:
        content = await file.read()
        root = ET.fromstring(content)

        # Find all feed entries
        feed_entries = []
        # Look for outline elements that typically contain feed info in OPML
        for outline in root.findall(".//outline"):
            # Check if this is a feed entry (has xmlUrl attribute)
            xml_url = outline.get("xmlUrl")
            if xml_url:
                feed_title = (
                    outline.get("title") or outline.get("text") or "Untitled Feed"
                )
                feed_description = outline.get("description", "")

                feed_entries.append(
                    {
                        "url": xml_url,
                        "name": feed_title,
                        "description": feed_description,
                    }
                )

        if not feed_entries:
            raise HTTPException(
                status_code=400, detail="No valid feed entries found in the OPML file."
            )

        # Process each feed
        imported_count = 0
        skipped_count = 0

        for entry in feed_entries:
            # Check if the feed already exists
            statement = select(Feed).where(Feed.url == entry["url"])
            existing_feed = session.exec(statement).first()

            if existing_feed:
                # Check if user is already following this feed
                user_feed = session.exec(
                    select(UserFeed).where(
                        (UserFeed.user_id == current_user.id)
                        & (UserFeed.feed_id == existing_feed.id)
                    )
                ).first()

                if user_feed:
                    # User already follows this feed
                    skipped_count += 1
                    continue

                # User isn't following this feed, create relationship
                user_feed = UserFeed(user_id=current_user.id, feed_id=existing_feed.id)
                session.add(user_feed)
                imported_count += 1
            else:
                # Create new feed
                feed_data = FeedCreate(
                    url=entry["url"],
                    name=entry["name"],
                    description=entry["description"],
                )

                # Convert feed_data to dict
                feed_dict = feed_data.model_dump()
                feed_dict["url"] = str(feed_data.url)  # Convert HttpUrl to string

                # Create and save feed
                feed = Feed(**feed_dict)
                session.add(feed)
                session.flush()  # Get ID without committing

                # Create relationship
                user_feed = UserFeed(user_id=current_user.id, feed_id=feed.id)
                session.add(user_feed)
                imported_count += 1

        # Commit all changes
        session.commit()

        return OpmlImportResponse(
            message=f"OPML import completed. {imported_count} feeds imported, {skipped_count} feeds skipped.",
            imported_count=imported_count,
            skipped_count=skipped_count,
        )

    except ET.ParseError:
        raise HTTPException(
            status_code=400, detail="Invalid OPML file format. Could not parse XML."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the OPML file: {str(e)}",
        )
