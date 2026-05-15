"""
Manual live test for an Alibaba Cloud Model Studio / DashScope API key.

Run from backend/:
    .\.venv\Scripts\python.exe tests\manual_dashscope_api_test.py

This file intentionally does not start with test_ so normal pytest runs do not
call a paid external model API.
"""

from __future__ import annotations

import json
import sys
from typing import Any

import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


API_KEY = "sk-74b831a312f4400c9ae5259203e257c4"
BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
MODEL = "qwen3.6-plus"
TIMEOUT_SECONDS = 60


def main() -> None:
    print("Testing DashScope API key without printing the key.")
    print(f"Base URL: {BASE_URL}")
    print(f"Model: {MODEL}")

    chat_ok = test_chat_completions()
    responses_ok = test_responses()

    if chat_ok:
        print("\nResult: OK - this key/model works with Chat Completions.")
    elif responses_ok:
        print("\nResult: OK - this key/model works with Responses API, but not Chat Completions.")
        print("The current backend trend analysis client uses Chat Completions.")
    else:
        print("\nResult: FAILED - this key/model did not work with either tested API.")


def test_chat_completions() -> bool:
    url = f"{BASE_URL}/chat/completions"
    payload: dict[str, Any] = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a JSON-only test assistant."},
            {"role": "user", "content": 'Return only this JSON: {"ok": true, "api": "chat"}'},
        ],
        "temperature": 0,
    }
    return post_and_report("Chat Completions", url, payload)


def test_responses() -> bool:
    url = f"{BASE_URL}/responses"
    payload: dict[str, Any] = {
        "model": MODEL,
        "input": 'Return only this JSON: {"ok": true, "api": "responses"}',
        "temperature": 0,
    }
    return post_and_report("Responses", url, payload)


def post_and_report(name: str, url: str, payload: dict[str, Any]) -> bool:
    print(f"\n--- {name} ---")
    print(f"POST {url}")
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        with httpx.Client(timeout=TIMEOUT_SECONDS, trust_env=False) as client:
            response = client.post(url, headers=headers, json=payload)
    except httpx.HTTPError as exc:
        print(f"Request error: {type(exc).__name__}: {exc}")
        return False

    print(f"HTTP status: {response.status_code}")
    try:
        data = response.json()
    except ValueError:
        print("Response was not JSON:")
        print(response.text[:1000])
        return False

    if response.is_success:
        print("Response JSON preview:")
        print(json.dumps(data, ensure_ascii=False, indent=2)[:2000])
        return True

    print("Error response:")
    print(json.dumps(data, ensure_ascii=False, indent=2)[:2000])
    return False


if __name__ == "__main__":
    main()
