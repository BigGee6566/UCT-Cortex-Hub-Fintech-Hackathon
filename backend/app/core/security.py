from __future__ import annotations

import base64
import hashlib
import hmac
from dataclasses import dataclass

from cryptography.fernet import Fernet

from app.core.config import get_settings


@dataclass(frozen=True)
class TokenCipher:
    """Simple envelope for symmetric token encryption."""

    fernet: Fernet

    def encrypt(self, plaintext: str) -> str:
        return self.fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")

    def decrypt(self, ciphertext: str) -> str:
        return self.fernet.decrypt(ciphertext.encode("utf-8")).decode("utf-8")


def _derive_fernet_key(secret: str) -> bytes:
    """Derive a stable Fernet key from the Open Banking client secret.

    We avoid introducing additional secrets while still ensuring refresh tokens
    are encrypted at rest.
    """

    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


_settings = get_settings()
_cipher = TokenCipher(Fernet(_derive_fernet_key(_settings.OB_CLIENT_SECRET)))


def encrypt_token(token: str) -> str:
    return _cipher.encrypt(token)


def decrypt_token(ciphertext: str) -> str:
    return _cipher.decrypt(ciphertext)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_otp(code: str, *, email: str) -> str:
    """Hash OTP with email-bound HMAC for added context binding."""
    key = _settings.OB_CLIENT_SECRET.encode("utf-8")
    message = f"{email.lower()}:{code}".encode("utf-8")
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def verify_otp_hash(code: str, *, email: str, expected_hash: str) -> bool:
    computed = hash_otp(code, email=email)
    return hmac.compare_digest(computed, expected_hash)
