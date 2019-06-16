const geoTz = require(`geo-tz`);

const whitespaceTrimmer = require(`./utils/whitespaceTrimmer`);
const tokenizer = require(`./utils/tokenizer`);
const apiArgumentsParser = require(`./utils/apiArgumentsParser`);
const replyBuilder = require(`./utils/replyBuilder`);

const geocoding = require(`./apis/geocoding`);
const weather = require(`./apis/weather`);

module.exports = async (message) => {
  const string = message.content;
  const trimmedString = whitespaceTrimmer(string);

  if (!trimmedString.startsWith(`!weather`) || message.author.bot) return undefined;

  const tokens = tokenizer(trimmedString);

  const argumentsAndSettings = apiArgumentsParser(tokens.arguments, tokens.flags);

  let botReply;

  if (!argumentsAndSettings.task) return message.reply(replyBuilder(`no task`));
  if (argumentsAndSettings.task === `forecast` && argumentsAndSettings.location === ``)
    return message.reply(replyBuilder(argumentsAndSettings.task, argumentsAndSettings.location));
  if (argumentsAndSettings.task !== `forecast`) return message.reply(replyBuilder(argumentsAndSettings.task));

  const locationResult = await geocoding(argumentsAndSettings.location);
  if (locationResult === null || (typeof locationResult === `object` && Object.keys(locationResult).length === 0))
    botReply = replyBuilder(argumentsAndSettings.task, locationResult);
  else {
    const timezone = geoTz(locationResult.lat, locationResult.lon);
    const weatherResult = await weather(
      locationResult.lat,
      locationResult.lon,
      argumentsAndSettings.units,
      argumentsAndSettings.future,
    );
    botReply = replyBuilder(
      argumentsAndSettings.task,
      argumentsAndSettings.location,
      weatherResult,
      argumentsAndSettings.units,
      timezone,
      argumentsAndSettings.displayIncluding,
    );
  }
  return message.reply(botReply);
};
