chrome.tabs.query({ url: '*://teams.microsoft.com/*' }, function(tabs) {
  if(tabs.length){
     chrome.tabs.executeScript(tabs[0].id, {
        code: `document.querySelector('body').style.filter = 'invert(100%)'`
     });
  }
});
