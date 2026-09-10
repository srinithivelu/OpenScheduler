from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Queue

from pwdlib import PasswordHash


# ============================================================
# AUTHENTICATION CONFIGURATION
# ============================================================

router = APIRouter(
    tags=["Authentication"]
)


SECRET_KEY = "openscheduler-secret-key-change-later"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


password_hash = PasswordHash.recommended()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return password_hash.verify(
        plain_password,
        hashed_password
    )


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    user_id: str
) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": user_id,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # CHECK EXISTING EMAIL
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(
            User.email == user_data.email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    # --------------------------------------------------------
    # CHECK EXISTING USERNAME
    # --------------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(
            User.username == user_data.username
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )


    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(
            user_data.password
        )
    )

    db.add(user)

    db.commit()

    db.refresh(user)


    # --------------------------------------------------------
    # CREATE DEFAULT QUEUE
    # --------------------------------------------------------

    default_queue = Queue(
        user_id=user.id,
        name="default-queue",
        description="Default queue"
    )

    db.add(default_queue)

    db.commit()


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Account created successfully",

        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email
        }
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == login_data.email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # --------------------------------------------------------
    # VERIFY PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        login_data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    # --------------------------------------------------------
    # CREATE TOKEN
    # --------------------------------------------------------

    token = create_access_token(
        str(user.id)
    )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "access_token": token,

        "token_type": "bearer",

        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email
        }
    }


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )


    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Login session expired"
        )


    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# ============================================================
# CURRENT USER ENDPOINT
# ============================================================

@router.get("/me")
def get_me(
    current_user: User = Depends(
        get_current_user
    )
):

    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email
    }