const { assert } = require(`chai`);
const tokenizer = require(`../../utils/tokenizer`);

describe(`The tokenizer utility function`, () => {
  it(`should detect and isolate the prefix command if it's on the start of the string`, () => {
    const testString = `!weather some text here`;

    const object = tokenizer(testString);

    assert.exists(object.command);
  });

  it(`should detect and isolate flags, and provide them as an array`, () => {
    const testString = `!weather --some --flags more words`;

    const object = tokenizer(testString);

    assert.isArray(object.flags);
    assert.notInclude(object.flags, object.command);
  });

  it(`should detect and isolate arguments, and provide them as an array`, () => {
    const testString = `!weather --some --flags more words`;

    const object = tokenizer(testString);

    assert.isArray(object.arguments);
    assert.notInclude(object.arguments, object.command);
    assert.notDeepInclude(object.arguments, object.flags);
  });
});
