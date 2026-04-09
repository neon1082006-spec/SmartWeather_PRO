const apiKey = "29394c09ca7541dd9b22ebf540c6c566";
let map;
let marker;
document.getElementById("city").addEventListener("change", getWeather);

function updateTime() {
  let now = new Date();
  document.getElementById("time").innerHTML =
    now.toLocaleString("vi-VN");
}
setInterval(updateTime, 1000);
function initMap(lat, lon) {
  map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([lon, lat]),
      zoom: 6
    })
  });

  addMarker(lat, lon);
}
function addMarker(lat, lon) {
  if (marker) {
    map.removeLayer(marker);
  }

  marker = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: new ol.geom.Point(
            ol.proj.fromLonLat([lon, lat])
          )
        })
      ]
    })
  });

  map.addLayer(marker);
}
async function getWeather() {
  let value = document.getElementById("city").value;
  let result = document.getElementById("result");

  if (!value) return;

  let [lat, lon] = value.split(",");

  let urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`;
  let urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`;

  try {
    let res1 = await fetch(urlCurrent);
    let data = await res1.json();

    let icon = data.weather[0].icon;

    result.innerHTML = `
      <div class="weather-box">
        <h2>${data.name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png">
        <div class="temp">${Math.round(data.main.temp)}°C</div>
        <p>${data.weather[0].description}</p>
        <p>💧 ${data.main.humidity}% | 🌬️ ${data.wind.speed} m/s</p>
      </div>
    `;

    changeBackground(data.weather[0].main);

    // forecast
    let res2 = await fetch(urlForecast);
    let forecastData = await res2.json();

    let forecastHTML = "";
    for (let i = 0; i < 5; i++) {
      let item = forecastData.list[i * 8]; // mỗi ngày 1 mốc

      forecastHTML += `
        <div class="forecast-item">
          <p>${new Date(item.dt_txt).toLocaleDateString("vi-VN")}</p>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
          <p>${Math.round(item.main.temp)}°C</p>
        </div>
      `;
    }

    document.getElementById("forecast").innerHTML = forecastHTML;

  } catch (err) {
    result.innerHTML = "Lỗi API!";
  }
  if (!map) {
  initMap(lat, lon);
} else {
  map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
  addMarker(lat, lon);
}
}
function loadCities() {
  let select = document.getElementById("city");

  select.innerHTML = `<option value="">-- Chọn tỉnh --</option>`;

  cities.forEach(c => {
    let option = document.createElement("option");
    option.value = `${c.lat},${c.lon}`;
    option.textContent = c.name;
    select.appendChild(option);
  });
}

loadCities();
function changeBackground(weather) {
  if (weather === "Clear") {
    document.body.style.background = "linear-gradient(#fceabb, #f8b500)";
  } else if (weather === "Rain") {
    document.body.style.background = "linear-gradient(#4e54c8, #8f94fb)";
  } else if (weather === "Clouds") {
    document.body.style.background = "linear-gradient(#bdc3c7, #2c3e50)";
  } else {
    document.body.style.background = "linear-gradient(#1d2b64, #f8cdda)";
  }
}