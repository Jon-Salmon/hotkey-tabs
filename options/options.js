function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    pref: {
      mode: document.querySelector("#mode").value,
      key: function() {
        var settings = []
        for (var i = 0; i < 10; i++) {
          settings.push({
            action: document.querySelector("#a" + i).value,
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
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("pref");
  getting.then(setPref, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);

var input = document.querySelectorAll('.input');
for (var i = 0; i < input.length; i++) {
  input[i].addEventListener('change', saveOptions);
}
