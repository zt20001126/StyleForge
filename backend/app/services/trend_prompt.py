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
        "Return trend summary, opportunity, risk, selectable trend pools, recommended design directions, "
        "and a base image-generation prompt."
    )
