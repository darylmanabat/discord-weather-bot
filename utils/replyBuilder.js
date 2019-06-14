const windDegreesConverter = require(`./windDegreesConverter`);

module.exports = (task = null, location, weather, units, displayOptions = []) => {
  const helpMessage = `To use, provide "!weather forecast (location)" (without the parentheses).
You can provide optional flags to change the output:
--imperial for imperial units on temperature and wind speed,
--snow to display snow volume (only if it's snowing),
--rain to display rain volume (only if it's raining),
--humidity to display humidity,
--temp_min_max to display minimum and maximum temperature of forecast,
--wind to display wind speed and direction,
--cloud to display cloudiness, in percentage,
--(number) looks up future forecasts in 3h increment relative to current (ex. --1 would give the 3-6pm forecast if current time is 1pm), must be between 1 and 39 (inclusive)`;

  const correctionMessage = `Sorry, this bot doesn't understand your command, try typing "!weather help" to learn how to communicate with me!`;

  const noLocationMessage = `Did you want me to provide you a forecast of a location? Type "!weather forecast (location) (without the parentheses) to do so!`;

  const introductionMessage = `Hello! As my name implies, I'm a bot that delivers weather information. Type "!weather help" to see what I can do for you.`;

  const locationNotFoundMessage = `Sorry, this bot cannot find the location you have provided. Please try again.`;

  const errorMessage = `Sorry, my sources are down. Can you try again later?`;

  if (task === `forecast` && location === ``) return noLocationMessage;
  if (task === `forecast` && (location === null || weather === null)) return errorMessage;
  if (task === `forecast` && Object.keys(location).length === 0) return locationNotFoundMessage;
  if (task === `forecast` && location.length > 1) {
    let forecastMessage = `The weather in ${location} is `;
    if (units === `metric`) {
      forecastMessage += `${weather.weatherDescription} with a temperature of ${weather.temperature} degrees Celsius, and feels like ${weather.heatIndex} degrees Celsius.`;
    } else if (units === `imperial`) {
      forecastMessage += `${weather.weatherDescription} with a temperature of ${weather.temperature} degrees Fahrenheit, and feels like ${weather.heatIndex} degrees Fahrenheit.`;
    }
    if (displayOptions.includes(`--humidity`)) {
      forecastMessage += ` The humidity is at ${weather.humidity} percent.`;
    }
    if (units === `metric` && displayOptions.includes(`--temp_min_max`)) {
      forecastMessage += ` The minimum temperature expected is ${weather.minimumTemperature} degrees Celsius, and the maximum temperature expected is ${weather.minimumTemperature} degrees Celsius.`;
    }
    if (units === `imperial` && displayOptions.includes(`--temp_min_max`)) {
      forecastMessage += ` The minimum temperature expected is ${weather.minimumTemperature} degrees Fahrenheit, and the maximum temperature expected is ${weather.minimumTemperature} degrees Fahrenheit.`;
    }
    if (displayOptions.includes(`--cloud`)) {
      forecastMessage += ` The sky's cloudiness is ${weather.cloudiness} percent.`;
    }
    if (units === `metric` && displayOptions.includes(`--wind`)) {
      forecastMessage += ` The wind speed is ${weather.wind.speed} m/s ${windDegreesConverter(
        weather.wind.direction,
      )}.`;
    }
    if (units === `imperial` && displayOptions.includes(`--wind`)) {
      forecastMessage += ` The wind speed is ${weather.wind.speed} mph ${windDegreesConverter(
        weather.wind.direction,
      )}.`;
    }
    if (weather.weather === `Rain` && weather.rainVolume) {
      forecastMessage += ` The rain volume is expected to be ${weather.rainVolume}mm.`;
    }
    if (weather.weather === `Snow` && weather.snowVolume) {
      forecastMessage += ` The snow volume is expected to be ${weather.snowVolume}mm.`;
    }
    if (weather.future >= 1) {
      forecastMessage += `This forecast is intended from PLACEHOLDER until PLACEHOLDER .`;
    } else {
      forecastMessage += ` This forecast is intended from now until PLACEHOLDER.`;
    }
    return forecastMessage;
  }
  if (task === `help`) return helpMessage;
  if (task === null) return introductionMessage;

  return correctionMessage;
};
