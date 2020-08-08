onMessage();
chrome.extension.onMessage.addListener(onMessage);

function onMessage()
{
    if (!location.href.includes('/match/'))
        return;

    hookDomChanges();

    return true;
}

function hookDomChanges()
{
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
    modifyTables();
    fetchRanks();
}

function modifyTables()
{
    modifyGroupings();
    modifyHeaders();
    modifyBodies();
}

function modifyGroupings()
{
    const basicHeaders = document.querySelectorAll('.groupings > th:nth-child(2)');

    for (let i = 0; i < basicHeaders.length; i++)
    {
        const basicHeader = basicHeaders[i];

        const rankHeader = basicHeader.cloneNode();
        rankHeader.innerText = 'Rank';
        rankHeader.setAttribute('colspan', 2);
        basicHeader.parentNode.insertBefore(rankHeader, basicHeader);
    }
}

function modifyHeaders()
{
    const killHeaders = document.querySelectorAll('thead tr:last-child th:nth-child(2)');

    for (let i = 0; i < killHeaders.length; i++)
    {
        const killHeader = killHeaders[i];

        const rankHeader = killHeader.cloneNode();
        rankHeader.innerText = 'R';
        killHeader.parentNode.insertBefore(rankHeader, killHeader);

        const mmrHeader = killHeader.nextSibling.cloneNode();
        mmrHeader.innerText = 'MMR';
        killHeader.parentNode.insertBefore(mmrHeader, killHeader);
    }
}

function modifyBodies()
{
    const allBodies  = document.querySelectorAll('tbody');
    let bodies = [];
    
    switch (allBodies.length)
    {
        case 3: bodies = [allBodies[0], allBodies[2]]; break;
        case 4: bodies = [allBodies[2], allBodies[3]]; break;

        default: bodies = allBodies; break;
    }

    for (let i = 0; i < bodies.length; i++)
    {
        const tbody = bodies[i];
        tbody.classList.add('esea-ranks-tbody');
    }
    
    const killDatas = document.querySelectorAll('.Block .esea-ranks-tbody tr td:nth-child(2)');

    for (let i = 0; i < killDatas.length; i++)
    {
        const killData = killDatas[i];

        const rankData = killData.cloneNode();
        rankData.innerText = 'N/A';
        killData.parentNode.insertBefore(rankData, killData);

        const mmrData = killData.nextSibling.cloneNode();
        mmrData.innerText = 'N/A';
        killData.parentNode.insertBefore(mmrData, killData);
    }
}

function fetchRanks()
{
    const playerLinkNodes = document.querySelectorAll('tbody a.TextLink');

    for (let i = 0; i < playerLinkNodes.length; i++)
    {
        const node = playerLinkNodes[i];

        if (node.href.includes('/users/'))
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

    if (json.data.rank.current)
    {
        const rank = json.data.rank.current.rank;
        const mmr = json.data.rank.current.mmr;

        const td = node.parentNode.parentNode.parentNode;
        const rTd = td.nextSibling;
        const mmrTd = rTd.nextSibling;
        rTd.innerText = rank;
        mmrTd.innerText = mmr; 
    }
}