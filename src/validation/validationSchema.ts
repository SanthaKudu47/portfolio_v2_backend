import z from "zod";

export const UserMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
});

export const SessionInitSchema = z.object({
  sessionId: z.uuid(),
});

export const SignedTokenSchema = z.string().refine((token) => {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [uuid, signature] = parts;

  // Validate UUID
  const uuidValid = z.string().uuid().safeParse(uuid).success;
  if (!uuidValid) return false;

  // Validate signature: must be 64-char hex
  const signatureValid = /^[a-f0-9]{64}$/.test(signature);
  if (!signatureValid) return false;

  return true;
}, "Invalid session token format");
