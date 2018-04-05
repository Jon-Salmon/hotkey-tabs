function saveOptions(e) {
  e.preventDefault();

  for (var i = 0; i < 10; i++) {
    if (document.querySelector("#a" + i).value === "3") {
      document.getElementById("rb" + i).className = "";
    } else {
      document.getElementById("rb" + i).className = "hidden";
    }
  }

  browser.storage.local.set({
    pref: {
      mode: document.querySelector("#mode").value,
      key: function() {
        var settings = []
        for (var i = 0; i < 10; i++) {
          settings.push({
            action: document.querySelector("#a" + i).value,
            regex: document.querySelector("#r" + i).value,
            url: document.querySelector("#s" + i).value
          });
        }
        return settings;
      }()
    }
  });
};

function restoreOptions() {

  function setPref(result) {
    document.querySelector("#mode").value = result.pref.mode || "0";
    for (var i = 0; i < 10; i++) {
      document.querySelector("#a" + i).value = result.pref.key[i].action || "1";
      document.querySelector("#s" + i).value = result.pref.key[i].url || "";
      document.querySelector("#r" + i).value = result.pref.key[i].regex || "";

      if (result.pref.key[i].action === "3") {
        document.getElementById("rb" + i).className = "";
      } else {
        document.getElementById("rb" + i).className = "hidden";
      }
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("pref");
  getting.then(setPref, onError);
}

function renderHotkeyUpdate() {
  let commands = browser.commands.getAll();
  commands.then((commands) => {
    var el = document.getElementsByClassName('hotkeyDisplay');
    for (var i = 0; i < el.length; i++) {
      el[i].innerText = commands[i].shortcut;
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  restoreOptions();
  renderHotkeyUpdate();
});

var input = document.querySelectorAll('.input');
for (var i = 0; i < input.length; i++) {
  input[i].addEventListener('change', saveOptions);
}

if (ShortcutCustomizeUI.available) {
  // Addes shortcut changer
  ShortcutCustomizeUI.build(
    { showDescriptions: false }
  ).then(list => {
    list.addEventListener('ShortcutChanged', event => {
      browser.extension.getBackgroundPage().updateContext(); // update context menu
      renderHotkeyUpdate();
    });
    var nodes = document.getElementsByClassName('shortcuts');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].appendChild(list.firstChild);
    }
  });

} else {
  // Hide shortcut changer if not supported
  var el = document.getElementsByClassName('ff60');
  for (var i = 0; i < el.length; i++) {
    el[i].className += ' hidden';
  }
}
