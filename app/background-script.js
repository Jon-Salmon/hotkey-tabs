// Core add-on file
// This script runs in the background and handles everything except the settings page.

// Global Variables
var currentCounter = 0;
var tabArray = [];
var recentSimilarTabs = [];
var lastTab = 0;


// Functions

// Tab switching
// Boolean : Checks wether a tab matches the correct criteria
function tabMatch(url, search, action) {
  if (search === "") {
    return false;
  }

  // Switch on the type of match
  switch (action) {
    // Switch/open site
    case "1":
    default:
      if (url.indexOf(search) !== -1) {
        return true;
      }
      break;

    // Switch/open page
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

    // Regex matching
    case "3":
      if (search.test(url)) {
        return true;
      }
      break;
  }
  return false;
}


// Find and switch to new tab
function pickTab(key) {
  // Start asynchronous requests
  let pref = browser.storage.local.get("pref");
  let allTabs = browser.tabs.query({});
  let currentTab = browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT
  });

  pref.then((storage) => {
    // load variables from persistent storage
    var action = storage.pref.key[key].action;
    var tabUrl = storage.pref.key[key].url;
    var regex = storage.pref.key[key].regex;
    var prefix = "https:";

    // clean the search url
    if (tabUrl.substring(0, 4) === "http") {
      var temp = tabUrl.split('/');
      prefix = temp[0];
      temp.splice(0, 2);
      tabUrl = temp.join("/");
    }

    // set the search string depeding on the switching mode set in the settings
    switch (action) {
      // Match website
      case "1":
      default:
        var searchString = tabUrl;
        break;
      // Match webpages
      case "2":
        var searchString = tabUrl;
        // trim the final slash if pressent
        if (tabUrl.slice(-1) === "/") {
          searchString = tabUrl.slice(0, -1);
        }
        break;
      // Match via regex
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
    currentTab.then((cTab) => {

      if (tabMatch(cTab[0].url, searchString, action)) {
        // Add to similar tabs to allow moving between identical tabs
        if (recentSimilarTabs.indexOf() === -1) {
          recentSimilarTabs.push(cTab[0].id);
        }
      } else {
        // Clear recent tabs list if moving to a new matching critera
        recentSimilarTabs.length = 0;
        lastTab = cTab[0].id;
      }

      allTabs.then((tabs) => {
        // Switch by search direction
        switch (storage.pref.mode) {
          // Find last visited matching tab
          case "0":
          default:
            var matchArray = [];
            var tabId = 0;
            var maxValue = 0;
            for (var i = 0; i < tabs.length; i++) {
              if ((recentSimilarTabs.indexOf(tabs[i].id) === -1) && tabMatch(tabs[i].url, searchString, action)) {
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

          // Find first matching tab
          case "1":
            for (var i = 0; i < tabs.length; i++) {
              if ((recentSimilarTabs.indexOf(tabs[i].id) === -1) && tabMatch(tabs[i].url, searchString, action)) {
                var tabId = i;
                tabFound = true;
                break;
              }
            }
            break;

          // Find last matching tab
          case "2":
            for (var i = tabs.length - 1; i >= 0; i--) {
              if ((recentSimilarTabs.indexOf(tabs[i].id) === -1) && tabMatch(tabs[i].url, searchString, action)) {
                var tabId = i;
                tabFound = true;
                break;
              }
            }
            break;
        }

        if (tabFound) {
          // Move to new tab if found
          browser.tabs.update(tabs[tabId].id, {
            active: true
          });
          browser.windows.update(tabs[tabId].windowId, {
            focused: true
          });
        } else if (recentSimilarTabs.length === 1) {
          // Move to previous tab (if it matched previously)
          browser.tabs.update(tabs.find(x => x.id === lastTab).id, {
            active: true
          });
          browser.windows.update(tabs.find(x => x.id === lastTab).windowId, {
            focused: true
          });
          recentSimilarTabs.shift();
        } else if (recentSimilarTabs.length > 1) {
          // Move to previously visited matching tab
          browser.tabs.update(tabs.find(x => x.id === recentSimilarTabs[0]).id, {
            active: true
          });
          browser.windows.update(tabs.find(x => x.id === recentSimilarTabs[0]).windowId, {
            focused: true
          });
          recentSimilarTabs.shift();
        } else if (tabUrl !== "") {
          // Otherwise open a new tab at the required page
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
  });
};

// Context menus backend
// Updates the context menu options
function updateContext() {
  function internal(command, key) {
    if (key !== "") {
      browser.contextMenus.update(
        command.name, {
          title: "Bind to " + command.shortcut + " (" + ((key.url) ? key.url : "...") + ")"
        }
      );
    } else {
      browser.contextMenus.update(
        command.name, {
          title: "Bind to " + command.shortcut + " (...)"
        }
      );
    }
  }

  let commands = browser.commands.getAll();
  let storage = browser.storage.local.get("pref");

  storage.then((storage) => {
    commands.then((commands) => {
      for (var i = 0; i < commands.length - 1; i++) {
        internal(commands[i], storage.pref.key[i + 1]);
      }
      internal(commands[commands.length - 1], storage.pref.key[0]);
    });
  });
};



// Startup

// Context Menu Creation
let commands = browser.commands.getAll();
commands.then((commands) => {
  for (var i = 0; i < commands.length; i++) {
    // Creates a context menu item for each shortcut key
    browser.contextMenus.create({
      id: commands[i].name,
      title: "",
      contexts: ["all"]
    });
  }
  // Creates a context menu item for opening the add-on settings
  browser.contextMenus.create({
    id: "openOptions",
    title: "Configure hotkeys",
    contexts: ["all"]
  });
  // Sets text for all newly created context menus
  updateContext();
});




// Events

// Listen to shortcuts
browser.commands.onCommand.addListener(function(command) {
  var id = parseInt(command.split("").pop());
  // Check the shortcut is handled by app
  if (command === "alt" + id) {
    // Perform the required action
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

  // Check and store install/update status
  var manifest = browser.runtime.getManifest();
  let install = browser.storage.local.get("install");
  install.then((storage) => {
    if (storage.install === undefined) {
      browser.storage.local.set({
        install: manifest.version
      });
      browser.runtime.openOptionsPage();
    } else {
      if (storage.install !== manifest.version) {
        browser.notifications.create("hotkeytabs_update", {
          "type": "basic",
          "title": "Hotkey Tabs has been updated!",
          "message": "You are now running version V" + manifest.version + "\nClick here for release notes."
        });
        browser.storage.local.set({
          install: manifest.version
        });
      }
    }
  });
});

// Most reecnt tab
// Stores visited tabs in order for 'most recent' switching
browser.tabs.onActivated.addListener(function(activeInfo) {
  tabArray[activeInfo.tabId] = currentCounter;
  currentCounter++;
});

// Context Menu listner
// Handle all context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openOptions") {
    // Open options page
    browser.runtime.openOptionsPage();
    return;
  }
    
  // Otherwise, store the currnt website details
  var id = parseInt(info.menuItemId.split("").pop());
  let storage = browser.storage.local.get("pref");
  var tabUrl = tab.url;

  // Cleans http/https components
  if (tabUrl.substring(0, 4) === "http") {
    var temp = tabUrl.split('/');
    temp.splice(3);
    tabUrl = temp.join("/");
  }

  // Save to persistent storage
  storage.then((storage) => {
    var newPrefs = storage.pref;
    newPrefs.key[id].url = tabUrl;
    browser.storage.local.set({
      pref: newPrefs
    });
  });
});

// Update the contex menu everytime the persistent storage is written to
browser.storage.onChanged.addListener(function() {
  updateContext();
});