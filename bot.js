const Discord = require('discord.js')
const ocrSpace = require('ocr-space-api-wrapper')

const token = require('token.js').token

const client = new Discord.Client()

client.on('ready', () => {
	client.users.fetch(botOwnerID).then(owner => {
		owner.send('Ready!')
	})
	console.log('Ready!')
})

client.on('message', async msg => {
	if (msg.attachments.size > 0) {
		res = await ocrSpace(msg.attachments.first().url, { language: 'pol' })
		var resmsg = res?.ParsedResults[0]?.ParsedText
		if (resmsg) inter.editReply(`Result:\n\`\`\`${resmsg}\`\`\``)
		else console.log('ocr failed')
	}
})

client.on('error', console.error)
client.login(token)