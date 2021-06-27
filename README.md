# OCR-Bot

Discord.js bot that can be set to transcribe message attachments from specific discord channels using tesseract.js.<br>
Requires nodejs version `^14.16.1`

## How to host your own copy:

1. Create discord bot in [developer panel](https://discord.com/developers/applications/)

-  Add new application with bot account
-  Copy bot token and application id

2. Install dependencies with `npm i` and run bot with `node bot.js`

-  `config.json` and `token.json` files will be created - paste the bot token to the token.json and copy your discord user id and set it in config as botOwnerID.

3. Run `node scripts/register.js` to register slash commands - it can take up to an hour before they appear.

4. Use the https://discord.com/oauth2/authorize?client_id=BOT_APPLICATION_ID_HERE&scope=bot+applications.commands&permissions=117760 link to invite bot to your server (with the application id from developer page)

5. Host bot with `node bot.js`

-  or alternatively if you have pm2 node process manager installed `pm2 start ecosystem.config.js`

6. Bot will automatically enable itself on a server when it sees any message from owner on the server. Then botOwner or users with MANAGE_CHANNELS permission can toggle it in specific channels with `/toggle-ocr` command.
