const { assert } = require(`chai`);

const whitespaceTrimmer = require(`../../utils/whitespaceTrimmer`);

describe(`The whitespaceTrimmer utility function`, () => {
  it(`should trim trailing whitespace at the beginning and the end of a string`, () => {
    const inputString = `  some words  `;
    const expectedString = `some words`;

    const result = whitespaceTrimmer(inputString);

    assert.strictEqual(expectedString, result);
  });

  it(`should trim extra whitespace in between words in a string`, () => {
    const inputString = `  some   words    `;
    const expectedString = `some words`;

    const result = whitespaceTrimmer(inputString);

    assert.strictEqual(expectedString, result);
  });
});
