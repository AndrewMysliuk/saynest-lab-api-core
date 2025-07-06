import crypto from "crypto"

export function generatePublicId(review_id: string, user_id: string): string {
  const raw = `${review_id}-${user_id}-${Date.now()}`
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16)
}
