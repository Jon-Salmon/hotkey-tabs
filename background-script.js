function tabMatch(url, search, action) {
  if (search === "") {
    return false;
  }
  switch (action) {
    case "1":
    default:
      if (url.indexOf(search) !== -1) {
        return true;
        break;
      }

    case "2":
      if (url.substring(0, 4) === "http") {
        var temp = url.split('/');
        temp.splice(0, 2)
        url = temp.join("/");
      }
      if (url === search) {
        return true;
        break;
      }
  }
  return false;
}


function pickTab(key) {
  let pref = browser.storage.local.get("pref");
  let allTabs = browser.tabs.query({});

  pref.then((storage) => {
    var action = storage.pref.key[key].action;
    var tabUrl = storage.pref.key[key].url;
    var prefix = "https:";

    if (tabUrl.substring(0, 4) === "http") {
      var temp = tabUrl.split('/');
      prefix = temp[0];
      temp.splice(0, 2)
      tabUrl = temp.join("/");
    }

    switch (action) {
      case "1":
      default:
        var searchString = tabUrl.split('/')[0];
        break;
      case "2":
        var searchString = tabUrl;
        break;
    }

    var tabFound = false;
    allTabs.then((tabs) => {
      switch (storage.pref.mode) {
        case "1":
        default:
          for (var i = 0; i < tabs.length; i++) {
            if (tabMatch(tabs[i].url, searchString, action)) {
              var tabId = i;
              tabFound = true;
              break;
            }
          }
          break;

        case "2":
          for (var i = tabs.length - 1; i >= 0; i--) {
            if (tabMatch(tabs[i].url, searchString, action)) {
              var tabId = i;
              tabFound = true;
              break;
            }
          }
          break;
      }

      if (tabFound) {
        browser.tabs.update(tabs[tabId].id, {
          active: true
        });
        browser.windows.update(tabs[tabId].windowId, {
          focused: true
        });
      } else {
        var newUrl = prefix + "//" + tabUrl;
        browser.tabs.create({
          url: newUrl
        });
      }
    });
  });
}

// browser.commands.onCommand.addListener(function(command) {
//   var id = parseInt(command.split("").pop());
//   if (command === "alt" + id) {
//     pickTab(id);
//   }
// });

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  pickTab(parseInt(request.key));
});


// Manage Install/Update

browser.notifications.onClicked.addListener(function(notificationId) {
  if (notificationId == "hotkeytabs_update") {
    browser.tabs.create({
      url: "http://addons.mozilla.org/en-GB/firefox/addon/hotkey-tabs/versions/"
    });
  };
});

browser.runtime.onInstalled.addListener(function(details) {
  var manifest = browser.runtime.getManifest();
  browser.notifications.create("hotkeytabs_update", {
    "type": "basic",
    "title": "Hotkey Tabs has been updated!",
    "message": "You are now running version V" + manifest.version + "\nClick here for release notes."
  });

  // Initialise defaults if not set
  let temp = browser.storage.local.get("pref");
  temp.then((storage) => {
    if (storage.pref === undefined) {
      browser.storage.local.set({
        pref: {
          mode: "1",
          modifier: "Alt",
          key: function() {
            var settings = []
            for (var i = 0; i < 10; i++) {
              settings.push({
                action: "1",
                url: ""
              });
            }
            return settings;
          }()
        }
      });
    }
  });
});


// Context Menu backend

function updateContext() {
  let storage = browser.storage.local.get("pref");
  storage.then((storage) => {

    for (var i = 0; i < 10; i++) {
      if (storage.pref.key[i] !== "") {
        browser.contextMenus.update(
          "alt" + i, {
            title: "Bind to ALT-" + i + " (" + ((storage.pref.key[i].url) ? storage.pref.key[i].url : "...") + ")"
          }
        );
      } else {
        browser.contextMenus.update(
          "alt" + i, {
            title: "Bind to ALT-" + i + " (...)"
          }
        );
      }
    }
  });
};

browser.contextMenus.create({
  id: "alt1",
  title: "",
  contexts: ["all"]
});

// browser.contextMenus.create({
//   id: "alt2",
//   title: "",
//   contexts: ["all"]
// });

browser.contextMenus.create({
  id: "alt0",
  title: "",
  contexts: ["all"]
});

updateContext();

browser.contextMenus.onClicked.addListener((info, tab) => {
  var id = parseInt(info.menuItemId.split("").pop());
  let storage = browser.storage.local.get("pref");
  storage.then((storage) => {
    var newPrefs = storage.pref;
    newPrefs.key[id].url = tab.url;
    browser.storage.local.set({
      pref: newPrefs
    });
  });
});

browser.storage.onChanged.addListener(function() {
  updateContext();
});
