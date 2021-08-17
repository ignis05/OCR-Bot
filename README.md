# OCR-Bot

Discord.js bot that can be set to transcribe message attachments from specific discord channels using tesseract.js.<br>

## Usage:

- To transcribe a single message select `Apps > OCR` from message's context menu.
- To enable automatic transcription in a channel make sure the bot can **view channel**, **send messages** and **read message history** (that one is required to be able to link the original message when responing).<br>
  Then bot owner or someone with **manage channel** permission can use `/toggle-ocr` to toggle automatic transcribing.
- You can use `/ocr-status` to check if automatic ocr is enabled in current channel

## How to host your own copy:

0. Make sure you have [nodejs](https://nodejs.org) version `^16.6.1` installed.

1. Create discord bot in [developer panel](https://discord.com/developers/applications/) and copy it's token.

2. Download this repo and install dependencies with `npm i`

3. Launch bot with `node bot.js` to generate `data/token.json` - paste your bot token there.

4. Use `npm run get-invite` to generate invite link and use it to add the bot to your server.

5. Use `npm run register` to register slash commands - it can take up to an hour before discord finishes processing them.

6. Start bot with `node bot.js`

- or alternatively if you have pm2 installed: `npm run start`
