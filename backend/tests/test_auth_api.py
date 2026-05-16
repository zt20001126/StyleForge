import os

os.environ["STORAGE_MODE"] = "memory"
os.environ["USE_MOCK_AI"] = "true"
os.environ.pop("DATABASE_URL", None)

from fastapi.testclient import TestClient

from app.main import app
from app.repositories import repository


client = TestClient(app)


def setup_function() -> None:
    repository.clear()


def test_register_success_generates_profile_and_tokens() -> None:
    response = client.post(
        "/api/auth/register",
        json={"phone": "13800138000", "password": "Styleforge123", "confirm_password": "Styleforge123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["user"]["phone"] == "13800138000"
    assert body["user"]["username"]
    assert body["user"]["avatar_url"].startswith("/avatars/styleforge/")


def test_register_rejects_mismatched_passwords_and_duplicate_phone() -> None:
    mismatch = client.post(
        "/api/auth/register",
        json={"phone": "13800138000", "password": "Styleforge123", "confirm_password": "Styleforge456"},
    )
    assert mismatch.status_code == 400

    payload = {"phone": "13800138000", "password": "Styleforge123", "confirm_password": "Styleforge123"}
    assert client.post("/api/auth/register", json=payload).status_code == 200
    duplicate = client.post("/api/auth/register", json=payload)
    assert duplicate.status_code == 409
    assert duplicate.json()["code"] == "PHONE_ALREADY_REGISTERED"


def test_password_login_and_me() -> None:
    client.post(
        "/api/auth/register",
        json={"phone": "13800138000", "password": "Styleforge123", "confirm_password": "Styleforge123"},
    )

    bad_login = client.post("/api/auth/login", json={"phone": "13800138000", "password": "wrong"})
    assert bad_login.status_code == 401

    login = client.post("/api/auth/login", json={"phone": "13800138000", "password": "Styleforge123"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["phone"] == "13800138000"


def test_sms_login_flow_and_code_reuse_rejected() -> None:
    client.post(
        "/api/auth/register",
        json={"phone": "13800138000", "password": "Styleforge123", "confirm_password": "Styleforge123"},
    )

    sent = client.post("/api/auth/send-sms-code", json={"phone": "13800138000", "purpose": "login"})
    assert sent.status_code == 200
    code = sent.json()["dev_code"]
    assert code

    login = client.post("/api/auth/login/sms", json={"phone": "13800138000", "sms_code": code})
    assert login.status_code == 200
    assert login.json()["user"]["phone"] == "13800138000"

    reuse = client.post("/api/auth/login/sms", json={"phone": "13800138000", "sms_code": code})
    assert reuse.status_code == 401


def test_me_rejects_invalid_token() -> None:
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401
