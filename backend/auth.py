# backend/auth.py
"""
Simple JWT authentication for the LUME CMS admin panel.

This is a single-user admin auth system (not multi-user).
The admin logs in with a password, gets a JWT token, and includes
that token in all subsequent requests.

ENV VARS:
    ADMIN_PASSWORD  — The password to access the CMS (set in Railway/Replit)
    JWT_SECRET      — Secret key for signing JWT tokens (set in Railway/Replit)

USAGE:
    # In your admin routes:
    from auth import require_admin

    @router.get("/admin/listings")
    async def list_listings(admin = Depends(require_admin)):
        ...
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ---------------------------------------------------------------------------
# JWT helpers (using python-jose, already in requirements.txt)
# ---------------------------------------------------------------------------

_bearer_scheme = HTTPBearer(auto_error=False)

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72  # Admin stays logged in for 3 days


def _get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET", "")
    if not secret:
        raise RuntimeError(
            "JWT_SECRET must be set. Generate one with: "
            "python -c \"import secrets; print(secrets.token_hex(32))\""
        )
    return secret


def _get_admin_password() -> str:
    password = os.getenv("ADMIN_PASSWORD", "")
    if not password:
        raise RuntimeError("ADMIN_PASSWORD must be set in environment variables.")
    return password


def create_token() -> dict:
    """
    Create a JWT access token for the admin.
    Returns: {"access_token": "...", "token_type": "bearer", "expires_in": seconds}
    """
    from jose import jwt

    secret = _get_jwt_secret()
    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=JWT_EXPIRATION_HOURS)

    payload = {
        "sub": "admin",
        "iat": now,
        "exp": expires,
    }

    token = jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": int(JWT_EXPIRATION_HOURS * 3600),
    }


def verify_token(token: str) -> Optional[dict]:
    """
    Verify and decode a JWT token.
    Returns the payload dict if valid, None if invalid/expired.
    """
    from jose import jwt, JWTError

    try:
        secret = _get_jwt_secret()
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_password(password: str) -> bool:
    """Check if the provided password matches ADMIN_PASSWORD."""
    return password == _get_admin_password()


# ---------------------------------------------------------------------------
# FastAPI dependency — use this to protect admin routes
# ---------------------------------------------------------------------------

async def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict:
    """
    FastAPI dependency that enforces admin authentication.

    Usage:
        @router.get("/admin/something")
        async def my_route(admin = Depends(require_admin)):
            # admin is the decoded JWT payload
            ...

    The client sends: Authorization: Bearer <token>
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload
