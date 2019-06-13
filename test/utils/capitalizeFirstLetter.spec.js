const { assert } = require(`chai`);
const capitalizeFirstLetter = require(`../../utils/capitalizeFirstLetter`);

describe(`capitalizeFirstLetter utility function`, () => {
  it(`should capitalize the first letter in a string`, () => {
    const lowerCaseString = `lowercase string`;
    const capitalizedString = `Lowercase string`;

    assert.strictEqual(capitalizedString, capitalizeFirstLetter(lowerCaseString));
    assert.strictEqual(capitalizedString, capitalizeFirstLetter(capitalizedString));
  });
});
