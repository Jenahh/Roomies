from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import base64
import binascii
from models import SupportRequest, SupportReply
from schemas import (
    SupportRequestCreate,
    SupportRequestResponse,
    SupportRequestStatusUpdate,
    SupportReplyCreate,
    SupportReplyResponse,
    RAConversationCreate,
)
from models import (
    User,
    Property,
    ResidentialGroup,
    Household,
    ResidentProfile
)
from schemas import (
    LoginRequest,
    LoginResponse,
    UserResponse
)
from auth import (
    verify_password,
    create_access_token,
    get_current_user
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Roomies API",
    description="Backend for the Roomies application",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {
        "message": "Welcome to the Roomies API!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Authenticate a user.
@app.post("/auth/login", response_model=LoginResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == request.email.strip().lower()
    ).first()

    if not user or not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# Retrieve the authenticated user's account.
@app.get("/auth/me", response_model=UserResponse)
def get_account(
    current_user: User = Depends(get_current_user)
):
    return current_user


# Retrieve a resident's assigned housing and staff.
@app.get("/resident/assignment")
def get_resident_assignment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only residents can access this endpoint.
    if current_user.role != "resident":
        raise HTTPException(
            status_code=403,
            detail="Only residents can access this endpoint"
        )

    # Find the resident's profile.
    profile = db.get(
        ResidentProfile,
        current_user.id
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Resident profile not found"
        )

    # Find the resident's household.
    household = db.get(
        Household,
        profile.household_id
    )

    if not household:
        raise HTTPException(
            status_code=404,
            detail="Household not found"
        )

    # Find the residential group.
    group = db.get(
        ResidentialGroup,
        household.group_id
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Residential group not found"
        )

    # Find the property.
    property_record = db.get(
        Property,
        group.property_id
    )

    if not property_record:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    # Find the assigned resident assistant.
    ra = db.get(User, group.ra_id)

    # Find the assigned property manager.
    manager = db.get(
        User,
        property_record.manager_id
    )

    if not ra or ra.role != "ra":
        raise HTTPException(
            status_code=404,
            detail="Assigned RA not found"
        )

    if not manager or manager.role != "manager":
        raise HTTPException(
            status_code=404,
            detail="Assigned property manager not found"
        )

    # Return the resident's assignment information.
    return {
        "property": {
            "id": property_record.id,
            "name": property_record.name
        },
        "group": {
            "id": group.id,
            "name": group.name
        },
        "household": {
            "id": household.id,
            "name": household.name
        },
        "resident_assistant": {
            "id": ra.id,
            "name": ra.name,
            "email": ra.email
        },
        "property_manager": {
            "id": manager.id,
            "name": manager.name,
            "email": manager.email
        }
    }


@app.post(
    "/support/requests",
    response_model=SupportRequestResponse,
    status_code=201
)
def create_support_request(
    request: SupportRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only residents can submit support requests.
    if current_user.role != "resident":
        raise HTTPException(
            status_code=403,
            detail="Only residents can submit support requests"
        )

    # Reject empty or whitespace-only fields.
    if not all([
        request.category.strip(),
        request.subject.strip(),
        request.description.strip()
    ]):
        raise HTTPException(
            status_code=400,
            detail="Category, subject and description are required"
        )

    # Retrieve the resident's actual assignment.
    assignment = get_resident_assignment(
        current_user=current_user,
        db=db
    )

    # Determine the correct recipient.
    if request.request_type == "maintenance":

        recipient_id = assignment["property_manager"]["id"]

    else:

        recipient_id = assignment["resident_assistant"]["id"]

    # Validate optional photo attachments.
    if request.photo is not None:

        if request.request_type != "maintenance":
            raise HTTPException(
                status_code=400,
                detail="Photos are only allowed for maintenance requests"
            )

        allowed_prefixes = (
            "data:image/jpeg;base64,",
            "data:image/png;base64,",
            "data:image/webp;base64,"
        )

        if not request.photo.startswith(allowed_prefixes):
            raise HTTPException(
                status_code=400,
                detail="Invalid photo format"
            )

        try:
            encoded_photo = request.photo.split(",", 1)[1]

            decoded_photo = base64.b64decode(
                encoded_photo,
                validate=True
            )

        except (ValueError, binascii.Error):
            raise HTTPException(
                status_code=400,
                detail="Invalid photo data"
            )

        if not decoded_photo or len(decoded_photo) > 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Photo must be between 1 byte and 1 MB"
            )

    # Create the database record.
    support_request = SupportRequest(
        sender_id=current_user.id,
        recipient_id=recipient_id,
        request_type=request.request_type,
        category=request.category.strip(),
        subject=request.subject.strip(),
        description=request.description.strip(),
        photo=request.photo,
        status="submitted"
    )

    # Save the request.
    db.add(support_request)
    db.commit()
    db.refresh(support_request)

    return support_request


# Retrieve support requests for the logged-in user.


def get_conversation_resident_id(request: SupportRequest, db: Session):
    """Identify the resident, regardless of who started the conversation."""
    sender = db.get(User, request.sender_id)
    recipient = db.get(User, request.recipient_id)
    if sender and sender.role == "resident":
        return sender.id
    if recipient and recipient.role == "resident":
        return recipient.id
    return None


@app.get(
    "/support/requests",
    response_model=list[SupportRequestResponse]
)
def get_support_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    query = db.query(SupportRequest)

    if current_user.role == "resident":

        query = query.filter(
            (SupportRequest.sender_id == current_user.id)
            | (
                (SupportRequest.recipient_id == current_user.id)
                & (SupportRequest.request_type == "ra_message")
            )
        )

    elif current_user.role == "ra":

        query = query.filter(
            SupportRequest.request_type == "ra_message",
            (SupportRequest.recipient_id == current_user.id)
            | (SupportRequest.sender_id == current_user.id),
        )

    elif current_user.role == "manager":

        query = query.filter(
            SupportRequest.recipient_id == current_user.id,
            SupportRequest.request_type == "maintenance"
        )

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    requests = query.order_by(
        SupportRequest.created_at.desc(),
        SupportRequest.id.desc()
    ).all()

    results = []

    for request in requests:

        sender = db.get(User, request.sender_id)

        recipient = db.get(User, request.recipient_id)

        resident_id = get_conversation_resident_id(request, db)
        profile = (
            db.get(ResidentProfile, resident_id)
            if resident_id is not None else None
        )

        household = (
            db.get(Household, profile.household_id)
            if profile else None
        )

        group = (
            db.get(ResidentialGroup, household.group_id)
            if household else None
        )

        property_record = (
            db.get(Property, group.property_id)
            if group else None
        )

        result = SupportRequestResponse.model_validate(
            request
        )

        result.sender_name = (
            sender.name if sender else None
        )

        result.recipient_name = (
            recipient.name if recipient else None
        )

        result.household_name = (
            household.name if household else None
        )

        result.group_name = (
            group.name if group else None
        )

        result.property_name = (
            property_record.name if property_record else None
        )

        results.append(result)

    return results


@app.patch(
    "/support/requests/{request_id}/status",
    response_model=SupportRequestResponse
)
def update_support_request_status(
    request_id: int,
    update: SupportRequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only property managers can update maintenance statuses.
    if current_user.role != "manager":
        raise HTTPException(
            status_code=403,
            detail="Only property managers can update maintenance requests"
        )

    # Find a maintenance request assigned to this manager.
    support_request = db.query(SupportRequest).filter(
        SupportRequest.id == request_id,
        SupportRequest.recipient_id == current_user.id,
        SupportRequest.request_type == "maintenance",
    ).first()

    if not support_request:
        raise HTTPException(
            status_code=404,
            detail="Maintenance request not found"
        )

    # Save the updated status.
    support_request.status = update.status

    db.commit()
    db.refresh(support_request)

    return support_request


def get_accessible_support_request(
    request_id: int,
    current_user: User,
    db: Session,
) -> SupportRequest:
    """Find a support request the logged-in user can access."""

    support_request = db.get(SupportRequest, request_id)

    if not support_request:
        raise HTTPException(
            status_code=404,
            detail="Support request not found",
        )

    if current_user.role == "resident":
        allowed = (
            support_request.sender_id == current_user.id
            or (
                support_request.request_type == "ra_message"
                and support_request.recipient_id == current_user.id
            )
        )

    elif current_user.role == "ra":
        allowed = (
            support_request.request_type == "ra_message"
            and (
                support_request.sender_id == current_user.id
                or support_request.recipient_id == current_user.id
            )
        )

    elif current_user.role == "manager":
        allowed = (
            support_request.recipient_id == current_user.id
            and support_request.request_type == "maintenance"
        )

    else:
        allowed = False

    if not allowed:
        raise HTTPException(
            status_code=404,
            detail="Support request not found",
        )

    return support_request


def format_support_reply(
    reply: SupportReply,
    db: Session,
) -> SupportReplyResponse:
    """Add the sender's name to a reply response."""

    result = SupportReplyResponse.model_validate(reply)

    sender = db.get(User, reply.sender_id)

    result.sender_name = sender.name if sender else None

    return result


@app.get(
    "/support/requests/{request_id}/replies",
    response_model=list[SupportReplyResponse],
)
def get_support_replies(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify that this user can access the conversation.
    get_accessible_support_request(
        request_id,
        current_user,
        db,
    )

    replies = (
        db.query(SupportReply)
        .filter(SupportReply.request_id == request_id)
        .order_by(
            SupportReply.created_at.asc(),
            SupportReply.id.asc(),
        )
        .all()
    )

    return [
        format_support_reply(reply, db)
        for reply in replies
    ]


@app.post(
    "/support/requests/{request_id}/replies",
    response_model=SupportReplyResponse,
    status_code=201,
)
def create_support_reply(
    request_id: int,
    reply: SupportReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify that this user belongs to the conversation.
    get_accessible_support_request(
        request_id,
        current_user,
        db,
    )

    message = reply.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Reply cannot be empty",
        )

    new_reply = SupportReply(
        request_id=request_id,
        sender_id=current_user.id,
        message=message,
    )

    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)

    return format_support_reply(new_reply, db)


# List only residents assigned to the authenticated RA.
@app.get("/ra/residents")
def get_ra_residents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "ra":
        raise HTTPException(status_code=403, detail="Only RAs can access this endpoint")

    rows = (
        db.query(User, Household, ResidentialGroup)
        .join(ResidentProfile, ResidentProfile.user_id == User.id)
        .join(Household, Household.id == ResidentProfile.household_id)
        .join(ResidentialGroup, ResidentialGroup.id == Household.group_id)
        .filter(User.role == "resident", ResidentialGroup.ra_id == current_user.id)
        .order_by(User.name.asc(), User.id.asc())
        .all()
    )
    return [
        {
            "id": resident.id,
            "name": resident.name,
            "email": resident.email,
            "household_name": household.name,
            "group_name": group.name,
        }
        for resident, household, group in rows
    ]


# Start a conversation with a resident assigned to the authenticated RA.
@app.post("/ra/conversations", response_model=SupportRequestResponse, status_code=201)
def create_ra_conversation(
    conversation: RAConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "ra":
        raise HTTPException(status_code=403, detail="Only RAs can start conversations")

    subject = conversation.subject.strip()
    message = conversation.message.strip()
    if not subject or not message:
        raise HTTPException(status_code=400, detail="Subject and message are required")

    resident = (
        db.query(User)
        .join(ResidentProfile, ResidentProfile.user_id == User.id)
        .join(Household, Household.id == ResidentProfile.household_id)
        .join(ResidentialGroup, ResidentialGroup.id == Household.group_id)
        .filter(
            User.id == conversation.resident_id,
            User.role == "resident",
            ResidentialGroup.ra_id == current_user.id,
        )
        .first()
    )
    if resident is None:
        raise HTTPException(status_code=404, detail="Resident not found in your assigned group")

    new_conversation = SupportRequest(
        sender_id=current_user.id,
        recipient_id=resident.id,
        request_type="ra_message",
        category="RA Message",
        subject=subject,
        description=message,
        photo=None,
        status="submitted",
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    result = SupportRequestResponse.model_validate(new_conversation)
    result.sender_name = current_user.name
    result.recipient_name = resident.name
    return result
