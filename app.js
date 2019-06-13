const Discord = require("discord.js");
const client = new Discord.Client();

const token = require("./config.js").BOT_TOKEN;

client.on("message", msg => {
  if (msg.content === "ping") {
    msg.reply("pong");
  }
});

client.login(token);
