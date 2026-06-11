// lib/webhook.ts
export async function sendWebhook(
  url: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    })
  } catch (error) {
    console.error("Webhook delivery failed:", url, error)
  }
}