// Store sign-up is invite-only. Valid codes are listed in the INVITE_CODES
// env var (comma- or space-separated); each can be redeemed once.
export function normaliseCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function isInviteCode(code: string) {
  const list = (process.env.INVITE_CODES ?? "").split(/[\s,]+/).map(normaliseCode).filter(Boolean);
  return list.includes(normaliseCode(code));
}
