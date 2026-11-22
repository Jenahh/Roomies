

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    CheckConstraint,
    func
)

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "role IN ('resident', 'ra', 'manager')"
        ),
    )


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    manager_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


class ResidentialGroup(Base):
    __tablename__ = "residential_groups"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)

    property_id = Column(
        Integer,
        ForeignKey("properties.id"),
        nullable=False
    )

    ra_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


class Household(Base):
    __tablename__ = "households"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)

    group_id = Column(
        Integer,
        ForeignKey("residential_groups.id"),
        nullable=False
    )


class ResidentProfile(Base):
    __tablename__ = "resident_profiles"

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        primary_key=True
    )

    household_id = Column(
        Integer,
        ForeignKey("households.id"),
        nullable=False
    )


class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(Integer, primary_key=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    recipient_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    request_type = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    photo = Column(Text, nullable=True)

    status = Column(
        String(30),
        default="submitted",
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "request_type IN ('maintenance', 'ra_message')"
        ),
        CheckConstraint(
            "status IN ('submitted', 'in_progress', "
            "'resolved', 'closed')"
        ),
    )


class SupportReply(Base):
    __tablename__ = "support_replies"

    id = Column(Integer, primary_key=True)

    request_id = Column(
        Integer,
        ForeignKey("support_requests.id"),
        nullable=False,
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    message = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
