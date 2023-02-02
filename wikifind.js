// Find relevant wikipedia result to put on screen

var sent_back_to_wikifind_counter = 0;

async function wiki_find(search_term) {
    // Try searching in wikipedias built-in search
    try {
        // Fetch wiki built in search with the search term (only ask for one result)
        let wikifind_response = await fetch('https://en.wikipedia.org/w/api.php?action=query&list=search&prop=pageimages&utf8=&format=json&origin=*&srlimit=1&srsearch=' + search_term, { signal: AbortSignal.timeout(10000) });
        let wikifind_result = await wikifind_response.json();

        // If no results are returned, wiki cant find matching
        if (wikifind_result.query.search.length < 1) {
            // Continue to DDG search
            throw 0;
        }

        // Load the data into variables
        var wikifind_title = wikifind_result.query.search[0].title;
        var wikifind_snippet = wikifind_result.query.search[0].snippet;
        var wikifind_img = '';

        // Try to fetch tumbnail, if there is none, this match is probably not an article
        try {
            // Fetch the thumbnail for the found wiki article
            let wikifind_response_img = await fetch('https://en.wikipedia.org/w/api.php?action=query&titles=' + wikifind_title + '&prop=pageimages&format=json&origin=*&pithumbsize=500', { signal: AbortSignal.timeout(10000) });
            let wikifind_result_img = await wikifind_response_img.json();

            // And save the link to a variable
            var wikifind_img = wikifind_result_img.query.pages[wikifind_result.query.search[0].pageid].thumbnail.source;
        }
        catch (err) {
            // Cant find thumbnail
            wikifind_img = '';
        }


        // Check if found result-s title matches with the original search term (it is a good above an 80% match)
        if (org_turbocommons.StringUtils.compareSimilarityPercent(search_term.toLowerCase(), wikifind_title.toLowerCase()) < 80) {
            // If not matching continue to DDG search
            throw 0;
        }
        // If matching, time to show the article on the home screen
        else {
            // Check if thumbnail is found, if not, this match is probably not an article
            if (wikifind_img != '') {
                // Reset the sent back counter
                sent_back_to_wikifind_counter = 0;

                console.log(wikifind_title);
                console.log(wikifind_snippet);
                console.log(wikifind_img);
            }
            // This match is probably not an article
            else {
                // Did not find a matching wiki article, for this search term
            }
        }

    }
    // In case wiki built in search did not find an article or found one, but not a match, continue to DDG search
    catch (err) {
        try {
            // Fetch a DDG search with the original search term, and inclued that we are only interested in results from wikipedia.org
            let response = await fetch('https://api.allorigins.win/raw?url=https://html.duckduckgo.com/html/?q=' + search_term + ' site:wikipedia.org', { signal: AbortSignal.timeout(10000) });
            let result = await response.text();
            var fulldocument = parser.parseFromString(result, 'text/html');

            // Get the link of the first result, and only use the title of the article
            var wikifind_aftererror_title = decodeURIComponent(fulldocument.getElementsByClassName('result results_links results_links_deep web-result')[0].getElementsByClassName('links_main links_deep result__body')[0].getElementsByClassName('result__title')[0].getElementsByClassName('result__a')[0].href.split('%3A%2F%2F')[1].split('&rut=')[0]).split('/')[2].replaceAll('_', ' ');

            // Check if the first results title matches with the original search term (good above 80%)
            if (org_turbocommons.StringUtils.compareSimilarityPercent(search_term.toLowerCase(), wikifind_aftererror_title.toLowerCase()) > 80) {
                // If yes, call the wiki_find function again with the newly found matching title (not because we are searching, we already know that the title is a good match,
                // only to let wiki search with the built in search, and collect the final data)

                // Check the times we sent it back already, to avoide an infinite loop
                if (sent_back_to_wikifind_counter < 2) {
                    sent_back_to_wikifind_counter++;

                    wiki_find(wikifind_aftererror_title);
                }
                else {
                    throw 0;
                }
            }
            // If no match continue and exit
            else {
                throw 0;
            }
        }
        catch (err) {
            // Did not find a matching wiki article, for this search term

            // Reset the sent back counter
            sent_back_to_wikifind_counter = 0;
        }
    }
}