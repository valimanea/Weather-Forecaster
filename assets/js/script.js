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

$("#forecast").css("padding-left", 15);

// Create variables
var APIKey = "0f3257cf00e8079a51b47a6783f5300f";
var queryURL1;
var queryURL2;
var searchList = [];
// var dateToday = moment().format("D/M/YYYY");
var searchDates = [];
var searchLocation;
var weatherData = {};
var days = [0, 1, 2, 3, 4, 5];
var info = ["date", "iconUrl", "temp", "windSpd", "humidity", "country"];
var obj = {};

for (var i of days) {
  for (var j of info) {
    obj[j] = {};
  }
  weatherData[i] = obj;
  obj = {};
}

weatherData[0].date = moment().format("D/M/YYYY");
// console.log(weatherData);

//Create list of dates to be searched into API response
for (var i = 0; i < 5; i++) {
  searchDates[i] = moment()
    .add([i + 1], "days")
    .format("YYYY-MM-DD 12:00:00")
    .toString();
  weatherData[i + 1].date = moment()
    .add([i + 1], "days")
    .format("D/M/YYYY");
}

// console.log(searchDates);

// Search button press event and actions
$("#search-button").click(function (event) {
  event.preventDefault();
  var str = $("#search-input").val();
  if (str != "") {
    $("#search-input").val("");
    createContent(str);
  } else {
    return;
  }
});

// $(".btn").on("click", function () {
//     var text = $(this);
//     console.log(text);
//   });

// When a user clicks on a city in the search history they are again presented with current and future conditions for that city
// Search history buttons function
function histBtn(element) {
  let text = element.innerText;
  //   console.log(text);
  createContent(text);
}

renderHistory();
createHistButtons();

// When a user searches for a city they are presented with current and future conditions for that city and that city is added to the search history.
function createContent(text) {
  queryURL1 =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    text +
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
        searchLocation = response[0].name;
        weatherData[0].country = response[0].country;
        var allDiff = 1;
        if (searchList.length != 0) {
          for (var i = 0; i < searchList.length; i++) {
            if (searchList[i] == searchLocation) {
              allDiff = 0;
            }
          }
          if (allDiff == 1) {
            searchList.unshift(searchLocation);
            searchList.length = Math.min(searchList.length, 6);
            // console.log(searchList);
            allDiff = 0;
          }
        } else {
          searchList.unshift(searchLocation);
        }

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
            // console.log(response);

            //add data for today to object
            weatherData[0].iconUrl = returnIconSrc(response.list[0]);
            weatherData[0].temp = (response.list[0].main.temp - 273.15).toFixed(
              2
            );
            weatherData[0].windSpd = response.list[0].wind.speed;
            weatherData[0].humidity = response.list[0].main.humidity;

            for (var i = 0; i < searchDates.length; i++) {
              for (var j = 0; j < response.list.length; j++) {
                if (response.list[j].dt_txt == searchDates[i]) {
                  weatherData[i + 1].iconUrl = returnIconSrc(response.list[j]);
                  weatherData[i + 1].temp = (
                    response.list[j].main.temp - 273.15
                  ).toFixed(2);
                  weatherData[i + 1].windSpd = response.list[j].wind.speed;
                  weatherData[i + 1].humidity = response.list[j].main.humidity;
                }
              }
            }

            renderHistory();
            createHistButtons();
            createNowEl();
            createForecastEl();
          });
      } else {
        console.log("no data found");
      }
    });
}

function renderHistory() {
  readFromStorage();
  //   console.log(searchList);
}

function createHistButtons() {
  $("#history").empty();
  for (var i = 0; i < searchList.length; i++) {
    var btn = $('<button onclick="histBtn(this)">')
      .text(searchList[i])
      .attr("class", "btn btn-secondary btn-block")
      .attr("id", "hist")
      .attr("data-letter", searchList[i]);
    $("#history").append(btn);
  }
}

// Write search result to storage
function writeToStorage(text) {
  localStorage.setItem("search-history", JSON.stringify(text));
}

// Read serach list from storage
function readFromStorage() {
  var storedSearches = JSON.parse(localStorage.getItem("search-history"));
  if (storedSearches !== null) {
    searchList = storedSearches;
  }
}

function returnIconSrc(listIndex) {
  var iconCode = listIndex.weather[0].icon;
  var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";
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
  icon.attr("src", weatherData[0].iconUrl);

  $("#today").append(
    $('<h3 id="location-now">').text(
      searchLocation +
        ", " +
        weatherData[0].country +
        " - " +
        weatherData[0].date +
        " "
    )
  );
  $("#location-now").append(icon);

  $("#today").append($("<p>").text("Temp: " + weatherData[0].temp + " °C"));
  $("#today").append(
    $("<p>").text("Wind speed: " + weatherData[0].windSpd + " km/h")
  );
  $("#today").append(
    $("<p>").text("Humidity: " + weatherData[0].humidity + "%")
  );
}

// When a user views future weather conditions for that city they are presented with a 5-day forecast that displays:
// The date
// An icon representation of weather conditions
// The temperature
// The humidity
function createForecastEl() {
  $("#forecast").empty();
  $("#forecast").append($("<h3>").text("5-Day Forecast:"));
  $("#forecast").append($('<div class="container-fluid" id="five-cols">'));
  $("#five-cols").append($('<div class="row" id="row">'));

  for (var i = 0; i < 5; i++) {
    var col = $("<div>").addClass("col").css("padding-left", 0);

    var card = $("<div>")
      .addClass("card card-block")
      .css({ "background-color": "#002080", color: "white", padding: 5 });

    card.append($('<h5 class="card-title">').text(weatherData[i + 1].date));
    card.append(
      $("<img>")
        .attr("src", weatherData[i + 1].iconUrl)
        .css({ "max-width": 50, height: "auto" })
    );
    card.append(
      $('<p class="card-text">')
        .css("margin-bottom", "5px")
        .text("Temp: " + weatherData[i + 1].temp + " °C")
    );
    card.append(
      $('<p class="card-text">')
        .css("margin-bottom", "5px")
        .text("Wind: " + weatherData[i + 1].windSpd + " km/h")
    );
    card.append(
      $('<p class="card-text">')
        .css("margin-bottom", "5px")
        .text("Humidity: " + weatherData[i + 1].humidity + "%")
    );

    col.append(card);
    $("#row").append(col);
  }
}
