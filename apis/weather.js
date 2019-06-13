const axios = require(`axios`);

const capitalizeFirstLetter = require(`../utils/capitalizeFirstLetter`);

module.exports = async (lat, lon, units = `metric`, futureForecastCountIn3hIncrements = 0) => {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: { lat, lon, appid: `YOUR_API_KEY`, units },
    });

    const currentForecast = response.data.list[futureForecastCountIn3hIncrements];
    return {
      temperature: currentForecast.main.temp,
      minimumTemperature: currentForecast.main.temp_min,
      maximumTemperature: currentForecast.main.temp_max,
      humidity: currentForecast.main.humidity,
      cloudiness: currentForecast.clouds.all,
      heatIndex: currentForecast.main.feels_like,
      weather: currentForecast.weather[0].main,
      weatherDescription: capitalizeFirstLetter(currentForecast.weather[0].description),
      timeOfForecast: currentForecast.dt * 1000,
      wind: {
        speed: currentForecast.wind.speed,
        direction: currentForecast.wind.deg,
      },
      rainVolume: currentForecast.rain[`3h`],
      snowVolume: currentForecast.snow[`3h`],
    };
  } catch (error) {
    return null;
  }
};
