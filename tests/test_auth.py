"""Tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient

from main import app
from database import Base, engine


@pytest.fixture(autouse=True)
def setup_db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


class TestSignup:
    """Tests for POST /api/auth/signup."""

    def test_signup_success(self):
        """Successful registration returns a token."""
        response = client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "test@rockinsurance.com",
                "password": "password123",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["username"] == "testuser"
        assert data["token_type"] == "bearer"

    def test_signup_duplicate_username(self):
        """Duplicate username returns 400."""
        payload = {
            "username": "testuser",
            "email": "test@rockinsurance.com",
            "password": "password123",
        }
        client.post("/api/auth/signup", json=payload)
        response = client.post(
            "/api/auth/signup",
            json={**payload, "email": "other@rockinsurance.com"},
        )
        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]

    def test_signup_duplicate_email(self):
        """Duplicate email returns 400."""
        payload = {
            "username": "testuser",
            "email": "test@rockinsurance.com",
            "password": "password123",
        }
        client.post("/api/auth/signup", json=payload)
        response = client.post(
            "/api/auth/signup",
            json={**payload, "username": "otheruser"},
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_signup_short_password(self):
        """Password shorter than 6 characters is rejected."""
        response = client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "test@rockinsurance.com",
                "password": "short",
            },
        )
        assert response.status_code == 422


class TestLogin:
    """Tests for POST /api/auth/login."""

    def _create_user(self):
        """Helper: register a test user."""
        client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "test@rockinsurance.com",
                "password": "password123",
            },
        )

    def test_login_success(self):
        """Valid credentials return a token."""
        self._create_user()
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "password123"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_wrong_password(self):
        """Wrong password returns 401."""
        self._create_user()
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self):
        """Non-existent user returns 401."""
        response = client.post(
            "/api/auth/login",
            json={"username": "noone", "password": "password123"},
        )
        assert response.status_code == 401


class TestProtectedRoutes:
    """Tests for authenticated endpoints."""

    def test_me_without_token(self):
        """Accessing /api/auth/me without a token returns 401."""
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_me_with_valid_token(self):
        """Accessing /api/auth/me with valid token returns user info."""
        signup_resp = client.post(
            "/api/auth/signup",
            json={
                "username": "testuser",
                "email": "test@rockinsurance.com",
                "password": "password123",
                "full_name": "Test User",
            },
        )
        token = signup_resp.json()["access_token"]
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["username"] == "testuser"


class TestHealth:
    """Tests for GET /api/health."""

    def test_health_check(self):
        """Health endpoint returns healthy status."""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
