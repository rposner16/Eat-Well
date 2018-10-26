'use strict'

function renderRecipeSearch() {
    // Clearing start form
    $('.container').empty();
    $('.container').append(`<h2>Find recipes: </h2>
    <form>
        <p class="inline">Enter an ingredient or category (i.e. "chicken"): </p>
        <input type="text">  
        <button type="submit">Go!</button>
    </form>`);
}

function renderRestaurantSearch() {
    // Clearing start form
    $('.container').empty();
    $('.container').append(`<h2>Find restaurants: </h2>
    <form>
        <p class="inline">City: </p>
        <input type="text">  
        <button type="submit">Go!</button>
    </form>`);
}

function watchStartForm() {
    $('.js-opening-form').on('click', '.js-recipe', function(event) {
        event.preventDefault();
        renderRecipeSearch();
    });
    $('.js-rest').on('click', function(event) {
        event.preventDefault();
        renderRestaurantSearch();
    });
}

watchStartForm();