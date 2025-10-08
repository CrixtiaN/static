globalThis?.observer?.disconnect();
if (!globalThis.directoryHandle) {
  globalThis.directoryHandle = await showDirectoryPicker({ mode: "readwrite" });
}
if (Notification.permission !== "granted") {
  await Notification.requestPermission();
}
const $idOutput = document.getElementById("idOutput");
const $generateKey = document.getElementById("generateKey");
const $privateDownload = document.getElementById("privateDownload");
const $publicDownload = document.getElementById("publicDownload");
async function saveFileFromObjectUrl(directoryHandle, name, objectUrl) {
  const fileHandler = await directoryHandle.getFileHandle(name, {
    create: true,
  });
  const fileWritable = await fileHandler.createWritable();
  const response = await fetch(objectUrl);
  await response.body.pipeTo(fileWritable);
}
if (!globalThis.localStorage.getItem("regex")) {
  globalThis.localStorage.setItem(
    "regex",
    "^(fio|manage|mngmn|plai|plei|achie|acced|polbo)"
  );
}
globalThis.observer = new MutationObserver((records, obs) => {
  for (const record of records) {
    if (record.type === "childList") {
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!obs.regex.test(node.data)) {
            setTimeout(() => {
              $generateKey.dispatchEvent(new Event("click"));
            }, 250);
          } else {
            if (Notification.permission === "granted") {
              const n = new Notification("Found a good key", {
                requireInteraction: true,
                body: node.data,
              });
              n.onclick = async () => {
                if (globalThis.directoryHandle) {
                  await saveFileFromObjectUrl(
                    globalThis.directoryHandle,
                    $privateDownload.download,
                    $privateDownload.href
                  );
                  await saveFileFromObjectUrl(
                    globalThis.directoryHandle,
                    $publicDownload.download,
                    $publicDownload.href
                  );
                } else {
                  window.focus();
                  n.onclose = null;
                }
                n.close();
              };
              n.onclose = (e) => {
                // console.log("notification closed", e);
                $generateKey.dispatchEvent(new Event("click"));
              };
            }
            // obs.disconnect();
          }
        }
      }
    }
    // console.log(record);
  }
});
globalThis.observer.start = function () {
  this.regex = new RegExp(globalThis.localStorage.getItem("regex"));
  this.observe($idOutput, {
    characterData: false,
    characterDataOldValue: false,
    attributes: false,
    subtree: false,
    childList: true,
  });
};
globalThis.observer.start();
$generateKey.dispatchEvent(new Event("click"));
