const { Client } = require('discord.js')
const { exit } = require('process')
const fs = require('fs')

try {
	require('./data/config.json')
} catch (err) {
	fs.writeFileSync('./data/config.json', JSON.stringify({ enabledGuilds: [], enabledChannels: [] }, null, 2))
}
try {
	var { token } = require('../data/token.json')
	if (token == 'bot_token_here') {
		console.error(`./data/token.json is placehoder`)
		exit(0)
	}
} catch (err) {
	if (!fs.existsSync('./data')) {
		fs.mkdirSync('./data')
	}
	fs.writeFileSync('./data/token.json', `{"token":"bot_token_here"}`)
	console.error('Token not found: You need to paste bot token to ./data/token.json')
	exit(0)
}

const client = new Client({ intents: [] })

client.once('ready', () => {
	// save client id for register script
	if (!fs.existsSync('./data')) {
		fs.mkdirSync('./data')
	}
	fs.writeFileSync('./data/clientId.json', JSON.stringify({ clientId: client.user.id }))
	// invite link
	let invite = client.generateInvite({
		scopes: ['applications.commands', 'bot'],
		permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
	})
	fs.writeFileSync('./data/invite.txt', invite)
	console.log(`Generated invite link and saved it in data/invite.txt:\n${invite}`)
	exit(0)
})

client.login(token)
