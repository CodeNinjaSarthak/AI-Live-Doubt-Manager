"""Encryption utilities for sensitive data."""

import base64

from app.core.config import settings
from cryptography.fernet import Fernet


def get_encryption_key() -> bytes:
    """Derive a Fernet-compatible key from the configured encryption_key.

    Config validator guarantees the key is at least 32 characters.
    Takes the first 32 bytes and base64-encodes them for use as a Fernet key.

    Returns:
        32-byte URL-safe base64-encoded key for Fernet.
    """
    key_bytes = settings.encryption_key.encode("utf-8")[:32]
    return base64.urlsafe_b64encode(key_bytes)


def encrypt_data(data: str) -> str:
    """Encrypt sensitive data.

    Args:
        data: Plain text data to encrypt.

    Returns:
        Encrypted data as base64 string.
    """
    f = Fernet(get_encryption_key())
    return base64.b64encode(f.encrypt(data.encode())).decode()


def decrypt_data(encrypted_data: str) -> str:
    """Decrypt sensitive data.

    Args:
        encrypted_data: Encrypted data as base64 string.

    Returns:
        Decrypted plain text data.
    """
    f = Fernet(get_encryption_key())
    decoded = base64.b64decode(encrypted_data.encode())
    return f.decrypt(decoded).decode()
