chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{  
    sendResponse(true);
    waitForData();

    return true;
});

waitForData();

function waitForData()
{
    if (!location.href.includes('play.esea.net/match/'))
        return;

    new MutationObserver(function(_, observer)
    {
        if (!document.querySelector('table'))
            return;
        
        observer.disconnect();
        displayRanks();
    })
    .observe(document.querySelector('#root'), {childList: true, subtree: true});
}

function displayRanks()
{
    const nodes = document.querySelectorAll('tbody a.TextLink');

    for (let i = 0; i < nodes.length; i++)
    {
        const node = nodes[i];

        if (node.href.includes('play.esea.net/users'))
            fetchRank(node);
    }
}

async function fetchRank(node)
{
    const name = node.innerText;
    const url = node.href.replace('/users', '/api/users') + '/profile';
    const response = await fetch(url);

    if (!response.ok)
        throw new Error(`Failed to fetch ${name}'s rank`);
    
    const json = await response.json();
    const rank = json.data.rank.current ? json.data.rank.current.rank : '?';

    node.innerText = `(${rank}) ${name}`;
}