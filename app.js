// TODO - Rewrite queries and determine what fields we want. We'll need an initial query to get a match (No need to check for error-no match bc already taken care of)
// We then pull the staff ID and name from that and make another query using the ID to get the anime we need.
// We probably only want to look for main roles, I'm not sure how to make the query do that for us; worst case we might have to just do it ourselves.
// We'd also need to deduplicate the array (only if the characters are the same - in case they voice multiple main characters for some reason.)

// TODO - Write the code to effectively build the page. I'm thinking 10 shows should be enough. In reference to above, the stuff we'd probably need is:
// Character picture, character name, link to character (hyperlink it in name and picture), show name, link to show (hyperlink it in name)

// TODO - figure out when to refresh/clear previous results on a new search. 
// Maybe create an "anchor" point that the images come from then just go along and delete the elements whenever we get a request?

function seiyuuSearch() {

    seiyuuName = document.getElementById("name").value;
    console.log(seiyuuName);

    

    var query = `
    query ($search: String) { # Define which variables will be used in the query (id)
    Media (search: $search, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        id
        title {
        romaji
        english
        native
        }
        tags {
            name
        }
    }
    }
    `;

    // Define our query variables and values that will be used in the query request
    var variables = {
        search: "Kuma Kuma Kuma"
    };

    // Define the config we'll need for our Api request
    var url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };


    // Make the HTTP Api request
    fetch(url, options).then(handleResponse)
                    .then(handleData)
                    .catch(handleError);
    
    
    if (Math.random() < 0.5) {
        var anchor = document.getElementById("initial");
    anchor.appendChild(document.createElement("p").appendChild(document.createTextNode("LESS")));
    }
    else {
        var anchor = document.getElementById("initial");
        anchor.appendChild(document.createElement("p").appendChild(document.createTextNode("MORE")));
    }

    return true;
}

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    console.log(JSON.stringify(data, null, 2));
}

function handleError(error) {
    alert('Error, check console (Not found)');
    console.error(error);
}
