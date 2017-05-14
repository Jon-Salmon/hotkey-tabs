document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  let pref = browser.storage.local.get("pref");
  pref.then((storage) => {

    if (event.getModifierState(storage.pref.modifier)) {
      if (!isNaN(keyName)) {
        event.preventDefault();
        browser.runtime.sendMessage({
          key: keyName
        });
      }
    }
  });
}, false);
