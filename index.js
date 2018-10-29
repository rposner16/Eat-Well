'use strict'

// Format query paramters so they work in a url
function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${[encodeURIComponent(key)]}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

// Display recipes on the page based on user query
function displayRecipes(responseJson) {
    console.log(responseJson);
    $('.js-error-message').empty();
    $('.js-recipe-results').empty();
    for (let i = 0; i < responseJson.hits.length; i++) {
        $('.js-recipe-results').append(`<li><a href="${responseJson.hits[i].recipe.url}">${responseJson.hits[i].recipe.label}</a></li>`);
    }
}

// Get recipe list from Edamam API based on user query, calls displayRecipes if successful
function getRecipes(baseRecUrl, params) {
    let queryString = formatQueryParams(params);
    queryString = baseRecUrl + "?" + queryString;
    console.log(queryString);
    fetch(queryString)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayRecipes(responseJson))
    .catch(err => {
        $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

// Displays search bar for recipes on the page, calls getRecipes
function renderRecipeSearch(baseRecUrl) {
    // Clearing start form
    $('.container').empty();
    $('.container').append(`<h2>Find recipes: </h2>
    <form class="js-recipe-search">
        <p class="inline">Enter an ingredient or category (i.e. "chicken"): </p>
        <input type="text" id="js-recipe-query">  
        <button type="submit">Go!</button>
    </form>
    <p class="js-error-message"></p>
    <ul class="js-recipe-results">
    </ul>`);
    $('.js-recipe-search').on('submit', function(event) {
        event.preventDefault();
        const recQuery = $('#js-recipe-query').val();
        const params = {
            q: recQuery,
            // DON'T FORGET TO CHANGE THIS BEFORE COMMITTING
            app_id: "INSERT EDAMAM API ID HERE",
            app_key: "INSERT EDAMAM API KEY HERE"
        };
        getRecipes(baseRecUrl, params);
    });
}

// Displays list of links to restaurants based on user's city
function displayRestaurants(responseJson) {
    $('.js-rest-error-message').empty();
    $('.js-rest-results').empty();
    $('.js-cities').empty();
    $('.js-rest-results').append(`<p>Restaurants in your city: </p>`);
    for (let i = 0; i < responseJson.restaurants.length; i++) {
        $('.js-rest-results').append(`<li><a href="${responseJson.restaurants[i].restaurant.url}">${responseJson.restaurants[i].restaurant.name}</a></li>`);
    }
}

// Gets a list of restaurants in the user's city from the Zomato API, calls displayRestaurants if successful 
function getRestaurants(cityId, baseRestUrl) {
    const params = {
        entity_id: cityId,
        entity_type: 'city'
    };
    let queryString = formatQueryParams(params);
    queryString = baseRestUrl + 'search?' + queryString;
    console.log(queryString);
    const init = {
        method: 'GET',
        headers: {
            // DON'T FORGET TO CHANGE THIS BEFORE COMMITTING
            'user-key': 'INSERT ZOMATO API KEY HERE'
        }
    };
    fetch(queryString, init)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayRestaurants(responseJson))
    .catch(err => {
        $('.js-rest-error-message').text(`Something went wrong: ${err.message}`);
    });
}

// Displays a list of cities for the user to choose from, calls getRestaurants after getting user input
function displayCities(responseJson, baseRestUrl) {
    console.log(responseJson);
    $('.js-rest-error-message').empty();
    $('.js-rest-results').empty();
    $('.js-cities').empty();
    $('.js-cities').append(`<fieldset class="js-city-options">
        <legend>Choose your city from the list: </legend>
    </fieldset>`);
    for (let i = 0; i < responseJson.location_suggestions.length; i++) {
        $('.js-city-options').append(`<input type="radio" value="${responseJson.location_suggestions[i].id}" name="city" id="city" required>
        <label for="city">${responseJson.location_suggestions[i].name}</label>
        <br>`);
    }
    $('.js-cities').append(`<button type="submit" class="submit-city">Submit</button>`);
    $('.js-cities').on('submit', function(event) {
        event.preventDefault();
        const selectedCity = $('input:checked');
        const cityId = selectedCity.val();
        getRestaurants(cityId, baseRestUrl);
    });
}

// Gets a list of cities from Zomato API for user to choose from based on what they enter, calls displayCities
function getCityOptions(baseRestUrl, params) {
    let queryString = formatQueryParams(params);
    queryString = baseRestUrl + "cities?" + queryString;
    console.log(queryString);
    const init = {
        method: 'GET',
        headers: {
            // DON'T FORGET TO CHANGE THIS BEFORE COMMITTING
            'user-key': 'INSERT ZOMATO API KEY HERE'
        }
    };
    fetch(queryString, init)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayCities(responseJson, baseRestUrl))
    .catch(err => {
        $('.js-rest-error-message').text(`Something went wrong: ${err.message}`);
    });
}

// Displays initial city search bar on the page, calls getCityOptions
function renderRestaurantSearch(baseRestUrl) {
    // Clearing start form
    $('.container').empty();
    $('.container').append(`<h2>Find restaurants: </h2>
    <form class="js-rest-search">
        <p class="inline">City: </p>
        <input type="text" id="js-rest-query">  
        <button type="submit">Go!</button>
    </form>
    <p class="js-rest-error-message"></p>
    <form class="js-cities"></form>
    <ul class="js-rest-results">
    </ul>`);
    $('.js-rest-search').on('submit', function(event) {
        event.preventDefault();
        const restQuery = $('#js-rest-query').val();
        const params = {
            q: restQuery
        };
        getCityOptions(baseRestUrl, params);
    });
}

// Watches the start page and calls either renderRecipeSearch or renderRestaurantSearch based on user input
function watchStartForm() {
    $('.js-recipe').on('click', function(event) {
        event.preventDefault();
        const baseRecUrl = "https://api.edamam.com/search";
        renderRecipeSearch(baseRecUrl);
    });
    $('.js-rest').on('click', function(event) {
        event.preventDefault();
        const baseRestUrl = "https://developers.zomato.com/api/v2.1/";
        renderRestaurantSearch(baseRestUrl);
    });
}

watchStartForm();