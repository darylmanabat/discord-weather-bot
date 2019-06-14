const { assert } = require(`chai`);
const tokenizer = require(`../../utils/tokenizer`);

describe(`The tokenizer utility function`, () => {
  it(`should detect and isolate the prefix command if it's on the start of the string`, () => {
    const testString = `!weather some text here`; // sample input from a discord user

    const object = tokenizer(testString);

    assert.exists(object.command);
  });

  it(`should detect and isolate flags, and provide them as an array`, () => {
    const testString = `!weather --some --flags more words`;

    const object = tokenizer(testString);

    assert.isArray(object.flags);
    assert.notInclude(object.flags, object.command);
  });

  it(`should return even without flags or arguments`, () => {
    const stringWithoutFlags = `!weather some words`;
    const stringWithoutArgs = `!weather --some --flags`;

    const withoutFlags = tokenizer(stringWithoutFlags);
    const withoutArgs = tokenizer(stringWithoutArgs);
    assert.exists(withoutFlags);
    assert.exists(withoutArgs);
  });

  it(`should detect and isolate arguments, and provide them as an array`, () => {
    const testString = `!weather --some --flags more words`;

    const object = tokenizer(testString);

    assert.isArray(object.arguments);
    assert.notInclude(object.arguments, object.command);
    assert.notDeepInclude(object.arguments, object.flags);
  });
});
