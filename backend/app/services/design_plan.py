from app.core.errors import ValidationAppError
from app.schemas.trend import MyDesignPlan, TrendAnalysisDetail, UserDesignSelection


def generate_design_plan(analysis: TrendAnalysisDetail, selection: UserDesignSelection) -> MyDesignPlan:
    if analysis.analysis_id != selection.analysis_id:
        raise ValidationAppError("selection.analysis_id does not match analysis_id")

    result = analysis.result
    pools = {
        "selected_style_ids": result.style_directions,
        "selected_silhouette_ids": result.silhouettes,
        "selected_structure_ids": result.core_structures,
        "selected_color_ids": result.color_palette,
        "selected_fabric_ids": result.fabric_trends,
        "selected_selling_point_ids": result.selling_points,
    }

    selected_names: list[str] = []
    selected_scores: list[int] = []
    for field_name, options in pools.items():
        option_map = {option.id: option for option in options}
        for item_id in getattr(selection, field_name):
            option = option_map.get(item_id)
            if option is None:
                raise ValidationAppError(f"Unknown selected id in {field_name}: {item_id}")
            selected_names.append(option.name)
            selected_scores.append(option.score)

    if not selected_scores:
        raise ValidationAppError("At least one trend item must be selected")

    direction_name = _match_direction_name(analysis, selection)
    popularity_score = round(sum(selected_scores) / len(selected_scores))
    warnings = _build_warnings(selection, popularity_score)

    return MyDesignPlan(
        analysis_id=analysis.analysis_id,
        design_summary=(
            f"面向 {analysis.input.target_user} 的 {analysis.input.category}，融合 "
            f"{'、'.join(selected_names[:6])} 等趋势要素。"
        ),
        style_description=(
            f"整体延续 {analysis.input.style} 方向，适合 {analysis.input.scene}，"
            "强调功能感、搭配性和商业转化的平衡。"
        ),
        recommended_direction=direction_name,
        popularity_score=popularity_score,
        ai_prompt=(
            f"{analysis.result.base_prompt}，{'，'.join(selected_names)}，"
            "高级成衣设计稿，清晰产品结构，电商主图级质感。"
        ),
        selected_items=selection,
        warnings=warnings,
    )


def _match_direction_name(analysis: TrendAnalysisDetail, selection: UserDesignSelection) -> str:
    for direction in analysis.result.recommended_directions:
        if set(direction.style_ids).issubset(selection.selected_style_ids):
            return direction.name
    return "自定义趋势组合方案"


def _build_warnings(selection: UserDesignSelection, popularity_score: int) -> list[str]:
    warnings: list[str] = []
    if popularity_score < 82:
        warnings.append("当前组合爆款指数偏保守，可增加更高分卖点。")
    if len(selection.selected_structure_ids) > 4:
        warnings.append("结构选择较多，可能提高打样复杂度。")
    if not selection.selected_color_ids:
        warnings.append("缺少颜色方案，AI 生图提示词可能不够稳定。")
    return warnings
