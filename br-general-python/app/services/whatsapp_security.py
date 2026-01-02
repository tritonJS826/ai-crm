import hmac
import hashlib


def verify_signature(
    app_secret: str, payload: bytes, signature_header: str | None
) -> bool:
    if not signature_header:
        return False

    try:
        algo, signature = signature_header.split("=")
    except ValueError:
        return False

    if algo != "sha256":
        return False

    expected = hmac.new(
        key=app_secret.encode(),
        msg=payload,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)
