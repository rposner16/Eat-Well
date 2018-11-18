'use strict'


// Format query parameters so they work in a url
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
        if (i%2 === 0) {
            $('.js-recipe-results').append(`<div class="row js-${i}">
            </div>`);
            $(`.js-${i}`).append(`<div class="col-6">
                <img src="${responseJson.hits[i].recipe.image}" alt="${responseJson.hits[i].recipe.label}">
                <a class="link" href="${responseJson.hits[i].recipe.url}">${responseJson.hits[i].recipe.label}</a>
             </div>`);
        }
        else {
           $(`.js-${i - 1}`).append(`<div class="col-6">
                <img src="${responseJson.hits[i].recipe.image}" alt="${responseJson.hits[i].recipe.label}">
                <a class="link" href="${responseJson.hits[i].recipe.url}">${responseJson.hits[i].recipe.label}</a>
            </div>`) 
        }
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
    $('.container').append(`
    <form class="js-recipe-search">
        <div class="row">
            <div class="col-12">
                <h2 class="search-text">Find recipes: </h2>
            </div>
        </div>
        <div class="search-container row">
            <label for="recipe-term" class="inline search-text">Enter an ingredient or category (i.e. "chicken"): </label>
            <input type="text" name="recipe-term" id="js-recipe-query" required>
        </div>
        <div class="search-container row">
            <label for="max-term" class="search-text">Enter the maximum number of results shown: </label>
            <input type="number" name="max-term" id="js-max-recipes" value="10">
        </div>
        
        <div class="row">
            <button type="submit" class="small submit">Go!</button>
        </div>
    </form>
    <p class="js-error-message search-text"></p>
    <div class="js-recipe-results search-text"></div>`);
    $('.js-recipe-search').on('submit', function(event) {
        event.preventDefault();
        const recQuery = $('#js-recipe-query').val();
        const maxRecipes = $('#js-max-recipes').val();
        const params = {
            q: recQuery,
            // DON'T FORGET TO CHANGE THIS BEFORE COMMITTING
            app_id: edamamAppId,
            app_key: edamamAppKey,
            to: maxRecipes
        };
        getRecipes(baseRecUrl, params);
    });
    backToStart();
}

// Displays list of links to restaurants based on user's city
function displayRestaurants(responseJson) {
    console.log(responseJson);
    $('.js-rest-error-message').empty();
    $('.js-rest-results').empty();
    $('.js-cities').empty();
    $('.js-rest-results').append(`<p class="rest-result-intro">Restaurants in your city: </p>`);
    for (let i = 0; i < responseJson.restaurants.length; i++) {
        let imgString = "";
        if (responseJson.restaurants[i].restaurant.featured_image != "") {
            imgString = `src="${responseJson.restaurants[i].restaurant.featured_image}" alt="Image of ${responseJson.restaurants[i].restaurant.name}"`; 
        }
        else {
            imgString = 'src="https://us.123rf.com/450wm/chepko/chepko1204/chepko120400052/13117273-silverware.jpg?ver=6" alt="Closeup of a fork and spoon."';
        }
        if (i%2 === 0) {
            $('.js-rest-results').append(`<div class="row js-rest-${i}"></div>`);
            $(`.js-rest-${i}`).append(`<div class="col-6">
                <div class="rest-img-container">
                    <img class="rest-img" ${imgString}>
                </div>
                <a class="link" href="${responseJson.restaurants[i].restaurant.url}">${responseJson.restaurants[i].restaurant.name}</a>
                <p>Cuisine: ${responseJson.restaurants[i].restaurant.cuisines} • Neighborhood: ${responseJson.restaurants[i].restaurant.location.locality} • Rating: ${responseJson.restaurants[i].restaurant.user_rating.rating_text}</p>
            </div>`);
        }
        else {
            $(`.js-rest-${i - 1}`).append(`<div class="col-6">
                <div class="rest-img-container">
                    <img class="rest-img" ${imgString}>
                </div>
                <a class="link" href="${responseJson.restaurants[i].restaurant.url}">${responseJson.restaurants[i].restaurant.name}</a>
                <p>Cuisine: ${responseJson.restaurants[i].restaurant.cuisines} • Neighborhood: ${responseJson.restaurants[i].restaurant.location.locality} • Rating: ${responseJson.restaurants[i].restaurant.user_rating.rating_text}</p>
            </div>`);
        }
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
            'user-key': zomatoUserKey
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
    $('.js-cities').removeClass('hidden');
    if (responseJson.location_suggestions.length === 0) {
        $('.js-cities').append(`<p class="search-text">Sorry, no cities matching that name were found.  You can try again with a different city.</p>`);
    }
    else {
        $('.js-cities').append(`<fieldset class="js-city-options">
        <legend class="search-text">Choose your city from the list: </legend>
        </fieldset>`);
        for (let i = 0; i < responseJson.location_suggestions.length; i++) {
            if (i%2 === 0) {
                console.log('here');
                $('.js-city-options').append(`<div class="row js-city-${i}">
                </div>`);
                $(`.js-city-${i}`).append(`<div class="col-6 city-option">
                    <input type="radio" value="${responseJson.location_suggestions[i].id}" name="city" id="city" required>
                    <label for="city" class="search-text">${responseJson.location_suggestions[i].name}</label>
                </div>`);
            }
            else {
                $(`.js-city-${i - 1}`).append(`<div class="col-6 city-option">
                    <input type="radio" value="${responseJson.location_suggestions[i].id}" name="city" id="city" required>
                    <label for="city" class="search-text">${responseJson.location_suggestions[i].name}</label>
                </div>`)
            }
        }
        $('.js-cities').append(`<button type="submit" class="small submit">Submit</button>`);
        $('.js-cities').on('submit', function(event) {
            event.preventDefault();
            const selectedCity = $('input:checked');
            const cityId = selectedCity.val();
            $('.js-cities').addClass('hidden');
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
            'user-key': zomatoUserKey
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
    $('.container').append(`
    <form class="js-rest-search">
        <div class="row">
            <h2 class="search-text col-12">Find restaurants: </h2>
        </div>
        <div class="search-container row">
            <label for="city" class="inline search-text">City: </label>
            <input type="text" name="city" id="js-rest-query">  
        </div>
        <div class="search-container row">
            <label for="max-restaurants" class="search-text">Enter the maximum number of restaurants shown: </label>
            <input type="number" name="max-restaurants" id="js-max-rest" value="10">
        </div>
        
        <div class="row">
            <button type="submit" class="small submit">Go!</button>
        </div>
    </form>
    <p class="js-rest-error-message search-text"></p>
    <form class="js-cities search-text hidden"></form>
    <div class="js-rest-results search-text"></div>`);
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
        $('.container').append(`<div class="row">
            <div class="col-12">
                <h2 class="start-text">Find cooking inspiration or explore local restaurants.</h2>
            </div>
        </div>
        <div class="row">
            <form class="js-opening-form">
                <button type="button" class="large col-6 submit js-recipe">Find recipes</button>

                <button type="button" class="large col-6 submit js-rest">Find restaurants near me</button>
            </form>
        </div>`);
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