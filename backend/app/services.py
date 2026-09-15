def generate_insights(prompt: str, target_language: str):
    insights = []

    for i in range(1, 16):
        insights.append({
            "id": str(i),
            "title": f"Insight {i}",
            "text": f"This is insight {i} generated for: {prompt}",
            "metadata": {
                "category": "AI Analysis",
                "source": "Dummy AI Service"
            }
        })

    return insights