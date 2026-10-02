/** Escapes untrusted feedback before it is placed into an HTML email. */
export function escapeFeedbackHtml(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

function field(value: unknown, fallback = "N/A"): string {
  const escaped = escapeFeedbackHtml(value);
  return escaped || fallback;
}

function optionalField(label: string, value: unknown, lineBreaks = false): string {
  if (typeof value !== "string" || !value) return "";
  const escaped = escapeFeedbackHtml(value).replace(/\r?\n/g, "<br>");
  return lineBreaks
    ? `<p><strong>${label}:</strong></p><p>${escaped}</p>`
    : `<p><strong>${label}:</strong> ${escaped}</p>`;
}

/** Builds the internal notification without allowing feedback to become markup. */
export function feedbackNotificationHtml(feedbackData: Record<string, unknown>): string {
  return `
    <h2>New Feedback Received</h2>
    <p><strong>Category:</strong> ${field(feedbackData.category)}</p>
    <p><strong>Sentiment:</strong> ${field(feedbackData.sentiment)}</p>
    <p><strong>Page:</strong> ${field(feedbackData.page)}</p>
    <p><strong>Feature:</strong> ${field(feedbackData.feature)}</p>
    <p><strong>App Version:</strong> ${field(feedbackData.app_version)}</p>
    <p><strong>Deployment:</strong> ${field(feedbackData.deployment_environment)}</p>
    ${optionalField("Comment", feedbackData.comment, true)}
    ${optionalField("Affected Term", feedbackData.affected_term)}
    ${optionalField("Article ID", feedbackData.article_id)}
    <hr>
    <p style="font-size:12px;color:#666">User ID: ${field(feedbackData.user_id, "Anonymous")} | Session: ${field(feedbackData.session_id)}</p>
  `;
}
