const { assert } = require(`chai`);

const replyBuilder = require(`../../utils/replyBuilder`);

let weatherObject; // placeholder for a test output from weather.js

describe(`the replyBuilder utility function`, () => {
  beforeEach(() => {
    weatherObject = {
      temperature: 2,
      minimumTemperature: -1,
      maximumTemperature: 4,
      humidity: 41,
      cloudiness: 21,
      heatIndex: 1,
      weather: `Clouds`,
      weatherDescription: `Scattered clouds`,
      timeOfForecast: 1485799200000,
      wind: {
        speed: 4,
        direction: 52,
      },
    };
  });

  it(`should reply with an introduction if called with no arguments`, () => {
    const string = replyBuilder();

    const expectedString = `Hello! As my name implies, I'm a bot that delivers weather information. Type "!weather help" to see what I can do for you.`;

    assert.strictEqual(expectedString, string);
  });

  it(`should reply with a help message with "help" as the first argument`, () => {
    const firstArgument = `help`;

    const string = replyBuilder(firstArgument);
    const expectedString = `To use, provide "!weather forecast (location)" (without the parentheses).
You can provide optional flags to change the output:
--imperial for imperial units on temperature and wind speed,
--snow to display snow volume (only if it's snowing),
--rain to display rain volume (only if it's raining),
--humidity to display humidity,
--temp_min_max to display minimum and maximum temperature of forecast,
--wind to display wind speed and direction,
--cloud to display cloudiness, in percentage,
--(number) looks up future forecasts in 3h increment relative to current (ex. --1 would give the 3-6pm forecast if current time is 1pm), must be between 1 and 39 (inclusive)`;

    assert.strictEqual(expectedString, string);
  });

  it(`should reply asking for location if the first argument is "forecast" but no location was provided`, () => {
    const firstArgument = `forecast`;

    const location = ``;

    const string = replyBuilder(firstArgument, location);

    const expectedString = `Did you want me to provide you a forecast of a location? Type "!weather forecast (location) (without the parentheses) to do so!`;

    assert.strictEqual(expectedString, string);
  });

  it(`should reply with weather information if the first argument is "forecast" and 2 other arguments are provided for location and weather data`, () => {
    const firstArgument = `forecast`;

    const location = `Stockholm`;

    const units = `metric`;

    const timezone = `Europe/Stockholm`;

    const string = replyBuilder(firstArgument, location, weatherObject, units, timezone);

    const expectedString = `The weather in Stockholm is ${weatherObject.weatherDescription} with a temperature of ${
      weatherObject.temperature
    } degrees Celsius, and feels like ${
      weatherObject.heatIndex
    } degrees Celsius. This forecast is intended from now until ${new Date(
      weatherObject.timeOfForecast,
    ).toLocaleString(`en-US`, { timezone })} (Local time).`;
    assert.strictEqual(expectedString, string);
  });

  it(`should reply with future weather information, with the appropriate timestamp.`, () => {
    const firstArgument = `forecast`;

    const location = `Stockholm`;

    const units = `metric`;

    const timezone = `Europe/Stockholm`;

    weatherObject.future = 2;

    const string = replyBuilder(firstArgument, location, weatherObject, units, timezone);

    const expectedString = `The weather in Stockholm is ${weatherObject.weatherDescription} with a temperature of ${
      weatherObject.temperature
    } degrees Celsius, and feels like ${
      weatherObject.heatIndex
    } degrees Celsius. This forecast is intended from ${new Date(
      weatherObject.timeOfForecast - 1000 * 60 * 60 * 3,
    ).toLocaleString(`en-US`, { timezone })} until ${new Date(weatherObject.timeOfForecast).toLocaleString(`en-US`, {
      timezone,
    })} (Local time).`;

    assert.strictEqual(expectedString, string);
  });

  it(`should optionally display extra weather information depending on the fifth argument`, () => {
    const firstArgument = `forecast`;

    const location = `Stockholm`;

    const units = `metric`;

    const displayIncluding = [`--cloud`, `--wind`];

    const timezone = `Europe/Stockholm`;

    const string = replyBuilder(firstArgument, location, weatherObject, units, timezone, displayIncluding);

    const expectedString = `The weather in Stockholm is ${weatherObject.weatherDescription} with a temperature of ${
      weatherObject.temperature
    } degrees Celsius, and feels like ${weatherObject.heatIndex} degrees Celsius. The sky's cloudiness is ${
      weatherObject.cloudiness
    } percent. The wind speed is ${
      weatherObject.wind.speed
    } m/s NE. This forecast is intended from now until ${new Date(weatherObject.timeOfForecast).toLocaleString(
      `en-US`,
      { timezone },
    )} (Local time).`;

    assert.strictEqual(expectedString, string);
  });

  it(`should reply with a suggestion to use the help command if the first argument is neither "help" nor "forecast"`, () => {
    const firstArgument = `word`;

    const string = replyBuilder(firstArgument);
    const expectedString = `Sorry, this bot doesn't understand your command, try typing "!weather help" to learn how to communicate with me!`;

    assert.strictEqual(expectedString, string);
  });

  it(`should reply with a "location not found" message if location cannot be found in the geocoding API`, () => {
    const firstArgument = `forecast`;
    const locationData = {};

    const string = replyBuilder(firstArgument, locationData);
    const expectedString = `Sorry, this bot cannot find the location you have provided. Please try again.`;

    assert.strictEqual(expectedString, string);
  });

  it(`should reply with an error message if either geocoding or weather API is down`, () => {
    const firstArgument = `forecast`;
    const positiveLocationData = `Stockholm`;
    const negativeLocationData = null;
    const weatherData = null;

    const firstResult = replyBuilder(firstArgument, negativeLocationData);
    const secondResult = replyBuilder(firstArgument, positiveLocationData, weatherData);

    const expectedString = `Sorry, my sources are down. Can you try again later?`;

    assert.strictEqual(expectedString, firstResult);
    assert.strictEqual(expectedString, secondResult);
  });
});
