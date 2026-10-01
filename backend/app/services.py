DUMMY_INSIGHT_COUNT = 15


def generate_insights(prompt: str, target_language: str) -> list[dict]:
    """Stand-in for the downstream LLM call."""
    return [
        {
            "id": str(i),
            "title": f"Insight {i}",
            "text": f"This is insight {i} generated for: {prompt}",
            "metadata": {
                "category": "AI Analysis",
                "source": "Dummy AI Service",
                "language": target_language,
            },
        }
        for i in range(1, DUMMY_INSIGHT_COUNT + 1)
    ]
