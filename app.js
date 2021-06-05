//const fetch = require('node-fetch');

// Here we define our query as a multi-line string
// Storing it in a separate .graphql/.gql file is also possible
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
        isGeneralSpoiler
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

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    console.log(JSON.stringify(data, null, 2));
}

function handleError(error) {
    alert('Error, check console');
    console.error(error);
}