export function blobToBase64(blob) {
  const fileReader = new FileReader();
  const { promise, resolve, reject } = Promise.withResolvers();
  fileReader.addEventListener("load", () => resolve(fileReader.result));
  fileReader.addEventListener("error", () => reject(fileReader.error));
  fileReader.readAsDataURL(blob);
  return promise;
}

async function derKeyToPem(arrayBuffer, type = "private") {
  const blob = new Blob([arrayBuffer], { type: "application/x-pem-file" });
  const base64Encoded = await blobToBase64(blob);
  const header = `-----BEGIN ${type.toUpperCase()} KEY-----`;
  const footer = `-----END ${type.toUpperCase()} KEY-----`;
  const pem = base64Encoded
    .replace(/^data.+?base64,/, "")
    .match(/.{1,64}/g)
    .join("\n");
  return `${header}\n${pem}\n${footer}`;
}

export async function generateKeyPair() {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-1",
    },
    true,
    ["sign"]
  );
  const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", privateKey);
  const exportedPublicKey = await crypto.subtle.exportKey("spki", publicKey);
  return {
    privateKey: {
      derRaw: exportedPrivateKey,
      der: await blobToBase64(
        new Blob([exportedPrivateKey], { type: "application/pkcs8" })
      ),
      pem: await derKeyToPem(exportedPrivateKey, "private"),
    },
    publicKey: {
      derRaw: exportedPublicKey,
      der: await blobToBase64(
        new Blob([exportedPublicKey], { type: "application/pkcs8" })
      ),
      pem: await derKeyToPem(exportedPublicKey, "public"),
    },
  };
}

function prettyByte(byte = 0) {
  return byte.toString(16).padStart(2, "0");
}

export async function sha256(arrayBuffer) {
  const arrayBufferHash = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const bytes = new Uint8Array(arrayBufferHash);
  return Array.from(bytes, prettyByte).join("");
}

export async function arrayBufferToExtensionId(arrayBuffer) {
  const LETTERS = "abcdefghijklmnop";
  const hash = await sha256(arrayBuffer);
  return hash
    .slice(0, 32)
    .split("")
    .map((c) => {
      const index = Number.parseInt(c, 16);
      return LETTERS[index];
    })
    .join("");
}
