// TODO - Rewrite queries and determine what fields we want. We'll need an initial query to get a match (No need to check for error-no match bc already taken care of)
// We then pull the staff ID and name from that and make another query using the ID to get the anime we need.
// We probably only want to look for main roles, I'm not sure how to make the query do that for us; worst case we might have to just do it ourselves.
// We'd also need to deduplicate the array (only if the characters are the same - in case they voice multiple main characters for some reason.)

// TODO - Write the code to effectively build the page. I'm thinking 10 shows should be enough. In reference to above, the stuff we'd probably need is:
// Character picture, character name, link to character (hyperlink it in name and picture), show name, link to show (hyperlink it in name)

// TODO - figure out when to refresh/clear previous results on a new search. 
// Maybe create an "anchor" point that the images come from then just go along and delete the elements whenever we get a request?

// TODO - figure out how to dedupe and only get main roles without paging too much.
// Every time we page, we have to dedupe.
// Keep track of the roles we want to display in an array.
// Maybe just take first page (max 25 per page) -> filter for only main roles -> if first page has 10 main roles, we're fine. just add all 10 to the array.
// else we have to keep a running sum of the total main roles and keep paging (ie making a new request) and adding to the array until we hit 10 main roles.
// If we ever run out of main roles, we just go back to the beginning and down the supporting roles.
// If even after this we're out of roles, we just show what we have.

function seiyuuSearch() {

    let seiyuuName = document.getElementById("name").value;
    //console.log(seiyuuName);

    // 2 pages should be fine for our purposes.

    // TODO - The issue with my original approach was that the results of a fetch were only retrievable in the then() scope of each fetch. The issue there
    // was that with multiple fetch calls (ie multiple pages), we wouldn't be able to keep track of everything properly. Maybe I'll learn a better way of doing
    // this in the future.
    let staffQuery_1 = produceQuery(seiyuuName, 1);
    
    let staffQuery_2 = produceQuery(seiyuuName, 2);

    //console.log(staffQuery)
    
    // Taken from https://anilist.gitbook.io/anilist-apiv2-docs/overview/graphql/getting-started
    // Define the config we'll need for our Api request
    let url_1 = 'https://graphql.anilist.co',
        options_1 = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: staffQuery_1,
            })
        };

    
    let url_2 = 'https://graphql.anilist.co',
        options_2 = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: staffQuery_2,
            })
        };

    requests = [[url_1, options_1], [url_2, options_2]];
    Promise.all(requests.map(u=>fetch(u[0], u[1])))
    .then(status)
    .then(responses =>
        Promise.all(responses.map(res => res.json()))
    )
    .then(json => {
        console.log('Request succeeded with JSON response', json);
        //console.log(JSON.stringify(json[0], null, 2));
        //console.log(JSON.stringify(json[1], null, 2));
        console.log(json);
        return json;
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
// Edited to properly use promises.all by me.
function status(response) {
    //console.log(response);
    for (let i = 0; i < response.length; i++) {
        if (response[i].status >= 200 && response[i].status < 300) {
            //return Promise.resolve(response)
            continue;
        }
        else {
            return Promise.reject(new Error(response[i].statusText));
          }
    }
    return Promise.resolve(response);
  }

// Clean up the page.
function teardown() {
    console.log("Cleaning up");
}

function buildPage(data) {
    console.log(data);

    let info = data[0].data.Staff;

    let name = info.name.full;
    let nativeName = info.name.native;
    let seiyuuPic = info.image;

    const roles = [];

    // search for main roles.
    for (let i = 0; i < data.length; i++) {
        if (roles.length == 10) {
            break;
        }
        let shows = data[i].data.Staff.characterMedia.edges;
        populateArray(roles, shows, main=true);
    }

    // search for supporting roles
    for (let i = 0; i < data.length; i++) {
        if (roles.length == 10) {
            break;
        }
        let shows = data[i].data.Staff.characterMedia.edges;
        populateArray(roles, shows, main=false, supporting=true);
    }

    for (let i = 0; i < data.length; i++) {
        if (roles.length == 10) {
            break;
        }
        let shows = data[i].data.Staff.characterMedia.edges;
        populateArray(roles, shows, main=false, supporting=false);
    }

    // else we're ready to build the page.
    console.log(roles);
    console.log('FINAL ROLES', roles.length);
    for (let i = 0; i < roles.length; i++) {
        console.log(roles[i].node.title.romaji, "-> ", roles[i].characters[0].name.full, "(", roles[i].characterRole, ")");
    }
}

// roles = current running list of roles
// shows = shows to add to array
function populateArray(roles, shows, main=true, supporting=false) {
    console.log("shows:", shows);
    console.log("roles:", roles);
    console.log('ORIGINAL', shows.length);
    for (let i = 0; i < shows.length; i++) {
        console.log(shows[i].node.title.romaji, " -> ", shows[i].characters[0].name.full);
    }

    let shows_deduped = [];
    let obj = {};
    for (let i = 0; i < shows.length; i++) {
        let characterName = shows[i].characters[0].name.full;

        // If we have the same character, we don't want to overwrite the name since this dupe has a lower popularity.
        // IE: attack on titan s1 is (probably) more popular than s2. If we have the same character that means that we've hit s2,
        // but we don't want to replace s1 with s2 since s1 is more popular so we just continue.
        if (obj[characterName] != undefined) {
            continue;
        }
        // There's a chance that this could be the non-first page. we need to make sure that we don't add a character that's already added from another page.
        else {
            let dupe = false;
            for (let j = 0; j < roles.length; j++) {
                if (roles[j].characters[0].name.full === characterName) {
                    dupe = true;
                    break;
                }
            }
            if (dupe) {
                continue;
            }
        }
        obj[characterName] = shows[i];
    }

    for (i in obj) {
        shows_deduped.push(obj[i]);
    }

    console.log('DEDUPED', shows_deduped.length);
    for (let i = 0; i < shows_deduped.length; i++) {
        console.log(shows_deduped[i].node.title.romaji, "-> ", shows_deduped[i].characters[0].name.full);
    }

    // Now we want to extract the roles and populate the given array.
    for (let i = 0; i < shows_deduped.length; i++) {
        if (roles.length == 10) {
            break;
        }

        if (main && !supporting) {
            console.log("Populating with main");
            if (shows_deduped[i].characterRole === "MAIN") {
                roles.push(shows_deduped[i]);
            }
        }
        else if (!main && supporting) {
            // if main == false && supporting=true, that means we're only considering supporting roles here.
            console.log("Populating with supporting");
            if (shows_deduped[i].characterRole === "SUPPORTING") {
                roles.push(shows_deduped[i]);
            }
        }
        else {
            console.log("Populating with background");
            if (shows_deduped[i].characterRole === "BACKGROUND") {
                roles.push(shows_deduped[i]);
            }
        }
    }

    console.log('ROLES after populateArray', roles.length);
    for (let i = 0; i < roles.length; i++) {
        console.log(roles[i].node.title.romaji, "-> ", roles[i].characters[0].name.full);
    }
}

function produceQuery(seiyuuName, pageNum) {
    return `
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
            characterMedia (page: ${pageNum} sort: POPULARITY_DESC perPage:25) {
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
                        romaji
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
}