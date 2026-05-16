from typing import Any

import httpx

from app.core.config import AIProviderConfig, Settings
from app.core.errors import AICallFailedError


def call_chat_completion(prompt: str, settings: Settings) -> str:
    provider_config = settings.get_ai_provider_config()
    if not provider_config.api_key:
        raise AICallFailedError(_missing_api_key_message(provider_config.provider))
    if not provider_config.base_url or provider_config.base_url == "https://api.example.com/v1":
        raise AICallFailedError(f"{provider_config.provider.upper()} base URL must be configured when USE_MOCK_AI is false")
    if not provider_config.model or provider_config.model == "mock-fashion-trend":
        raise AICallFailedError(f"{provider_config.provider.upper()} model must be configured when USE_MOCK_AI is false")

    if provider_config.provider == "anthropic":
        return _call_anthropic_messages(prompt, provider_config)
    return _call_openai_chat_completions(prompt, provider_config)


def _call_openai_chat_completions(prompt: str, provider_config: AIProviderConfig) -> str:
    base_url = provider_config.base_url.rstrip("/")
    url = f"{base_url}/chat/completions"
    payload: dict[str, Any] = {
        "model": provider_config.model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a senior fashion trend analyst. Return only strict JSON "
                    "that matches the user's requested schema."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {provider_config.api_key}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=provider_config.timeout_seconds, trust_env=False) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise AICallFailedError("AI request timed out") from exc
    except httpx.HTTPStatusError as exc:
        status_code = exc.response.status_code
        raise AICallFailedError(f"AI request failed with status {status_code}") from exc
    except httpx.HTTPError as exc:
        raise AICallFailedError("AI request failed") from exc

    try:
        data = response.json()
    except ValueError as exc:
        raise AICallFailedError("AI response body was not valid JSON") from exc
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise AICallFailedError("AI response did not contain message content") from exc

    if not isinstance(content, str) or not content.strip():
        raise AICallFailedError("AI response content is empty")
    return content.strip()


def _call_anthropic_messages(prompt: str, provider_config: AIProviderConfig) -> str:
    base_url = provider_config.base_url.rstrip("/")
    url = f"{base_url}/messages"
    payload: dict[str, Any] = {
        "model": provider_config.model,
        "max_tokens": 4096,
        "system": (
            "You are a senior fashion trend analyst. Return only strict JSON "
            "that matches the user's requested schema."
        ),
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {
        "x-api-key": provider_config.api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=provider_config.timeout_seconds, trust_env=False) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise AICallFailedError("AI request timed out") from exc
    except httpx.HTTPStatusError as exc:
        status_code = exc.response.status_code
        raise AICallFailedError(f"AI request failed with status {status_code}") from exc
    except httpx.HTTPError as exc:
        raise AICallFailedError("AI request failed") from exc

    try:
        data = response.json()
    except ValueError as exc:
        raise AICallFailedError("AI response body was not valid JSON") from exc

    try:
        content_blocks = data["content"]
        first_text_block = next(block for block in content_blocks if block.get("type") == "text")
        content = first_text_block["text"]
    except (KeyError, StopIteration, TypeError) as exc:
        raise AICallFailedError("AI response did not contain message content") from exc

    if not isinstance(content, str) or not content.strip():
        raise AICallFailedError("AI response content is empty")
    return content.strip()


def _missing_api_key_message(provider: str) -> str:
    if provider == "openai":
        return "OPENAI_API_KEY or AI_API_KEY is required when USE_MOCK_AI is false"
    if provider == "ark":
        return "ARK_API_KEY is required when USE_MOCK_AI is false"
    if provider == "dashscope":
        return "DASHSCOPE_API_KEY is required when USE_MOCK_AI is false"
    if provider == "anthropic":
        return "ANTHROPIC_AUTH_TOKEN is required when USE_MOCK_AI is false"
    return f"{provider.upper()} API key is required when USE_MOCK_AI is false"
