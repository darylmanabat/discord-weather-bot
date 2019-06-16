const Discord = require(`discord.js`);

const client = new Discord.Client();

const handlerFunction = require(`./discordMessageHandler`);
const token = require(`./config.js`).BOT_TOKEN;

client.on(`message`, handlerFunction);

client.login(token);
