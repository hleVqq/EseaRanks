//console.log('ESEA Ranks');
onMessage();
chrome.extension.onMessage.addListener(onMessage);

function onMessage()
{
    if (!location.href.includes('/match/'))
    {
        //console.log('[ESEA Ranks] Non-match URL, ignoring...');
        return;
    }

    //console.log('[ESEA Ranks] Match URL, fetching ranks...');

    new MutationObserver(function(_, observer)
    {
        if (!document.querySelector('table'))
            return;
        
        observer.disconnect();
        displayRanks();
    })
    .observe(document.querySelector('#root'), {childList: true, subtree: true});

    return true;
}

function displayRanks()
{
    modifyTables();

    const nodes = document.querySelectorAll('tbody a.TextLink');

    for (let i = 0; i < nodes.length; i++)
    {
        const node = nodes[i];

        if (node.href.includes('/users/'))
            fetchRank(node);
    }
}

function modifyTables()
{
    const killThs = document.querySelectorAll('thead tr:last-child th:nth-child(2)');

    for (let i = 0; i < killThs.length; i++)
    {
        const th = killThs[i];

        const rTh = th.cloneNode();
        rTh.innerText = 'R';
        th.parentNode.insertBefore(rTh, th);

        const mmrTh = th.cloneNode();
        mmrTh.innerText = 'MMR';
        th.parentNode.insertBefore(mmrTh, th);
    }

    const allTbodies  = document.querySelectorAll('tbody');
    const tbodies = [allTbodies[0], allTbodies[2]];

    for (let i = 0; i < tbodies.length; i++)
    {
        const tbody = tbodies[i];
        tbody.classList.add('esea-ranks-tbody');
    }
    
    const killTds = document.querySelectorAll('.esea-ranks-tbody tr td:nth-child(2)');

    for (let i = 0; i < killTds.length; i++)
    {
        const td = killTds[i];

        const rTd = td.cloneNode();
        rTd.innerText = 'N/A';
        td.parentNode.insertBefore(rTd, td);

        const mmrTd = td.cloneNode();
        mmrTd.innerText = 'N/A';
        td.parentNode.insertBefore(mmrTd, td);
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