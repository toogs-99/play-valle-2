import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
// Salt fixo para derivar a chave a partir de CRYPTO_SECRET_KEY — não é sigilo por
// si só, o segredo real é o CRYPTO_SECRET_KEY (variável de ambiente).
const KEY_DERIVATION_SALT = "licitflow-crypto-salt-v1";

function getKey(): Buffer {
  const secret = process.env.CRYPTO_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "CRYPTO_SECRET_KEY não configurada. Gere uma com `openssl rand -base64 32` e defina no .env."
    );
  }
  return scryptSync(secret, KEY_DERIVATION_SALT, 32);
}

/** Criptografa um texto (ex.: access token) para armazenar no banco. */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

/** Reverte o encrypt() — lança erro se o texto estiver corrompido ou a chave mudou. */
export function decrypt(cipherText: string): string {
  const [ivB64, authTagB64, dataB64] = cipherText.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Formato de texto criptografado inválido.");
  }

  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
