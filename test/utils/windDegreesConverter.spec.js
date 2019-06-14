const { assert } = require(`chai`);

const windDegreesConverter = require(`../../utils/windDegreesConverter`);

describe(`The windDegreesConverter utility function`, () => {
  it(`should convert numerical degrees into a string containing the wind direction`, () => {
    const windDegrees = 62;
    const expectedString = `ENE`;

    const result = windDegreesConverter(windDegrees);

    assert.strictEqual(expectedString, result);
  });
});
