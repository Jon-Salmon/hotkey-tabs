function pickTab(key){
    let pref = browser.storage.local.get("pref");
    pref.then((storage) => {
      var action = storage.pref.key[key].action;
      var tabUrl = storage.pref.key[key].url;
      if (action == 1){
      	var searchString = (tabUrl.substring(0,4) === "http") ? tabUrl.split('/')[2] : tabUrl.split('/')[0];
        searchString = "*://" + searchString + "/*";
      } else {
        var searchString = "*://" + tabUrl +"/";
      }
      var matchingTabs = browser.tabs.query({url: searchString});
      matchingTabs.then((tabs) => {
        if (tabs.length === 0){
          var newUrl = "https://" + storage.pref.key[key].url;
          browser.tabs.create({
            url: newUrl
          });
        } else {
          browser.tabs.update(tabs[0].id, {
            active: true
          });
          browser.windows.update(tabs[0].windowId, {
            focused: true
          });
        }
      });
    });
};

browser.commands.onCommand.addListener(function(command) {
  if (command == "changeTab") {
    pickTab(0);
  }
});

browser.notifications.onClicked.addListener(function(notificationId) {
  if (notificationId == "hotkeytabs_update"){
    browser.tabs.create({
      url:"http://addons.mozilla.org/en-GB/firefox/addon/hotkey-tabs/versions/"
    });
  };
});

browser.runtime.onInstalled.addListener(function(){
  var manifest = browser.runtime.getManifest();
  browser.notifications.create("hotkeytabs_update", {
    "type": "basic",
    "title": "Hotkey Tabs has been updated!",
    "message": "You are now running version V" + manifest.version + "\nClick here for release notes."
  });
});
