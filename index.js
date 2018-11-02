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
        <label for="recipe-term" class="inline">Enter an ingredient or category (i.e. "chicken"): </label>
        <input type="text" name="recipe-term" id="js-recipe-query" required>

        <label for="max-term">Enter the maximum number of results shown: </label>
        <input type="number" name="max-term" id="js-max-recipes" value="10">
        
        <button type="submit">Go!</button>
    </form>
    <p class="js-error-message"></p>
    <ul class="js-recipe-results"></ul>
    <button type="button" class="js-return-start">Return to start page</button>`);
    $('.js-recipe-search').on('submit', function(event) {
        event.preventDefault();
        const recQuery = $('#js-recipe-query').val();
        const maxRecipes = $('#js-max-recipes').val();
        const params = {
            q: recQuery,
            // DON'T FORGET TO CHANGE THIS BEFORE COMMITTING
            app_id: "INSERT EDAMAM APP ID HERE",
            app_key: "INSERT EDAMAM API KEY HERE",
            to: maxRecipes
        };
        getRecipes(baseRecUrl, params);
    });
    backToStart();
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
function getRestaurants(cityId, baseRestUrl, maxRestaurants) {
    const params = {
        entity_id: cityId,
        entity_type: 'city',
        count: maxRestaurants
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
function displayCities(responseJson, baseRestUrl, maxRestaurants) {
    console.log(responseJson);
    $('.js-rest-error-message').empty();
    $('.js-rest-results').empty();
    $('.js-cities').empty();
    if (responseJson.location_suggestions.length === 0) {
        $('.js-cities').append(`<p>Sorry, no cities matching that name were found.  You can try again with a different city.</p>`);
    }
    else {
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
            getRestaurants(cityId, baseRestUrl, maxRestaurants);
        });
    }
}

// Gets a list of cities from Zomato API for user to choose from based on what they enter, calls displayCities
function getCityOptions(baseRestUrl, params, maxRestaurants) {
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
    .then(responseJson => displayCities(responseJson, baseRestUrl, maxRestaurants))
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
        <label for="city" class="inline">City: </label>
        <input type="text" name="city" id="js-rest-query">  
        
        <label for="max-restaurants">Enter the maximum number of restaurants shown: </label>
        <input type="number" name="max-restaurants" id="js-max-rest" value="10">
        
        <button type="submit">Go!</button>
    </form>
    <p class="js-rest-error-message"></p>
    <form class="js-cities"></form>
    <ul class="js-rest-results"></ul>
    <button type="button" class="js-return-start">Return to start page</button>`);
    $('.js-rest-search').on('submit', function(event) {
        event.preventDefault();
        const restQuery = $('#js-rest-query').val();
        const params = {
            q: restQuery
        };
        const maxRestaurants = $('#js-max-rest').val();
        getCityOptions(baseRestUrl, params, maxRestaurants);
    });
    backToStart();
}

// Returns to start form
function backToStart() {
    $('.js-return-start').on('click', function(event) {
        event.preventDefault();
        $('.container').empty();
        $('.container').append(`<h2>Find cooking inspiration or explore local restaurants.</h2>
        <form class="js-opening-form">
            <button type="button" class="submit js-recipe">Find recipes</button>
            <button type="button" class="submit js-rest">Find restaurants near me</button>
        </form>`);
        watchStartForm();
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