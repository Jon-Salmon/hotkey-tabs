function pickTab(key){
    let pref = browser.storage.local.get("pref");
    pref.then((storage) => {
      var action = storage.pref.key[key].action;
      var tabUrl = storage.pref.key[key].url;

      if (tabUrl.substring(0,4) === "http") {
      	var temp = tabUrl.split('/');
        temp.splice(0,2)
        tabUrl = temp.join("/");
      }

      if (action == 1){
      	var searchString = tabUrl.split('/')[0];
        searchString = "*://" + searchString + "/*";
      } else {
        var searchString = ["*://" + tabUrl + "/", "*://" + tabUrl];
      }
      var matchingTabs = browser.tabs.query({url: searchString});
      matchingTabs.then((tabs) => {
        if (tabs.length === 0){
          var newUrl = "https://" + tabUrl;
          browser.tabs.create({
            url: newUrl
          });
        } else {

          if (storage.pref.mode == "2"){
            var tabId = tabs.length - 1;
          } else {
            var tabId = 0;
          }

          browser.tabs.update(tabs[tabId].id, {
            active: true
          });
          browser.windows.update(tabs[tabId].windowId, {
            focused: true
          });
        }
      });
    });
};

browser.commands.onCommand.addListener(function(command) {
  var id = parseInt(command.split("").pop());
  if (command === "alt" + id) {
    pickTab(id);
  }
});


// Manage Install/Update

browser.notifications.onClicked.addListener(function(notificationId) {
  if (notificationId == "hotkeytabs_update"){
    browser.tabs.create({
      url:"http://addons.mozilla.org/en-GB/firefox/addon/hotkey-tabs/versions/"
    });
  };
});

browser.runtime.onInstalled.addListener(function(details){
  var manifest = browser.runtime.getManifest();
  browser.notifications.create("hotkeytabs_update", {
    "type": "basic",
    "title": "Hotkey Tabs has been updated!",
    "message": "You are now running version V" + manifest.version + "\nClick here for release notes."
  });

  // Initialise defaults if not set
  let temp = browser.storage.local.get("pref");
  temp.then((storage) => {
    if (storage.pref === undefined){
      browser.storage.local.set({
        pref: {
          mode: "1",
          key: function(){
            var settings = []
            for (var i = 0; i < 10; i++){
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

function updateContext(){
  let storage = browser.storage.local.get("pref");
  storage.then((storage) => {

    for (var i = 0; i<10; i++){
      if (storage.pref.key[i] !== ""){
        browser.contextMenus.update(
          "alt" + i,
          {
            title: "Bind to ALT-" + i + " (" + ((storage.pref.key[i].url) ? storage.pref.key[i].url : "...") + ")"
          }
        );
      } else {
        browser.contextMenus.update(
          "alt" + i,
          {
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

browser.contextMenus.create({
  id: "alt2",
  title: "",
  contexts: ["all"]
});

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

browser.storage.onChanged.addListener(function(){
  updateContext();
});
