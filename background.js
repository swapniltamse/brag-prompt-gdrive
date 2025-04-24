chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("dailyPrompt", { when: Date.now(), periodInMinutes: 1440 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyPrompt") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Time to reflect 🌱",
      message: "What did you do today that mattered?",
      priority: 1
    });
  }
});
