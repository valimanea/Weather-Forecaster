// Change header colour
// $("header").css("background-color","#ffd9b3");

//Format input field an button
$("#search-input")
  .css({"width": "100%", "margin-top": 5, "margin-bottom": 5})
  .addClass('input-lg')
  .addClass('flex-fill');

$("#search-button")
.css({ "margin-top": 10, "margin-bottom": 10 })
.addClass('btn-primary')
.addClass('btn-block');

$('hr').css("border-width",2);

// Create a weather dashboard with form inputs.
// This is our API key
var APIKey = "0f3257cf00e8079a51b47a6783f5300f";
var queryURL1;
var queryURL2;
var searchList = [];

// Search button press event and actions
$("#search-button").click(function(event){
    event.preventDefault()
    var str = $("#search-input").val();
    
    if(str != ""){
    
    $("#search-input").val("");
    console.log(searchList);
    queryURL1 = "http://api.openweathermap.org/geo/1.0/direct?q=" + str + "£&limit=5&appid=" + APIKey;

    var lat;
    var lon;
    $.ajax({
        url: queryURL1,
        method: "GET"
      })
        // We store all of the retrieved data inside of an object called "response"
        .then(function(response) {

            if(Object.keys(response).length){
                searchList.push(str);
                writeToStorage(searchList);
                lat = response[0].lat;
          lon = response[0].lon;
          queryURL2 = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

          
          $.ajax({
            url: queryURL2,
            method: "GET"
          })
            // We store all of the retrieved data inside of an object called "response"
            .then(function(response) {
         
              console.log(response.cod);
              renderHistory();
              createHistButtons();
            });
         } 
        else{
            console.log("no data found");
        }
        });
    }

    else{
        return;
    }
        
      
});


// When a user searches for a city they are presented with current and future conditions for that city and that city is added to the search history.

// When a user views the current weather conditions for that city they are presented with:

// The city name

// The date

// An icon representation of weather conditions

// The temperature

// The humidity

// The wind speed

// When a user views future weather conditions for that city they are presented with a 5-day forecast that displays:

// The date

// An icon representation of weather conditions

// The temperature

// The humidity

// When a user clicks on a city in the search history they are again presented with current and future conditions for that city
function renderHistory(){
readFromStorage();
console.log(searchList);
}

function createHistButtons(){
    $("#history").empty();
    for(var i=0; i<searchList.length ;i++){
        var btn = $('<button>').text(searchList[i])
        .attr("id",searchList[i])
        .attr("class", "btn btn-secondary btn-block");
        $("#history").append(btn);
    }
}

// Write search result to storage
function writeToStorage(text){
    localStorage.setItem("search-history", JSON.stringify(text));
}

function readFromStorage (){
    var storedSearches = JSON.parse(localStorage.getItem("search-history"));
      if (storedSearches !== null) {
        searchList = storedSearches;
      }
}