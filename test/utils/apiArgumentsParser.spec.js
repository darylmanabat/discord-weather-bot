const { assert } = require(`chai`);
const apiArgumentsParser = require(`../../utils/apiArgumentsParser`);

describe(`The apiArgumentsParser utility function`, () => {
  it(`should return an object with a task property`, () => {
    const tokenObject = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const resultObject = apiArgumentsParser(tokenObject.arguments, tokenObject.flags);

    assert.exists(resultObject.task);
  });

  it(`should return the first item in the arguments array as the task property`, () => {
    const tokenObject = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const resultObject = apiArgumentsParser(tokenObject.arguments, tokenObject.flags);

    assert.strictEqual(tokenObject.arguments[0], resultObject.task);
  });

  it(`should return an object with a location property only if task is "forecast", equal to the concatenated string of the rest of the arguments`, () => {
    const tokenObject = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const tokenWithoutForecast = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`],
      arguments: [`where`, `London,`, `UK`],
    };

    const positiveResult = apiArgumentsParser(tokenObject.arguments, tokenObject.flags);
    const negativeResult = apiArgumentsParser(tokenWithoutForecast.arguments, tokenWithoutForecast.flags);

    assert.exists(positiveResult.location);
    assert.notExists(negativeResult.location);
  });

  it(`should return an object with a "units" property only if task is "forecast" and the flags array contain "--imperial", and returns the string "imperial"`, () => {
    const tokenObject = {
      command: `!weather`,
      flags: [`--humidity`, `--imperial`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const result = apiArgumentsParser(tokenObject.arguments, tokenObject.flags);

    assert.exists(result.units);
    assert.strictEqual(tokenObject.flags[1].slice(2), result.units);
  });

  it(`should return an object with a "units" property only if task is "forecast", and should return the string "metric" by default`, () => {
    const tokenWithoutUnits = {
      command: `!weather`,
      flags: [`--humidity`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const result = apiArgumentsParser(tokenWithoutUnits.arguments, tokenWithoutUnits.flags);

    assert.exists(result.units);
    assert.strictEqual(`metric`, result.units);
  });

  it(`should return an object with "future" property (type number) only if the flags array contains a number`, () => {
    const tokenObject = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`, `--3`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const tokenWithoutNumber = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const positiveResult = apiArgumentsParser(tokenObject.arguments, tokenObject.flags);
    const negativeResult = apiArgumentsParser(tokenWithoutNumber.arguments, tokenWithoutNumber.flags);

    assert.exists(positiveResult.future);
    assert.strictEqual(tokenObject.flags[2].slice(2), positiveResult.future);
    assert.notExists(negativeResult.future);
  });

  it(`should return an object with a displayIncluding property (type array) for the rest of the flags`, () => {
    const tokenObject = {
      command: `!weather`,
      flags: [`--humidity`, `--metric`, `--3`],
      arguments: [`forecast`, `London,`, `UK`],
    };

    const result = apiArgumentsParser(tokenObject.arguments, tokenObject.flags);

    assert.exists(result.displayIncluding);
    assert.deepEqual([tokenObject.flags[0]], result.displayIncluding);
  });
});
