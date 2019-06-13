const axios = require(`axios`);
const MockAdapter = require(`axios-mock-adapter`); // for mocking axios
const { assert } = require(`chai`);

const weatherAPI = require(`../../apis/weather`);
const capitalizeFirstLetter = require(`../../utils/capitalizeFirstLetter`); // utility function

const API_KEY = require(`../../config`).WEATHER_API_KEY;

let mock; // declare variables for scoping
let lat;
let lon;
let returnedMockResult;

describe(`Weather API`, () => {
  before(() => {
    mock = new MockAdapter(axios); // mock our axios for testing
    lat = 50.0874654;
    lon = 14.4212535;
  });

  beforeEach(() => {
    mock.reset(); // cleanup any mock handlers before the next test

    returnedMockResult = {
      cod: 200,
      list: [
        {
          dt: 0,
          main: { temp: 0, feels_like: 0, temp_min: 0, temp_max: 0, humidity: 0 },
          weather: [{ description: ``, main: `Clear` }],
          clouds: { all: 0 },
          wind: { speed: 0, deg: 0 },
          rain: { '3h': 0 },
          snow: { '3h': 0 },
        },
        {
          dt: 0,
          main: { temp: 0, feels_like: 0, temp_min: 0, temp_max: 0, humidity: 0 },
          weather: [{ description: ``, main: `Clear` }],
          clouds: { all: 0 },
          wind: { speed: 0, deg: 0 },
          rain: { '3h': 0 },
          snow: { '3h': 0 },
        },
        {
          dt: 0,
          main: { temp: 0, feels_like: 0, temp_min: 0, temp_max: 0, humidity: 0 },
          weather: [{ description: ``, main: `Clear` }],
          clouds: { all: 0 },
          wind: { speed: 0, deg: 0 },
          rain: { '3h': 0 },
          snow: { '3h': 0 },
        },
      ],
    }; // setup what the mocked API returns on each call
  });

  afterEach(() => {
    mock.reset(); // cleanup any mock handlers before the next test
  });

  after(() => {
    mock.restore(); // restore axios after this test block is done
  });

  it(`should return temperature`, async () => {
    const temperature = 2; // value to test
    returnedMockResult.list[0].main.temp = temperature; // modify our setup object for this test
    mock // defined behavior when axios is given this specific url and parameters
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultTemperature = object.temperature;
    assert.strictEqual(resultTemperature, temperature);
  });

  it(`should return the heat index`, async () => {
    const heatIndex = 4;
    returnedMockResult.list[0].main.feels_like = heatIndex;
    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultHeatIndex = object.heatIndex;
    assert.strictEqual(resultHeatIndex, heatIndex);
  });

  it(`should return a description of the weather`, async () => {
    const description = `very sunny`;
    returnedMockResult.list[0].weather[0].description = description;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultDescription = object.weatherDescription;
    assert.strictEqual(capitalizeFirstLetter(description), resultDescription);
  });

  it(`should display the duration of the weather forecast`, async () => {
    const time = 1695051200;

    returnedMockResult.list[0].dt = time;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultTime = object.timeOfForecast;
    assert.strictEqual(time * 1000, resultTime);
  });

  it(`should give wind and wind speed for a forecast`, async () => {
    const windSpeed = 4;
    const windDirection = 92;

    returnedMockResult.list[0].wind.speed = windSpeed;
    returnedMockResult.list[0].wind.deg = windDirection;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultWindSpeed = object.wind.speed;
    const resultWindDirection = object.wind.direction;

    assert.strictEqual(windSpeed, resultWindSpeed);
    assert.strictEqual(windDirection, resultWindDirection);
  });

  it(`should optionally take a unit metric, then change results according to metric given`, async () => {
    const temperatureInCelsius = 2;

    const temperatureInFahrenheit = (temperatureInCelsius * 9) / 5 + 32;

    returnedMockResult.list[0].main.temp = temperatureInFahrenheit;
    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `imperial` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon, `imperial`);
    const resultTemperatureInFahrenheit = object.temperature;
    assert.strictEqual(
      temperatureInCelsius,
      Math.round((((resultTemperatureInFahrenheit - 32) * 5) / 9) * 10 ** 3) / 10 ** 3,
    ); // remove extra numbers after 3 decimal digits
  });

  it(`should give the minimum and maximum temperature of a given forecast`, async () => {
    const minimumTemperature = 1;
    const maximumTemperature = 5;

    returnedMockResult.list[0].main.temp_min = minimumTemperature;
    returnedMockResult.list[0].main.temp_max = maximumTemperature;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultMinimumTemperature = object.minimumTemperature;
    const resultMaximumTemperature = object.maximumTemperature;

    assert.strictEqual(minimumTemperature, resultMinimumTemperature);
    assert.strictEqual(maximumTemperature, resultMaximumTemperature);
  });

  it(`should give the humidity of a given forecast`, async () => {
    const humidity = 47;

    returnedMockResult.list[0].main.humidity = humidity;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultHumidity = object.humidity;

    assert.strictEqual(humidity, resultHumidity);
  });

  it(`should give the cloudiness of a given forecast`, async () => {
    const cloudiness = 47;

    returnedMockResult.list[0].clouds.all = cloudiness;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultCloudiness = object.cloudiness;

    assert.strictEqual(cloudiness, resultCloudiness);
  });

  it(`should give rain volume for a given forecast if it is raining`, async () => {
    const rainVolume = 0.52;
    const weather = `Rain`;

    returnedMockResult.list[0].weather[0].main = weather;
    returnedMockResult.list[0].rain[`3h`] = rainVolume;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultRainVolume = object.rainVolume;

    assert.strictEqual(rainVolume, resultRainVolume);
    assert.strictEqual(weather, object.weather);
  });

  it(`should give snow volume for a given forecast if it is snowing`, async () => {
    const snowVolume = 0.52;
    const weather = `Snow`;

    returnedMockResult.list[0].weather[0].main = weather;
    returnedMockResult.list[0].snow[`3h`] = snowVolume;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon);
    const resultSnowVolume = object.snowVolume;

    assert.strictEqual(snowVolume, resultSnowVolume);
    assert.strictEqual(weather, object.weather);
  });

  it(`should provide future forecasts if requested`, async () => {
    const futureTimeIn3hBlocks = 2;
    const temperature = 7;

    returnedMockResult.list[futureTimeIn3hBlocks].main.temp = temperature;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(200, returnedMockResult);

    const object = await weatherAPI(lat, lon, undefined, 2);
    const resultTemperature = object.temperature;

    assert.strictEqual(temperature, resultTemperature);
  });

  it(`should return null on API non-200 status`, async () => {
    const statusCode = 500;

    returnedMockResult.cod = statusCode;

    mock
      .onGet(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon, appid: API_KEY, units: `metric` },
      })
      .reply(500, returnedMockResult);

    const object = await weatherAPI(lat, lon);

    assert.strictEqual(null, object);
  });
});
