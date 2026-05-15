from app.core.errors import AIResultInvalidError
from app.schemas.trend import TrendAnalysisResult


def validate_trend_result(result: TrendAnalysisResult) -> None:
    _ensure_unique_ids("style_directions", [item.id for item in result.style_directions])
    _ensure_unique_ids("silhouettes", [item.id for item in result.silhouettes])
    _ensure_unique_ids("core_structures", [item.id for item in result.core_structures])
    _ensure_unique_ids("color_palette", [item.id for item in result.color_palette])
    _ensure_unique_ids("fabric_trends", [item.id for item in result.fabric_trends])
    _ensure_unique_ids("selling_points", [item.id for item in result.selling_points])
    _ensure_unique_ids("recommended_directions", [item.id for item in result.recommended_directions])

    pools = {
        "style_ids": {item.id for item in result.style_directions},
        "silhouette_ids": {item.id for item in result.silhouettes},
        "structure_ids": {item.id for item in result.core_structures},
        "color_ids": {item.id for item in result.color_palette},
        "fabric_ids": {item.id for item in result.fabric_trends},
        "selling_point_ids": {item.id for item in result.selling_points},
    }

    for direction in result.recommended_directions:
        for field_name, valid_ids in pools.items():
            referenced_ids = getattr(direction, field_name)
            missing = [item_id for item_id in referenced_ids if item_id not in valid_ids]
            if missing:
                raise AIResultInvalidError(
                    f"recommended_directions.{direction.id}.{field_name} references unknown ids: {', '.join(missing)}"
                )


def _ensure_unique_ids(field_name: str, ids: list[str]) -> None:
    if len(ids) != len(set(ids)):
        raise AIResultInvalidError(f"{field_name} contains duplicate ids")
