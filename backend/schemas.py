
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class LoginRequest(BaseModel):
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=1024)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SupportRequestCreate(BaseModel):
    request_type: Literal["maintenance", "ra_message"]

    category: str = Field(
        min_length=1,
        max_length=100
    )

    subject: str = Field(
        min_length=1,
        max_length=200
    )

    description: str = Field(
        min_length=1,
        max_length=10000
    )

    photo: str | None = Field(
        default=None,
        max_length=1400000
    )



class SupportRequestResponse(BaseModel):
    id: int
    sender_id: int
    recipient_id: int

    request_type: str
    category: str
    subject: str
    description: str

    photo: str | None = None
    status: str

    created_at: datetime
    updated_at: datetime

    # Resident and recipient information
    sender_name: str | None = None
    recipient_name: str | None = None

    # Housing information
    household_name: str | None = None
    group_name: str | None = None
    property_name: str | None = None

    model_config = {"from_attributes": True}

class SupportRequestStatusUpdate(BaseModel):
    status: Literal["submitted", "in_progress", "resolved", "closed"]


class SupportReplyCreate(BaseModel):
    message: str = Field(min_length=1, max_length=10000)


class SupportReplyResponse(BaseModel):
    id: int
    request_id: int
    sender_id: int
    message: str
    created_at: datetime
    sender_name: str | None = None

    model_config = {"from_attributes": True}


class RAConversationCreate(BaseModel):
    resident_id: int
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=10000)
