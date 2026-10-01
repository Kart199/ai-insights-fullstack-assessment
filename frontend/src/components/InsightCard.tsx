import { memo } from "react";
import type { Insight } from "../types/insight";

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="insight-card">
      <h3>{insight.title}</h3>
      <p>{insight.text}</p>
      <div className="metadata">
        <span>Category: {insight.metadata.category}</span>
        <span>Source: {insight.metadata.source}</span>
      </div>
    </article>
  );
}

export default memo(InsightCard);
