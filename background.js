let docTitle = "Brag Prompt Log";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "save_note") {
    const text = message.text;

    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError) {
        sendResponse({
          status: "Auth error: " + chrome.runtime.lastError.message,
        });
        return;
      }

      chrome.storage.local.get(["docId"], function (result) {
        if (result.docId) {
          appendToDoc(result.docId, text, token, sendResponse);
        } else {
          createDoc(token, function (newDocId) {
            chrome.storage.local.set({ docId: newDocId }, () => {
              appendToDoc(newDocId, text, token, sendResponse);
            });
          });
        }
      });
    });
    return true;
  }
});

function createDoc(token, callback) {
  fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: docTitle }),
  })
    .then((res) => res.json())
    .then((data) => callback(data.documentId));
}

function appendToDoc(docId, text, token, callback) {
  fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((doc) => {
      const endIndex =
        doc.body && doc.body.content && doc.body.content.length > 0
          ? doc.body.content[doc.body.content.length - 1].endIndex
          : 1;

      const body = {
        requests: [
          {
            insertText: {
              location: { index: endIndex - 1 },
              text: `\n[${new Date().toLocaleString()}] ${text}\n`,
            },
          },
        ],
      };

      fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then(() => callback({ status: "Saved!" }));
    });
}
