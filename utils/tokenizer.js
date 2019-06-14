module.exports = (input) => {
  const arrayOfWords = input.split(` `);
  const command = arrayOfWords.shift();
  const flags = arrayOfWords.filter((string) => string.includes(`--`));
  const args = arrayOfWords.filter((string) => !string.includes(`--`));
  const object = {
    command,
    flags,
    arguments: args,
  };
  return object;
};
