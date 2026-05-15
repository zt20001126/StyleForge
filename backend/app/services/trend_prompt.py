from app.schemas.trend import TrendAnalysisInput


def build_trend_analysis_prompt(input_data: TrendAnalysisInput) -> str:
    return (
        "You are a senior fashion trend analyst. Analyze the fashion category based on the user's inputs "
        "and return structured JSON for the StyleForge trend workbench.\n\n"
        "User inputs:\n"
        f"- Category: {input_data.category}\n"
        f"- Target user: {input_data.target_user}\n"
        f"- Scene: {input_data.scene}\n"
        f"- Style direction: {input_data.style}\n\n"
        "Return only valid JSON. Do not wrap the response in Markdown fences. Do not include explanations.\n"
        "Return exactly 4 items in each trend pool array: style_directions, silhouettes, "
        "core_structures, color_palette, fabric_trends, and selling_points. Return exactly "
        "4 items in recommended_directions.\n"
        "The JSON must match this schema exactly:\n"
        "{\n"
        '  "summary": "string",\n'
        '  "opportunity": "string",\n'
        '  "risk": "string",\n'
        '  "style_directions": [{"id": "string", "name": "string", "description": "string", "score": 0, "reason": "string", "tags": ["string"]}],\n'
        '  "silhouettes": [{"id": "string", "name": "string", "description": "string", "score": 0, "reason": "string", "tags": ["string"]}],\n'
        '  "core_structures": [{"id": "string", "name": "string", "description": "string", "score": 0, "reason": "string", "tags": ["string"]}],\n'
        '  "color_palette": [{"id": "string", "name": "string", "hex": "#RRGGBB", "role": "primary|secondary|accent", "score": 0, "reason": "string"}],\n'
        '  "fabric_trends": [{"id": "string", "name": "string", "description": "string", "score": 0, "reason": "string", "tags": ["string"]}],\n'
        '  "selling_points": [{"id": "string", "name": "string", "description": "string", "score": 0, "reason": "string", "tags": ["string"]}],\n'
        '  "recommended_directions": [{\n'
        '    "id": "string", "name": "string", "positioning": "string", "target_user": "string",\n'
        '    "style_ids": ["string"], "silhouette_ids": ["string"], "structure_ids": ["string"],\n'
        '    "color_ids": ["string"], "fabric_ids": ["string"], "selling_point_ids": ["string"],\n'
        '    "design_summary": "string", "popularity_score": 0, "cost_complexity": "low|medium|high", "ai_prompt": "string"\n'
        "  }],\n"
        '  "base_prompt": "string"\n'
        "}\n"
        "Use stable snake_case IDs. Scores must be integers from 0 to 100. Every ID referenced by "
        "recommended_directions must exist in the matching trend pool."
    )
