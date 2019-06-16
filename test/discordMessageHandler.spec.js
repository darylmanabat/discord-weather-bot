const chai = require(`chai`);
const rewire = require(`rewire`);
const sinon = require(`sinon`);

const { assert } = require(`chai`);

sinon.assert.expose(chai.assert, { prefix: `` }); // function to make chai's assert compatible with sinon

const whitespaceTrimmer = require(`../utils/whitespaceTrimmer`); // functions to fake for testing
const apiArgumentsParser = require(`../utils/apiArgumentsParser`);
const replyBuilder = require(`../utils/replyBuilder`);
const tokenizer = require(`../utils/tokenizer`);

const discordMessageHandler = rewire(`../discordMessageHandler`); // rewired the function under testing, so that we can mock its private variables

const sandbox = sinon.createSandbox(); // creates a sinon sandbox for mocking

let revertMockedFunctions; // create a variable that will hold the rewired functions for mocking during tests

describe(`The discordMessageHandler function (tests for integration)`, () => {
  afterEach(() => {
    revertMockedFunctions && revertMockedFunctions(); // check if there are rewired functions, and if so, revert their functionality
    sandbox.restore(); // cleanup, restores all faked objects to normal
  });

  it(`should call whitespaceTrimmer on the content string`, async () => {
    const spy = sandbox.spy();
    const whitespaceTrimmerSpy = sandbox.spy(whitespaceTrimmer);

    const inputObject = {
      reply: spy,
      content: `!weather forecast  `,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      whitespaceTrimmer: whitespaceTrimmerSpy,
    }); // place our spy on the whitespaceTrimmer function within discordMessageHandler

    await discordMessageHandler(inputObject);

    assert.isTrue(whitespaceTrimmerSpy.calledWith(inputObject.content));
  });

  it(`should return undefined and not call msg.reply() function if message doesn't start with "!weather" or author is a bot`, async () => {
    const spy = sandbox.spy(); // anonymous function for spying on msg.reply

    const botMessageObject = {
      reply: spy,
      content: `!weather forecast London`,
      author: {
        bot: true,
      },
    };

    const result = await discordMessageHandler(botMessageObject);
    assert.isTrue(spy.notCalled);
    assert.notExists(result);
  });

  it(`should call tokenizer from the whitespaceTrimmer result`, async () => {
    const spy = sandbox.spy();
    const tokenizerSpy = sandbox.spy(tokenizer);
    const whitespaceTrimmerSpy = sandbox.spy(whitespaceTrimmer);

    const inputObject = {
      reply: spy,
      content: `   !weather   forecast  `,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      tokenizer: tokenizerSpy,
      whitespaceTrimmer: whitespaceTrimmerSpy,
    });

    await discordMessageHandler(inputObject);

    assert.isTrue(tokenizerSpy.called);
    assert.isTrue(tokenizerSpy.calledWith(whitespaceTrimmerSpy.returnValues[0]));
  });

  it(`should call the apiArgumentsParser on the tokenizer result`, async () => {
    const spy = sandbox.spy();
    const tokenizerSpy = sandbox.spy(tokenizer);
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);

    const inputObject = {
      reply: spy,
      content: `   !weather   forecast   `,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      tokenizer: tokenizerSpy,
      apiArgumentsParser: apiArgumentsParserSpy,
    });

    await discordMessageHandler(inputObject);

    assert.isTrue(apiArgumentsParserSpy.called);
    assert.isTrue(
      apiArgumentsParserSpy.calledWith(tokenizerSpy.returnValues[0].arguments, tokenizerSpy.returnValues[0].flags),
    );
  });

  it(`should call replyBuilder with "no task" as the first argument if the task property of the result of apiArgumentsParser doesn't exist, then use its output as an argument to msg.reply`, async () => {
    const replyBuilderSpy = sandbox.spy(replyBuilder);
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const replySpy = sandbox.spy();

    const inputObject = {
      reply: replySpy,
      content: `   !weather  `,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      replyBuilder: replyBuilderSpy,
      apiArgumentsParser: apiArgumentsParserSpy,
    });

    await discordMessageHandler(inputObject);

    assert.notExists(apiArgumentsParserSpy.returnValues[0].task);
    assert.isTrue(replyBuilderSpy.called);
    assert.isTrue(replyBuilderSpy.calledWith(`no task`));
    assert.isTrue(replySpy.calledWith(replyBuilderSpy.returnValues[0]));
  });

  it(`should call replyBuilder with 2 arguments if the task property of apiArgumentsParser is "forecast" and location property of apiArgumentsParser is an empty string, then use its output as an argument to msg.reply`, async () => {
    const replyBuilderSpy = sandbox.spy(replyBuilder);
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const replySpy = sandbox.spy();

    const inputObject = {
      reply: replySpy,
      content: `   !weather forecast `,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      replyBuilder: replyBuilderSpy,
      apiArgumentsParser: apiArgumentsParserSpy,
    });

    await discordMessageHandler(inputObject);

    assert.strictEqual(apiArgumentsParserSpy.returnValues[0].location, ``);
    assert.isTrue(replyBuilderSpy.calledOnce);
    assert.isTrue(replySpy.calledOnce);
    assert.isTrue(
      replyBuilderSpy.calledWith(
        apiArgumentsParserSpy.returnValues[0].task,
        apiArgumentsParserSpy.returnValues[0].location,
      ),
    );
  });

  it(`should call replyBuilder with the task property of the apiArgumentsParser if task is not equal to forecast, then use its output as an argument to msg.reply`, async () => {
    const replyBuilderSpy = sandbox.spy(replyBuilder);
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const replySpy = sandbox.spy();

    const withoutForecast = {
      reply: replySpy,
      content: `   !weather notforecast`,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      replyBuilder: replyBuilderSpy,
      apiArgumentsParser: apiArgumentsParserSpy,
    });

    await discordMessageHandler(withoutForecast);

    assert.strictEqual(apiArgumentsParserSpy.returnValues[0].location, undefined);
    assert.isTrue(replyBuilderSpy.calledOnce);
    assert.isTrue(replySpy.calledOnce);
    assert.isTrue(replyBuilderSpy.calledWith(apiArgumentsParserSpy.returnValues[0].task));
  });

  it(`should call the geocoding API function on the location property of the apiArgumentsParser result`, async () => {
    const replySpy = sandbox.spy();
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const geocodingStub = sandbox.stub();
    geocodingStub.withArgs(`London`).returns(null);

    const inputObject = {
      reply: replySpy,
      content: `   !weather forecast London`,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      apiArgumentsParser: apiArgumentsParserSpy,
      geocoding: geocodingStub,
    });

    await discordMessageHandler(inputObject);

    assert.strictEqual(apiArgumentsParserSpy.returnValues[0].location, `London`);
    assert.isTrue(geocodingStub.called);
    assert.isTrue(geocodingStub.calledWith(apiArgumentsParserSpy.returnValues[0].location));
  });

  it(`should call replyBuilder with task and location properties of the apiArgumentsParser result if geocoding API function returns null or an empty object`, async () => {
    const replySpy = sandbox.spy();
    const replyBuilderSpy = sandbox.spy(replyBuilder);

    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const geocodingStub = sandbox.stub();
    geocodingStub.withArgs(`London`).returns(null);
    geocodingStub.withArgs(`Someplace`).returns({});
    const resultWithNull = {
      reply: replySpy,
      content: `   !weather forecast London`,
      author: {
        bot: false,
      },
    };

    const resultWithEmptyObject = {
      reply: replySpy,
      content: `   !weather forecast Someplace`,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      replyBuilder: replyBuilderSpy,
      apiArgumentsParser: apiArgumentsParserSpy,
      geocoding: geocodingStub,
    });

    await discordMessageHandler(resultWithNull);
    await discordMessageHandler(resultWithEmptyObject);

    assert.isTrue(replyBuilderSpy.calledTwice);
    assert.isTrue(replyBuilderSpy.calledWith(apiArgumentsParserSpy.returnValues[0].task, null));
    assert.isTrue(replyBuilderSpy.calledWith(apiArgumentsParserSpy.returnValues[1].task, {}));
  });

  it(`should call the geoTz function with the geocoding API's results (latitude and longitude)`, async () => {
    const replySpy = sandbox.spy();

    const geoTzStub = sandbox.stub();
    geoTzStub.withArgs(`51.5073219`, `-0.1276474`).returns([`Europe/London`]);
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const geocodingStub = sandbox.stub();
    geocodingStub.withArgs(`London`).returns({
      display_name: `London, Greater London, England, SW1A 2DX, United Kingdom`,
      lat: `51.5073219`,
      lon: `-0.1276474`,
    });
    const weatherStub = sandbox.stub();
    weatherStub.withArgs(`51.5073219`, `-0.1276474`, `metric`).returns({
      temperature: 5.07,
      minimumTemperature: 5.07,
      maximumTemperature: 5.55,
      humidity: 62,
      cloudiness: 29,
      heatIndex: -3.05,
      weather: `Clouds`,
      weatherDescription: `Scattered clouds`,
      timeOfForecast: 1585472400000,
      wind: { speed: 8.44, direction: 28 },
      future: 2,
    });
    const inputObject = {
      reply: replySpy,
      content: `   !weather forecast London`,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      apiArgumentsParser: apiArgumentsParserSpy,
      geocoding: geocodingStub,
      weather: weatherStub,
      geoTz: geoTzStub,
    });

    await discordMessageHandler(inputObject);

    assert.isTrue(geoTzStub.calledWith(`51.5073219`, `-0.1276474`));
  });

  it(`should call the weather API with geocoding API's result, units and future properties from argumentsAndsettings (if they exist)`, async () => {
    const replySpy = sandbox.spy();

    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);
    const geoTzStub = sandbox.stub();
    geoTzStub.withArgs(`51.5073219`, `-0.1276474`).returns([`Europe/London`]);
    const geocodingStub = sandbox.stub();
    geocodingStub.withArgs(`London`).returns({
      display_name: `London, Greater London, England, SW1A 2DX, United Kingdom`,
      lat: `51.5073219`,
      lon: `-0.1276474`,
    });
    const weatherStub = sandbox.stub();
    weatherStub.withArgs(`51.5073219`, `-0.1276474`, `metric`, 2).returns({
      temperature: 5.07,
      minimumTemperature: 5.07,
      maximumTemperature: 5.55,
      humidity: 62,
      cloudiness: 29,
      heatIndex: -3.05,
      weather: `Clouds`,
      weatherDescription: `Scattered clouds`,
      timeOfForecast: 1585472400000,
      wind: { speed: 8.44, direction: 28 },
      future: 2,
    });

    const inputObject = {
      reply: replySpy,
      content: `   !weather forecast London --2`,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      apiArgumentsParser: apiArgumentsParserSpy,
      geocoding: geocodingStub,
      weather: weatherStub,
      geoTz: geoTzStub,
    });

    await discordMessageHandler(inputObject);
    assert.isTrue(weatherStub.calledWith(`51.5073219`, `-0.1276474`, apiArgumentsParserSpy.returnValues[0].units, 2));
  });

  it(`should call the replyBuilder with argumentsAndSettings task and location properties, the result from weather API, units property from argumentsAndSettings, result from geoTz function, and displayIncluding property from argumentsAndSettings (exactly in that order) `, async () => {
    const replySpy = sandbox.spy();
    const replyBuilderSpy = sandbox.spy(replyBuilder);
    const apiArgumentsParserSpy = sandbox.spy(apiArgumentsParser);

    const weatherStub = sandbox.stub();
    weatherStub.withArgs(`51.5073219`, `-0.1276474`, `metric`, 2).returns({
      temperature: 5.07,
      minimumTemperature: 5.07,
      maximumTemperature: 5.55,
      humidity: 62,
      cloudiness: 29,
      heatIndex: -3.05,
      weather: `Clouds`,
      weatherDescription: `Scattered clouds`,
      timeOfForecast: 1585472400000,
      wind: { speed: 8.44, direction: 28 },
      future: 2,
    });
    const geoTzStub = sandbox.stub();
    geoTzStub.withArgs(`51.5073219`, `-0.1276474`).returns([`Europe/London`]);
    const geocodingStub = sandbox.stub();
    geocodingStub.withArgs(`London`).returns({
      display_name: `London, Greater London, England, SW1A 2DX, United Kingdom`,
      lat: `51.5073219`,
      lon: `-0.1276474`,
    });

    const inputObject = {
      reply: replySpy,
      content: `   !weather forecast London --2`,
      author: {
        bot: false,
      },
    };

    revertMockedFunctions = discordMessageHandler.__set__({
      replyBuilder: replyBuilderSpy,
      apiArgumentsParser: apiArgumentsParserSpy,
      geocoding: geocodingStub,
      weather: weatherStub,
      geoTz: geoTzStub,
    });

    await discordMessageHandler(inputObject);

    assert.isTrue(
      replyBuilderSpy.calledWith(
        apiArgumentsParserSpy.returnValues[0].task,
        apiArgumentsParserSpy.returnValues[0].location,
        {
          temperature: 5.07,
          minimumTemperature: 5.07,
          maximumTemperature: 5.55,
          humidity: 62,
          cloudiness: 29,
          heatIndex: -3.05,
          weather: `Clouds`,
          weatherDescription: `Scattered clouds`,
          timeOfForecast: 1585472400000,
          wind: { speed: 8.44, direction: 28 },
          future: 2,
        },
      ),
      apiArgumentsParserSpy.returnValues[0].units,
      [`Europe/London`],
      apiArgumentsParserSpy.returnValues[0].displayIncluding,
    );
  });
});
