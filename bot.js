const ocrSpace = require('ocr-space-api-wrapper')

const Discord = require('discord.js')
const intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED)
const client = new Discord.Client({ intents })

const token = require('./token.json').token

client.on('ready', () => {
	console.log('Ready!')
})

client.on('message', async msg => {
	if (msg.channel.id !== '467317385251258378') return // limit to one channel
	if (msg.attachments.size > 0) {
		res = await ocrSpace(msg.attachments.first().url, { language: 'pol', scale: 'true' })
		var resmsg = res?.ParsedResults[0]?.ParsedText
		if (resmsg) msg.reply(`\`\`\`${resmsg}\`\`\``, { allowedMentions: { users: [] } })
		else console.log('ocr failed')
	}

})

client.on('error', console.error)
client.login(token)