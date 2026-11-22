
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

import jwt

from dotenv import load_dotenv
from pwdlib import PasswordHash

from fastapi import (
    Depends,
    HTTPException
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

from database import get_db
from models import User


load_dotenv(Path(__file__).resolve().parent / ".env")

SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hasher = PasswordHash.recommended()

security = HTTPBearer(auto_error=False)


# Verify a user's password.
def verify_password(password, password_hash):
    return password_hasher.verify(
        password,
        password_hash
    )


# Generate an authentication token.
def create_access_token(user_id):
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expiration
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# Identify the user making an API request.
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
):

    unauthorized = HTTPException(
        status_code=401,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["sub", "exp"]}
        )

        user_id = int(payload["sub"])

    except (jwt.InvalidTokenError, ValueError, KeyError, TypeError):
        raise unauthorized

    user = db.get(User, user_id)

    if user is None:
        raise unauthorized

    return user
