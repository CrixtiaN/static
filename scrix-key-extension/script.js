import {
  generateKeyPair,
  blobToBase64,
  arrayBufferToExtensionId,
} from "./rsa.js";

const privateOutput = document.getElementById("privateOutput");
const privateDownload = document.getElementById("privateDownload");
const publicOutput = document.getElementById("publicOutput");
const publicDownload = document.getElementById("publicDownload");
const publicCopy = document.getElementById("publicCopy");
const idOutput = document.getElementById("idOutput");
const $generateKey = document.getElementById("generateKey");

$generateKey.addEventListener("click", async (event) => {
  const { privateKey, publicKey } = await generateKeyPair();
  const extensionId = await arrayBufferToExtensionId(publicKey.derRaw);
  privateOutput.textContent = privateKey.pem;
  if (privateDownload.href) {
    URL.revokeObjectURL(privateDownload.href);
  }
  //privateDownload.href = await blobToBase64(new Blob([privateKey.pem], {type: "application/x-pem-file"}));
  privateDownload.download = `${extensionId}_private.pem`;
  privateDownload.href = URL.createObjectURL(new Blob([privateKey.pem]));
  //
  publicOutput.textContent = publicKey.pem;
  // publicDownload.href = await blobToBase64(new Blob([publicKey.pem], {type: "application/x-pem-file"}));
  if (publicDownload.href) {
    URL.revokeObjectURL(publicDownload.href);
  }
  publicDownload.download = `${extensionId}_public.pem`;
  publicDownload.href = URL.createObjectURL(new Blob([publicKey.pem]));
  publicCopy.dataset.content = publicKey.der.replace(/^data.+?base64,/, "");
  idOutput.textContent = extensionId;
});

function indicateSuccessfulCopy() {
  publicCopy.classList.toggle("bg-blue-500");
  publicCopy.classList.toggle("hover:bg-blue-700");
  publicCopy.classList.toggle("bg-green-500");
}

function indicateFailedCopy() {
  publicCopy.classList.toggle("bg-blue-500");
  publicCopy.classList.toggle("hover:bg-blue-700");
  publicCopy.classList.toggle("bg-red-500");
}

publicCopy.addEventListener("click", (event) => {
  navigator.clipboard
    .writeText(event.target.dataset.content ?? "")
    .then(() => {
      indicateSuccessfulCopy();
      setTimeout(indicateSuccessfulCopy, 1000);
    })
    .catch(() => {
      indicateFailedCopy();
      setTimeout(indicateFailedCopy, 1000);
    });
});

$generateKey.dispatchEvent(new Event("click"));
$generateKey.focus();
// idOutput.scrollIntoView();
