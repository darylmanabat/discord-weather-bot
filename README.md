# disweather

**A discord bot that uses Geocoding and Weather APIs to provide weather information from a given area**

disweather uses OpenStreetMap's [Nominatim](https://nominatim.openstreetmap.org/) and OpenWeatherMap [Weather](https://openweathermap.org/api) APIs to provide accurate forecasts in a given area.

<br>

## Features

- Provide temperature, heat index, a description of the weather, and the time of forecast
- Optionally change readings to imperial (Fahrenheit and miles per hour). It defaults to metric
- Optionally display minimum and maximum temperature, humidity, cloudiness, wind speed and direction, rain volume, and snow volume
- Provide future forecasts up to 5 days ahead

<br>

## Installation

Requirements:

You must have at least v12 of Node.js in order for the project's dependencies to work.

Clone the repository to your desired directory, then install dependencies using your package manager (yarn, npm, pnpm, etc.)

You will need to create a bot in discord (See [Discord's Portal](https://discordapp.com/developers/applications/)) for its bot token.

You will also need to create an account in [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) to get your API key in order to make use of their APIs.

<br>

## Configuration and Usage

Place your discord bot token and your OpenWeatherMap API key in `config.js`, then start the bot using `node app` in your command line.

<br>

## License

GNU GPL v3
