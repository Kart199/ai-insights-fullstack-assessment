from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
URL = "/api/insights"
VALID = {"prompt": "customer retention", "targetLanguage": "en"}


def assert_flat_error(response, code):
    assert response.status_code == 400
    body = response.json()
    assert body["error"] == code
    assert isinstance(body["message"], str)
    assert "detail" not in body


def test_success_is_paginated():
    body = client.post(URL, json=VALID).json()
    assert body["status"] == "SUCCESS"
    assert len(body["insights"]) == 10
    assert body["pagination"] == {
        "page": 1, "pageSize": 10, "total": 15, "hasNext": True,
    }


def test_second_page_has_remaining_items():
    body = client.post(f"{URL}?page=2", json=VALID).json()
    assert len(body["insights"]) == 5
    assert body["pagination"]["hasNext"] is False


def test_language_is_case_insensitive():
    assert client.post(URL, json={**VALID, "targetLanguage": "EN"}).status_code == 200


def test_empty_prompt():
    assert_flat_error(client.post(URL, json={**VALID, "prompt": ""}), "INVALID_PROMPT")


def test_whitespace_prompt():
    assert_flat_error(client.post(URL, json={**VALID, "prompt": "   "}), "INVALID_PROMPT")


def test_missing_prompt():
    assert_flat_error(client.post(URL, json={"targetLanguage": "en"}), "INVALID_PROMPT")


def test_unsupported_language():
    assert_flat_error(
        client.post(URL, json={**VALID, "targetLanguage": "xx"}), "INVALID_LANGUAGE"
    )


def test_invalid_context_id():
    assert_flat_error(
        client.post(URL, json={**VALID, "contextId": "nope"}), "INVALID_CONTEXT_ID"
    )


def test_invalid_page():
    assert_flat_error(client.post(f"{URL}?page=0", json=VALID), "INVALID_PAGINATION")


def test_short_prompt_needs_clarification_without_insights():
    body = client.post(URL, json={**VALID, "prompt": "hi"}).json()
    assert body["status"] == "NEEDS_CLARIFICATION"
    assert body["insights"] == []


def test_context_id_is_echoed():
    cid = "123e4567-e89b-12d3-a456-426614174000"
    assert client.post(URL, json={**VALID, "contextId": cid}).json()["contextId"] == cid


def test_context_id_generated_when_missing():
    assert client.post(URL, json=VALID).json()["contextId"]
