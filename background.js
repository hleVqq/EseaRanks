chrome.webNavigation.onHistoryStateUpdated.addListener(function({tabId})
{
    setTimeout(() => chrome.tabs.sendMessage(tabId, {action: 'urlChanged'}));

    return true;
});