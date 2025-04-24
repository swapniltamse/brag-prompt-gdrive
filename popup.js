
document.getElementById('save').addEventListener('click', () => {
  const note = document.getElementById('note').value;
  document.getElementById('status').innerText = "Saving...";
  chrome.runtime.sendMessage({ action: "save_note", text: note }, response => {
    document.getElementById('status').innerText = response.status;
    document.getElementById('note').value = "";
  });
});
