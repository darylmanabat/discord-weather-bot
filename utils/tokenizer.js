module.exports = (input) => {
  const arrayOfWords = input.split(` `);
  const command = arrayOfWords.shift(); // discord command that the bot listens for
  const flags = arrayOfWords.filter((string) => string.includes(`--`)); // flags provided by the user
  const args = arrayOfWords.filter((string) => !string.includes(`--`)); // arguments provided by the user
  const object = {
    command,
    flags,
    arguments: args,
  };
  return object;
};
