export async function notifyAdmin(input: { subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) return { status: "NOT_CONFIGURED" as const };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: input.subject, text: input.text })
    });
    if (!response.ok) return { status: "FAILED" as const };
    return { status: "SENT" as const };
  } catch {
    return { status: "FAILED" as const };
  }
}
