// Change header colour
// $("header").css("background-color","#ffd9b3");

//Format page elements
$("#search-input")
  .css({ width: "100%", "margin-top": 5, "margin-bottom": 5 })
  .addClass("input-lg")
  .addClass("flex-fill");

$("#search-button")
  .css({ "margin-top": 10, "margin-bottom": 10 })
  .addClass("btn-primary")
  .addClass("btn-block");

$("hr").css("border-width", 2);

$("#today")
  .css("height", 180)
  .css("padding-left", 10)
  .addClass("border border-dark");

// Create a weather dashboard with form inputs.
var APIKey = "0f3257cf00e8079a51b47a6783f5300f";
var queryURL1;
var queryURL2;
var searchList = [];
var dateToday = moment().format("D/M/YYYY");
var locationNow;
var iconUrlNow;
var tempNow;
var windSpdNow;
var humidityNow;

// Search button press event and actions
$("#search-button").click(function (event) {
  event.preventDefault();
  var str = $("#search-input").val();

  if (str != "") {
    $("#search-input").val("");
    console.log(searchList);

    queryURL1 =
      "http://api.openweathermap.org/geo/1.0/direct?q=" +
      str +
      "£&limit=5&appid=" +
      APIKey;

    var lat;
    var lon;
    $.ajax({
      url: queryURL1,
      method: "GET",
    })
      // We store all of the retrieved data inside of an object called "response"
      .then(function (response) {
        if (Object.keys(response).length) {
          locationNow = response[0].name;
          searchList.push(locationNow);
          writeToStorage(searchList);
          lat = response[0].lat;
          lon = response[0].lon;
          queryURL2 =
            "https://api.openweathermap.org/data/2.5/forecast?lat=" +
            lat +
            "&lon=" +
            lon +
            "&appid=" +
            APIKey;

          $.ajax({
            url: queryURL2,
            method: "GET",
          })
            // We store all of the retrieved data inside of an object called "response"
            .then(function (response) {
                console.log(response);
                var tempC = response.list[0].main.temp - 273.15;
              iconcodeNow = response.list[0].weather[0].icon;
                windSpdNow = response.list[0].wind.speed;
                tempNow = tempC.toFixed(2);
                humidityNow = response.list[0].main.humidity;

                console.log(windSpdNow, tempNow, humidityNow);
              renderHistory();
              createHistButtons();
              iconUrlNow = returnIconSrc(response);

              createNowEl();
            });
        } else {
          console.log("no data found");
        }
      });
  } else {
    return;
  }
});

// When a user searches for a city they are presented with current and future conditions for that city and that city is added to the search history.



// When a user views future weather conditions for that city they are presented with a 5-day forecast that displays:

// The date

// An icon representation of weather conditions

// The temperature

// The humidity

// When a user clicks on a city in the search history they are again presented with current and future conditions for that city
function renderHistory() {
  readFromStorage();
  console.log(searchList);
}

function createHistButtons() {
  $("#history").empty();
  for (var i = 0; i < searchList.length; i++) {
    var btn = $("<button>")
      .text(searchList[i])
      .attr("id", searchList[i])
      .attr("class", "btn btn-secondary btn-block");
    $("#history").append(btn);
  }
}

// Write search result to storage
function writeToStorage(text) {
  localStorage.setItem("search-history", JSON.stringify(text));
}

function readFromStorage() {
  var storedSearches = JSON.parse(localStorage.getItem("search-history"));
  if (storedSearches !== null) {
    searchList = storedSearches;
  }
}

function returnIconSrc(response) {
  var iconCode = response.list[0].weather[0].icon;
  var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
  return iconUrl;
}

// When a user views the current weather conditions for that city they are presented with:
// The city name
// The date
// An icon representation of weather conditions
// The temperature
// The humidity
// The wind speed
function createNowEl() {
  $("#today").empty();

  var icon = $('<img id="wicon" src="" alt="Weather icon">');
  icon.attr("src", iconUrlNow);

  $("#today").append($('<h3 id="location-now">').text(locationNow + " " + dateToday + " "));
  $("#location-now").append(icon);

  $("#today").append($('<p>').text("Temp: " + tempNow + " °C"));
  $("#today").append($('<p>').text("Wind speed: " + windSpdNow + " km/h"));
  $("#today").append($('<p>').text("Humidity: " + humidityNow + "%"));

}
