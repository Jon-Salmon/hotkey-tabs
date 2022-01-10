# Hotkey Tabs

This is the source code for a firefox addon that allows for the quick switching and loading of commonly used website and webpages with Alt-number keyboard shortcuts. If the specified website or webpage is open, then firefox will switch to that tab, else it will open the site in a new tab.

### Build instructions:
Use the gulp.js file to process the source slim files into html and output the application into the ./build directory.
Load the addon into Firefox using the [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) tool.

### Addon usage instructions:
1. Go to the options page for "Hotkey Tabs" in the about:addons page
2. You can then specify the url of the website you wish each hotkey (Alt-0 to Alt-9) to switch to either by specifying explicitly in this screen, or by navigating to the site and using the right click context option
3. The exact action for each hotkey can be specified in the about:addons screen
   * Switch/Open site: Switches or opens the specified site. If any open page is part of the specified site, then it will be switched to, else the root of the site will be opened.
    * Switch/Open page: Switches or opens the specified page. Firefox will change tab only if the exact page url is already opened, else it will open that page.
    * RegEx Matching: Decides whether a tab matches or not by a specified regular expression pattern.
