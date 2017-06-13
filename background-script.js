// Global Variables
var currentCounter = 0;
var tabArray = [];



// Functions

// Tab switching
function tabMatch(url, search, action) {
  if (search === "") {
    return false;
  }

  switch (action) {
    case "1":
    default:
      if (url.indexOf(search) !== -1) {
        return true;
      }
      break;

    case "2":
      if (url.slice(-1) === "/") {
        url = url.slice(0, -1);
      }
      if (url.substring(0, 4) === "http") {
        var temp = url.split('/');
        temp.splice(0, 2)
        url = temp.join("/");
      }
      if (url === search) {
        return true;
      }
      break;

    case "3":
      if (search.test(url)) {
        return true;
      }
      break;
  }
  return false;
}


function pickTab(key) {
  let pref = browser.storage.local.get("pref");
  let allTabs = browser.tabs.query({});

  pref.then((storage) => {
    var action = storage.pref.key[key].action;
    var tabUrl = storage.pref.key[key].url;
    var regex = storage.pref.key[key].regex;
    var prefix = "https:";

    if (tabUrl.substring(0, 4) === "http") {
      var temp = tabUrl.split('/');
      prefix = temp[0];
      temp.splice(0, 2);
      tabUrl = temp.join("/");
    }

    switch (action) {
      case "1":
      default:
        var searchString = tabUrl;
        break;
      case "2":
        if (tabUrl.slice(-1) === "/") {
          searchString = tabUrl.slice(0, -1);
        }
        break;
      case "3":
        try {
          var searchString = new RegExp(regex);
        } catch (e) {
          var searchString = "";
          browser.notifications.create("hotkeytabs_error", {
            "type": "basic",
            "title": "Hotkey Tabs Error",
            "message": "Regex Error (" + e.message + ")."
          });
        }
        break;
    }

    var tabFound = false;
    allTabs.then((tabs) => {
      switch (storage.pref.mode) {
        case "0":
        default:
          var matchArray = [];
          var tabId = 0;
          var maxValue = 0;
          for (var i = 0; i < tabs.length; i++) {
            if (tabMatch(tabs[i].url, searchString, action)) {
              matchArray.push(i);
              tabFound = true;
            }
          }
          for (var i = 0; i < matchArray.length; i++) {
            var temp = tabArray[tabs[matchArray[i]].id];
            if (typeof temp == "undefined") {
              temp = 0;
            }
            if (temp >= maxValue) {
              tabId = matchArray[i];
              maxValue = temp;
            }
          }
          break;

        case "1":
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
      } else if (tabUrl !== "") {
        var gettingCurrent = browser.tabs.query({
          currentWindow: true,
          active: true
        }).then((tabs) => {
          var newUrl = prefix + "//" + tabUrl;
          if (tabs[0].url === "about:newtab") {
            browser.tabs.update({
              url: newUrl
            });
          } else {
            browser.tabs.create({
              url: newUrl
            });
          }
        })
      }
    });
  });
};

// Context menus backend
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



// Startup

// Context Menu Creation
browser.contextMenus.create({
  id: "alt1",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt2",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt3",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt4",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt5",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt6",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt7",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt8",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt9",
  title: "",
  contexts: ["all"]
});

browser.contextMenus.create({
  id: "alt0",
  title: "",
  contexts: ["all"]
});

updateContext();




// Events

// Listen to shortcuts
browser.commands.onCommand.addListener(function(command) {
  var id = parseInt(command.split("").pop());
  if (command === "alt" + id) {
    pickTab(id);
  }
});


// Manage Install/Update
browser.notifications.onClicked.addListener(function(notificationId) {
  if (notificationId == "hotkeytabs_update") {
    // browser.tabs.create({
    //   url: "http://addons.mozilla.org/en-GB/firefox/addon/hotkey-tabs/versions/"
    // });
    browser.tabs.create({
      url: "update.html"
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
          mode: "0",
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

// Most reecnt tab
browser.tabs.onActivated.addListener(function(activeInfo) {
  tabArray[activeInfo.tabId] = currentCounter;
  currentCounter++;
});

// Context Menu listner
browser.contextMenus.onClicked.addListener((info, tab) => {
  var id = parseInt(info.menuItemId.split("").pop());
  let storage = browser.storage.local.get("pref");
  var tabUrl = tab.url;

  if (tabUrl.substring(0, 4) === "http") {
    var temp = tabUrl.split('/');
    temp.splice(3);
    tabUrl = temp.join("/");
  }

  storage.then((storage) => {
    var newPrefs = storage.pref;
    newPrefs.key[id].url = tabUrl;
    browser.storage.local.set({
      pref: newPrefs
    });
  });
});

browser.storage.onChanged.addListener(function() {
  updateContext();
});
