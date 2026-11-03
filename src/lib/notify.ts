// New-lead alerts. Set LEAD_WEBHOOK_URL to a Discord or Slack incoming-webhook URL; without it, leads
// still land in /admin, nothing is sent. A failed alert never breaks the form. Callers wait for it, because
// a serverless function can stop as soon as it has responded.
export async function notifyLead(text: string): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  const body = url.includes("hooks.slack.com") ? { text } : { content: text.slice(0, 1900) };
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("lead alert failed", err);
  }
}
