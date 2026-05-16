import os

os.environ["STORAGE_MODE"] = "memory"
os.environ["USE_MOCK_AI"] = "true"
os.environ.pop("DATABASE_URL", None)

from fastapi.testclient import TestClient

from app.api.routes import trend_analyses
from app.core.config import Settings
from app.core.errors import AICallFailedError
from app.main import app
from app.repositories import repository
from app.services import ai_client
from app.services.ai_client import call_chat_completion


client = TestClient(app)


def setup_function() -> None:
    repository.clear()


def _create_analysis() -> dict:
    response = client.post(
        "/api/trend-analyses",
        json={
            "category": "女款防晒夹克",
            "target_user": "18-30 岁城市通勤女性",
            "scene": "通勤 / 轻户外",
            "style": "轻机能、高级运动",
        },
    )
    assert response.status_code == 200
    return response.json()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["use_mock_ai"] is True
    assert body["storage_mode"] == "memory"


def test_settings_read_openai_environment_variables(monkeypatch) -> None:
    monkeypatch.delenv("AI_API_KEY", raising=False)
    monkeypatch.delenv("AI_BASE_URL", raising=False)
    monkeypatch.delenv("AI_MODEL", raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")
    monkeypatch.setenv("OPENAI_BASE_URL", "https://openai.example/v1")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4o-mini")

    settings = Settings(_env_file=None)

    assert settings.ai_api_key == "openai-key"
    assert settings.ai_base_url == "https://openai.example/v1"
    assert settings.ai_model == "gpt-4o-mini"


def test_settings_keep_legacy_ai_environment_variables(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_BASE_URL", raising=False)
    monkeypatch.delenv("OPENAI_MODEL", raising=False)
    monkeypatch.setenv("AI_API_KEY", "legacy-key")
    monkeypatch.setenv("AI_BASE_URL", "https://legacy.example/v1")
    monkeypatch.setenv("AI_MODEL", "legacy-model")

    settings = Settings(_env_file=None)

    assert settings.ai_api_key == "legacy-key"
    assert settings.ai_base_url == "https://legacy.example/v1"
    assert settings.ai_model == "legacy-model"


def test_openai_environment_variables_take_priority_over_legacy(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")
    monkeypatch.setenv("OPENAI_BASE_URL", "https://openai.example/v1")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-4o-mini")
    monkeypatch.setenv("AI_API_KEY", "legacy-key")
    monkeypatch.setenv("AI_BASE_URL", "https://legacy.example/v1")
    monkeypatch.setenv("AI_MODEL", "legacy-model")

    settings = Settings(_env_file=None)

    assert settings.ai_api_key == "openai-key"
    assert settings.ai_base_url == "https://openai.example/v1"
    assert settings.ai_model == "gpt-4o-mini"


def test_settings_build_ark_provider_config(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "ark")
    monkeypatch.setenv("ARK_API_KEY", "ark-key")
    monkeypatch.setenv("ARK_BASE_URL", "https://ark.example/api/v3")
    monkeypatch.setenv("ARK_TEXT_MODEL", "doubao-test")

    settings = Settings(_env_file=None)
    provider = settings.get_ai_provider_config()

    assert provider.provider == "ark"
    assert provider.api_key == "ark-key"
    assert provider.base_url == "https://ark.example/api/v3"
    assert provider.model == "doubao-test"


def test_settings_build_dashscope_provider_config(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "dashscope")
    monkeypatch.setenv("DASHSCOPE_API_KEY", "dashscope-key")
    monkeypatch.setenv("DASHSCOPE_BASE_URL", "https://dashscope.example/v1")
    monkeypatch.setenv("DASHSCOPE_TEXT_MODEL", "qwen-test")

    settings = Settings(_env_file=None)
    provider = settings.get_ai_provider_config()

    assert provider.provider == "dashscope"
    assert provider.api_key == "dashscope-key"
    assert provider.base_url == "https://dashscope.example/v1"
    assert provider.model == "qwen-test"


def test_settings_build_anthropic_provider_config(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "anthropic")
    monkeypatch.setenv("ANTHROPIC_AUTH_TOKEN", "deepseek-key")
    monkeypatch.setenv("ANTHROPIC_BASE_URL", "https://api.deepseek.com/anthropic")
    monkeypatch.setenv("ANTHROPIC_MODEL", "deepseek-v4-pro")
    monkeypatch.setenv("ANTHROPIC_DEFAULT_HAIKU_MODEL", "deepseek-v4-flash")
    monkeypatch.setenv("ANTHROPIC_DEFAULT_SONNET_MODEL", "deepseek-v4-pro")
    monkeypatch.setenv("ANTHROPIC_DEFAULT_OPUS_MODEL", "deepseek-v4-pro")

    settings = Settings(_env_file=None)
    provider = settings.get_ai_provider_config()

    assert provider.provider == "anthropic"
    assert provider.api_key == "deepseek-key"
    assert provider.base_url == "https://api.deepseek.com/anthropic"
    assert provider.model == "deepseek-v4-pro"


def test_settings_build_object_storage_config(monkeypatch) -> None:
    monkeypatch.setenv("OBJECT_STORAGE_PROVIDER", "minio")
    monkeypatch.setenv("MINIO_ENDPOINT", "http://localhost:9000")
    monkeypatch.setenv("MINIO_ACCESS_KEY", "minio-user")
    monkeypatch.setenv("MINIO_SECRET_KEY", "minio-secret")
    monkeypatch.setenv("MINIO_BUCKET", "styleforge-assets")

    settings = Settings(_env_file=None)
    storage = settings.object_storage

    assert storage.provider == "minio"
    assert storage.endpoint == "http://localhost:9000"
    assert storage.access_key == "minio-user"
    assert storage.secret_key == "minio-secret"
    assert storage.bucket == "styleforge-assets"


def test_real_ai_requires_api_key(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("AI_API_KEY", raising=False)
    monkeypatch.delenv("ARK_API_KEY", raising=False)
    monkeypatch.delenv("DASHSCOPE_API_KEY", raising=False)
    settings = Settings(
        _env_file=None,
        ai_api_key=None,
        ai_base_url="https://openai.example/v1",
        ai_model="gpt-4o-mini",
    )

    try:
        call_chat_completion("prompt", settings)
    except AICallFailedError as exc:
        assert exc.code == "AI_CALL_FAILED"
        assert "OPENAI_API_KEY or AI_API_KEY" in exc.message
    else:
        raise AssertionError("call_chat_completion should require an API key")


def test_anthropic_provider_requires_api_key() -> None:
    settings = Settings(
        _env_file=None,
        ai_provider="anthropic",
        anthropic_auth_token=None,
        anthropic_base_url="https://api.deepseek.com/anthropic",
        anthropic_model="deepseek-v4-pro",
    )

    try:
        call_chat_completion("prompt", settings)
    except AICallFailedError as exc:
        assert exc.code == "AI_CALL_FAILED"
        assert "ANTHROPIC_AUTH_TOKEN" in exc.message
    else:
        raise AssertionError("call_chat_completion should require ANTHROPIC_AUTH_TOKEN")


def test_call_anthropic_messages_parses_text_response(monkeypatch) -> None:
    captured: dict = {}

    class FakeResponse:
        status_code = 200

        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return {"content": [{"type": "text", "text": "{\"summary\":\"ok\"}"}]}

    class FakeClient:
        def __init__(self, timeout: int, trust_env: bool) -> None:
            captured["timeout"] = timeout
            captured["trust_env"] = trust_env

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback) -> None:
            return None

        def post(self, url: str, json: dict, headers: dict) -> FakeResponse:
            captured["url"] = url
            captured["json"] = json
            captured["headers"] = headers
            return FakeResponse()

    monkeypatch.setattr(ai_client.httpx, "Client", FakeClient)
    settings = Settings(
        _env_file=None,
        ai_provider="anthropic",
        anthropic_auth_token="deepseek-key",
        anthropic_base_url="https://api.deepseek.com/anthropic",
        anthropic_model="deepseek-v4-pro",
    )

    content = call_chat_completion("trend prompt", settings)

    assert content == "{\"summary\":\"ok\"}"
    assert captured["url"] == "https://api.deepseek.com/anthropic/messages"
    assert captured["headers"]["x-api-key"] == "deepseek-key"
    assert captured["headers"]["anthropic-version"] == "2023-06-01"
    assert captured["json"]["model"] == "deepseek-v4-pro"
    assert captured["json"]["messages"] == [{"role": "user", "content": "trend prompt"}]


def test_create_trend_analysis_with_mock_ai() -> None:
    body = _create_analysis()
    assert body["status"] == "success"
    assert body["analysis_id"]
    assert body["result"]["summary"]
    assert len(body["result"]["style_directions"]) == 4
    assert len(body["result"]["silhouettes"]) == 4
    assert len(body["result"]["fabric_trends"]) == 4
    assert len(body["result"]["recommended_directions"]) == 4


def test_create_trend_analysis_with_real_ai_response(monkeypatch) -> None:
    monkeypatch.setattr(trend_analyses.settings, "use_mock_ai", False)
    monkeypatch.setattr(trend_analyses.settings, "ai_api_key", "test-key")
    monkeypatch.setattr(trend_analyses, "call_chat_completion", lambda prompt, settings: _valid_ai_response())

    body = _create_analysis()

    assert body["status"] == "success"
    assert body["result"]["summary"] == "A clear trend summary."
    assert body["error_message"] is None


def test_invalid_ai_response_is_saved_as_failed(monkeypatch) -> None:
    monkeypatch.setattr(trend_analyses.settings, "use_mock_ai", False)
    monkeypatch.setattr(trend_analyses.settings, "ai_api_key", "test-key")
    monkeypatch.setattr(trend_analyses, "call_chat_completion", lambda prompt, settings: "not json")

    response = client.post(
        "/api/trend-analyses",
        json={
            "category": "dress",
            "target_user": "commuter women",
            "scene": "office",
            "style": "minimal",
        },
    )

    assert response.status_code == 502
    assert response.json()["code"] == "AI_RESULT_INVALID"

    history = client.get("/api/trend-analyses?page=1&page_size=20").json()
    assert history["pagination"]["total"] == 1
    assert history["list"][0]["status"] == "failed"

    detail = client.get(f"/api/trend-analyses/{history['list'][0]['analysis_id']}").json()
    assert detail["status"] == "failed"
    assert detail["result"] is None
    assert detail["error_message"] == "AI response was not valid JSON"


def test_get_trend_analysis_detail() -> None:
    created = _create_analysis()
    response = client.get(f"/api/trend-analyses/{created['analysis_id']}")
    assert response.status_code == 200
    body = response.json()
    assert body["analysis_id"] == created["analysis_id"]
    assert body["created_at"]
    assert body["updated_at"]


def test_list_trend_analysis_history() -> None:
    _create_analysis()
    response = client.get("/api/trend-analyses?page=1&page_size=20")
    assert response.status_code == 200
    body = response.json()
    assert body["pagination"]["total"] == 1
    assert body["list"][0]["category"] == "女款防晒夹克"


def test_generate_design_plan_success() -> None:
    created = _create_analysis()
    analysis_id = created["analysis_id"]
    response = client.post(
        "/api/design-plans/generate",
        json={
            "analysis_id": analysis_id,
            "selected_style_ids": ["style_light_tech"],
            "selected_silhouette_ids": ["silhouette_cropped_loose"],
            "selected_structure_ids": ["structure_sun_hood", "structure_air_vents"],
            "selected_color_ids": ["color_glacier_white", "color_mist_blue"],
            "selected_fabric_ids": ["fabric_uv_shell"],
            "selected_selling_point_ids": ["sp_upf", "sp_breathable"],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["analysis_id"] == analysis_id
    assert body["popularity_score"] >= 80
    assert body["ai_prompt"]


def test_generate_design_plan_unknown_id_returns_validation_error() -> None:
    created = _create_analysis()
    response = client.post(
        "/api/design-plans/generate",
        json={
            "analysis_id": created["analysis_id"],
            "selected_style_ids": ["missing_style"],
            "selected_silhouette_ids": [],
            "selected_structure_ids": [],
            "selected_color_ids": [],
            "selected_fabric_ids": [],
            "selected_selling_point_ids": [],
        },
    )
    assert response.status_code == 400
    assert response.json()["code"] == "VALIDATION_ERROR"


def test_save_and_get_design_plan() -> None:
    created = _create_analysis()
    analysis_id = created["analysis_id"]
    selection = {
        "analysis_id": analysis_id,
        "selected_style_ids": ["style_light_tech"],
        "selected_silhouette_ids": ["silhouette_cropped_loose"],
        "selected_structure_ids": ["structure_sun_hood"],
        "selected_color_ids": ["color_glacier_white"],
        "selected_fabric_ids": ["fabric_uv_shell"],
        "selected_selling_point_ids": ["sp_upf"],
    }
    plan = client.post("/api/design-plans/generate", json=selection).json()
    response = client.post(
        "/api/design-plans",
        json={
            "analysis_id": analysis_id,
            "selection": selection,
            "design_summary": plan["design_summary"],
            "style_description": plan["style_description"],
            "recommended_direction": plan["recommended_direction"],
            "popularity_score": plan["popularity_score"],
            "ai_prompt": plan["ai_prompt"],
            "warnings": plan["warnings"],
            "is_favorite": True,
        },
    )
    assert response.status_code == 200
    saved = response.json()
    assert saved["design_plan_id"]
    assert saved["is_favorite"] is True

    detail_response = client.get(f"/api/design-plans/{saved['design_plan_id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["design_plan_id"] == saved["design_plan_id"]
    assert detail["is_favorite"] is True


def test_save_design_plan_accepts_frontend_selected_items_payload() -> None:
    created = _create_analysis()
    analysis_id = created["analysis_id"]
    selection = {
        "analysis_id": analysis_id,
        "selected_style_ids": ["style_light_tech"],
        "selected_silhouette_ids": ["silhouette_cropped_loose"],
        "selected_structure_ids": ["structure_sun_hood"],
        "selected_color_ids": ["color_glacier_white"],
        "selected_fabric_ids": ["fabric_uv_shell"],
        "selected_selling_point_ids": ["sp_upf"],
    }
    plan = client.post("/api/design-plans/generate", json=selection).json()
    response = client.post(
        "/api/design-plans",
        json={
            "analysis_id": analysis_id,
            "selected_items": selection,
            "design_summary": plan["design_summary"],
            "style_description": plan["style_description"],
            "recommended_direction": plan["recommended_direction"],
            "popularity_score": plan["popularity_score"],
            "ai_prompt": plan["ai_prompt"],
            "warnings": plan["warnings"],
            "is_favorite": True,
        },
    )
    assert response.status_code == 200
    assert response.json()["design_plan_id"]


def test_not_found_errors() -> None:
    analysis_response = client.get("/api/trend-analyses/not-found")
    assert analysis_response.status_code == 404
    assert analysis_response.json()["code"] == "NOT_FOUND"

    plan_response = client.get("/api/design-plans/not-found")
    assert plan_response.status_code == 404
    assert plan_response.json()["code"] == "NOT_FOUND"


def _valid_ai_response() -> str:
    return """
    {
      "summary": "A clear trend summary.",
      "opportunity": "A clear market opportunity.",
      "risk": "A clear market risk.",
      "style_directions": [
        {
          "id": "style_minimal",
          "name": "Minimal utility",
          "description": "Clean lines with practical detail.",
          "score": 90,
          "reason": "It balances daily wear and product differentiation.",
          "tags": ["minimal", "utility"]
        }
      ],
      "silhouettes": [
        {
          "id": "silhouette_relaxed",
          "name": "Relaxed straight",
          "description": "Easy straight silhouette.",
          "score": 88,
          "reason": "It fits a broad audience.",
          "tags": ["straight"]
        }
      ],
      "core_structures": [
        {
          "id": "structure_pocket",
          "name": "Hidden pocket",
          "description": "Useful hidden storage.",
          "score": 86,
          "reason": "It creates a tangible selling point.",
          "tags": ["storage"]
        }
      ],
      "color_palette": [
        {
          "id": "color_ivory",
          "name": "Ivory",
          "hex": "#F6F1E8",
          "role": "primary",
          "score": 87,
          "reason": "It is versatile and commercial."
        }
      ],
      "fabric_trends": [
        {
          "id": "fabric_cotton",
          "name": "Cotton blend",
          "description": "Soft and structured.",
          "score": 85,
          "reason": "It is suitable for everyday wear.",
          "tags": ["cotton"]
        }
      ],
      "selling_points": [
        {
          "id": "sp_easy_care",
          "name": "Easy care",
          "description": "Low-maintenance daily wear.",
          "score": 89,
          "reason": "It reduces purchase hesitation.",
          "tags": ["care"]
        }
      ],
      "recommended_directions": [
        {
          "id": "direction_daily",
          "name": "Daily utility direction",
          "positioning": "Commercial daily wear",
          "target_user": "commuter women",
          "style_ids": ["style_minimal"],
          "silhouette_ids": ["silhouette_relaxed"],
          "structure_ids": ["structure_pocket"],
          "color_ids": ["color_ivory"],
          "fabric_ids": ["fabric_cotton"],
          "selling_point_ids": ["sp_easy_care"],
          "design_summary": "A clean daily style with utility details.",
          "popularity_score": 88,
          "cost_complexity": "low",
          "ai_prompt": "minimal utility daily wear, ivory, relaxed straight silhouette"
        }
      ],
      "base_prompt": "minimal utility daily wear"
    }
    """
