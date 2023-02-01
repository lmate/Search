const parser = new DOMParser();

// When loading document
function onload() {
    setTimeout(() => {
        document.getElementById('circle').style.display = 'none';
    }, 3000)
}

//
// Starting search on enter
//

// Stores the text entered in the searchbar
var input;

function go(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        // Setting input varible to the entered text
        input = document.getElementById('input').value;
        // If a domain is entered, go to the site, instead of searching
        if (input.slice(-4) == '.com' || input.slice(-3) == '.hu') {
            url = 'http://' + input;
            window.open(url, '_blank').focus();
        }
        // If not, do the search
        else {
            var web_search_container = document.getElementById("web_search_container");

            // Reset the page when new search
            web_search_container.innerHTML = '';
            window.scrollTo(0, 0);
            document.getElementById('web_search_container').style.top = '100vh';

            // Show loading indicator until stopped, when fetch is done
            var loadingstate = 0;
            document.getElementById('input').blur();
            var loadinginterval = setInterval(function () {
                switch (loadingstate) {
                    case 0:
                        document.getElementById('input').value = input + ' .  ';
                        loadingstate = 1;
                        break;
                    case 1:
                        document.getElementById('input').value = input + '  . ';
                        loadingstate = 2;
                        break;
                    case 2:
                        document.getElementById('input').value = input + '   .';
                        loadingstate = 0;
                        break;
                }
            }, 200);

            // Do the search
            async function search_the_web(search_term) {
                // Try to fetch search data, error in case there is no internet, or downtime at DDG
                try {
                    // Get the html from DDG
                    let response = await fetch('https://api.allorigins.win/raw?url=https://html.duckduckgo.com/html/?q=' + search_term + '&kl=wt-wt', { signal: AbortSignal.timeout(7000) });
                    let result = await response.text();
                    // Recieved as string, convert it to DOM
                    var fulldocument = parser.parseFromString(result, 'text/html');
                }
                // No internet or downtime at DDG
                catch (err) {
                    // Add error message to search result container
                    web_search_container.innerHTML = "<p class='result_title'>There was a problem with your search, try the following:</p>"
                        + "<ul class='error_msg_body'><li>Check your internet connection</li><li>Refresh the page</li><li>Try again later</li></ul>";

                    // Stop showing the loading indicator
                    clearInterval(loadinginterval);
                    document.getElementById('input').value = input;
                    document.getElementById('input').focus();

                    // Start transition to results view, so error message can be shown
                    start_transition();
                    exit();
                }

                // Try to get the results from the fetched document, error in case there is no result
                try {
                    // Iterate through all the search results
                    for (i = 0; i < fulldocument.getElementsByClassName('result results_links results_links_deep web-result').length; i++) {
                        // Load the components from the fetched DOM to varables
                        var result_title = fulldocument.getElementsByClassName('result results_links results_links_deep web-result')[i].getElementsByClassName('links_main links_deep result__body')[0].getElementsByClassName('result__title')[0].getElementsByClassName('result__a')[0].innerHTML;
                        var result_link = decodeURIComponent(fulldocument.getElementsByClassName('result results_links results_links_deep web-result')[i].getElementsByClassName('links_main links_deep result__body')[0].getElementsByClassName('result__title')[0].getElementsByClassName('result__a')[0].href.split('%3A%2F%2F')[1].split('&rut=')[0]);
                        var result_icon_link = 'https://s2.googleusercontent.com/s2/favicons?domain=' + result_link;
                        var result_snippet = fulldocument.getElementsByClassName('result results_links results_links_deep web-result')[i].getElementsByClassName('links_main links_deep result__body')[0].getElementsByClassName('result__snippet')[0].innerHTML;

                        // Create element in the container with the variables
                        web_search_container.innerHTML += "<div class='result_container' onclick='open_result(\"" + result_link + "\")'>"
                            + "<img class='result_icon' src='" + result_icon_link + "'>"
                            + "<p class='result_title'>" + result_title + "</p>"
                            + "<p class='result_link'>" + result_link + "</p>"
                            + "<p class='result_snippet'>" + result_snippet + "</p>"
                            + "</div>";

                        // Everything is loaded start the transition to results view
                        start_transition();
                    }
                    // Add in bottom bar
                    web_search_container.innerHTML += "<div id='bottom-bar'>Search results provided by DuckDuckGo</div>";

                    // Stop showing the loading indicator
                    clearInterval(loadinginterval);
                    document.getElementById('input').value = input;
                    document.getElementById('input').focus();

                    // Simulate input change to trigger showing the inpage math solver, and hiding the overlay one (of course its not going to show if there is no math problem)
                    input_change();
                }
                // In case there is no web search result
                catch (err) {
                    // Wait a little so it seems like we looked longer, even tho we know there is no result
                    setTimeout(function () {
                        // Add error message to search result container
                        web_search_container.innerHTML = "<p class='result_title'>No results found for your search, try the following:</p>"
                            + "<ul class='error_msg_body'><li>Try to rephrase your input</li><li>Try to summerize your input</li><li>Try to remove conjunctions from your input</li></ul>";

                        // Stop showing the loading indicator
                        clearInterval(loadinginterval);
                        document.getElementById('input').value = input;
                        document.getElementById('input').focus();

                        // Start transition to results view, so error message can be shown
                        start_transition();
                    }, 3000);
                }
            }
            // Run the whole searching
            search_the_web(input);
            // Run the wikifind search too
            wiki_find(input);
        }
    }
}

//
// Watch changes in the input to trigger immediate action
//
function input_change() {
    instant_math();
}

// Start the transition to results view when everything is loaded
function start_transition() {
    document.getElementById('icon').style.width = '3.5vw';
    document.getElementById('icon').style.marginLeft = '3vw';
    document.getElementById('icon').style.marginTop = '1.5vw';

    document.getElementById('input').style.marginTop = '2vw';
    document.getElementById('input').style.marginLeft = '15vw';
    document.getElementById('input').style.width = '75vw';
    document.getElementById('input').style.textAlign = 'left';
    document.getElementById('input').style.fontSize = '4vh';

    document.getElementById('web_search_container').style.top = '15vh';

    document.getElementById('body').style.overflowY = 'overlay';
}

// Go to mail when clicked
function gomail(e) {
    url = 'https://mail.google.com/mail/u/0/#inbox';
    window.open(url, '_blank').focus();
}

// Open the clicked results
function open_result(link) {
    url = '//' + link;
    window.open(url, '_blank').focus();
}