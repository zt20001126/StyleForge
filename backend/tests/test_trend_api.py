from fastapi.testclient import TestClient

from app.main import app
from app.repositories import repository


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


def test_create_trend_analysis_with_mock_ai() -> None:
    body = _create_analysis()
    assert body["status"] == "success"
    assert body["analysis_id"]
    assert body["result"]["summary"]
    assert len(body["result"]["style_directions"]) >= 3
    assert len(body["result"]["recommended_directions"]) == 3


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
