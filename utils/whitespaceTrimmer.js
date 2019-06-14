module.exports = (string) => {
  let trimmedString = string.trim();
  trimmedString = trimmedString.replace(/ +/g, ` `);
  return trimmedString;
};
