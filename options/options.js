function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    pref: {
      key:
      [
        {
          action: document.querySelector("#a1").value,
          url: document.querySelector("#s1").value
        }
      ]
    }
  });
}

function restoreOptions() {

  function setPref(result) {
    document.querySelector("#a1").value = result.pref.key[0].action || "";
    document.querySelector("#s1").value = result.pref.key[0].url || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("pref");
  getting.then(setPref, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);

var input = document.querySelectorAll('.input');
for(var i=0;i<input.length;i++){
  input[i].addEventListener('change',saveOptions);
}
