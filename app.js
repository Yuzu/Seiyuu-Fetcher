// TODO - Rewrite queries and determine what fields we want. We'll need an initial query to get a match (No need to check for error-no match bc already taken care of)
// We then pull the staff ID and name from that and make another query using the ID to get the anime we need.
// We probably only want to look for main roles, I'm not sure how to make the query do that for us; worst case we might have to just do it ourselves.
// We'd also need to deduplicate the array (only if the characters are the same - in case they voice multiple main characters for some reason.)

// TODO - Write the code to effectively build the page. I'm thinking 10 shows should be enough. In reference to above, the stuff we'd probably need is:
// Character picture, character name, link to character (hyperlink it in name and picture), show name, link to show (hyperlink it in name)

// TODO - figure out when to refresh/clear previous results on a new search. 
// Maybe create an "anchor" point that the images come from then just go along and delete the elements whenever we get a request?

function seiyuuSearch() {

    let seiyuuName = document.getElementById("name").value;
    //console.log(seiyuuName);

    let staffQuery = `
        query {
            Staff (search: "${seiyuuName}") {
                id
                name {
                    full
                    native
                }
                image {
                    large
                }
                characterMedia (page: 1 sort: POPULARITY_DESC perPage:25) {
                    pageInfo {
                        total
                        perPage
                        currentPage
                        lastPage
                        hasNextPage
                      }
                      edges  {
                        characterRole
                        node {
                          coverImage {
                            extraLarge
                          }
                          title {
                            english
                            native
                          }
                        }
                        characters {
                          name {
                            full
                            native
                          }
                          image {
                            large
                          }
                        }
                      }
                    }
                  }
                }
    `;

    //console.log(staffQuery)
    
    // Taken from https://anilist.gitbook.io/anilist-apiv2-docs/overview/graphql/getting-started
    // Define the config we'll need for our Api request
    let url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: staffQuery,
            })
        };

    
    fetch(url, options)
            .then(status)
            .then(json)
            .then(function(data) {
                console.log('Request succeeded with JSON response', data);
                console.log(JSON.stringify(data, null, 2));
                return data;
            })
            .then(buildPage)
            .catch(function(error) {
                alert("Error, person not found.");
                console.log('Request failed', error);
             })
            ;

    
    return true;

    
    /*
    if (Math.random() < 0.5) {
        var anchor = document.getElementById("initial");
    anchor.appendChild(document.createElement("p").appendChild(document.createTextNode("LESS")));
    }
    else {
        var anchor = document.getElementById("initial");
        anchor.appendChild(document.createElement("p").appendChild(document.createTextNode("MORE")));
    }
    */

    //let staffID = staffData.value.data.staff.id;
    //console.log(staffID);
    //console.log(staffData);
}


// Excerpt taken from https://developers.google.com/web/updates/2015/03/introduction-to-fetch
function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
  }

// Excerpt taken from https://developers.google.com/web/updates/2015/03/introduction-to-fetch
function json(response) {
    return response.json()
}

  
function buildPage(data) {
    
}