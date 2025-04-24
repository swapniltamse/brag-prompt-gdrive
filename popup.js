function authenticate(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    console.log("Token acquired", token);
    callback(token);
  });
}

function uploadToDrive(token, text) {
  const metadata = {
    name: `brag-entry-${new Date().toISOString()}.txt`,
    mimeType: "application/vnd.google-apps.document",
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", new Blob([text], { type: "text/plain" }));

  fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + token }),
      body: form,
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("Uploaded", data);
      document.getElementById("status").innerText = "Saved to Google Drive!";
    });
}

document.getElementById("saveBtn").addEventListener("click", () => {
  const entry = document.getElementById("entry").value;

  authenticate((token) => {
    uploadToDrive(token, entry);
  });
});
