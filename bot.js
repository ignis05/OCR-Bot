const { exit } = require('process')
const fs = require('fs')

const ocrSpace = require('ocr-space-api-wrapper')

const Discord = require('discord.js')
const intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED)
const client = new Discord.Client({ intents })

const botOwnerID = '226032144856776704'
var token
var config

const configPlaceholder = { enabledGuilds: [], enabledChannels: [] }

try {
	token = require('./token.json').token
	if (token == "bot_token_here") {
		console.error(`./token.json is placehoder`)
		exit(0)
	}
} catch (err) {
	fs.writeFileSync('./token.json', `{"token":"bot_token_here"}`)
	console.error('Auth not found: You need to paste bot auth to ./token.json')
	exit(0)
}

try {
	config = require('./config.json')
} catch (err) {
	config = configPlaceholder
	fs.writeFileSync('./config.json', JSON.stringify(configPlaceholder, null, 4))
}

client.on('ready', () => {
	client.users.fetch(botOwnerID).then(owner => {
		owner.send("Active and ready")
	})
	console.log('Ready!')
})

client.on('guildCreate', guild => {
	client.users.fetch(botOwnerID).then(owner => {
		owner.send(`${owner} - bot was just activated on a new guild: **${guild.name}**`)
	})
})


/**
 * @param msg {Discord.Message}
 */
client.on('message', async msg => {
	if (!msg.guild || !config.enabledGuilds.includes(msg.guild.id)) {
		// activate when any message from owner is sent in guild
		if (msg.author.id === botOwnerID) {
			config.enabledGuilds.push(msg.guild.id)
			console.log(`Bot activated in new guild **${msg.guild.name}**`)
			fs.writeFileSync('./config.json', JSON.stringify(config, null, 4))
			client.users.fetch(botOwnerID).then(owner => {
				owner.send(`Bot activated in new guild **${msg.guild.name}**`)
			})
		}
		else return // no activity on inactive guilds
	}
	if (!config.enabledChannels.includes(msg.channel.id)) return // limit to active channels
	if (msg.attachments.size > 0) {
		res = await ocrSpace(msg.attachments.first().url, { language: 'pol', scale: 'true' })
		var resmsg = res?.ParsedResults[0]?.ParsedText
		if (resmsg) msg.reply(`\`\`\`${resmsg}\`\`\``, { allowedMentions: { users: [] } })
		else console.log('ocr failed')
	}

})

/**
 * @param inter {Discord.CommandInteraction}
 */
client.on('interaction', async inter => {
	if (!inter.isCommand()) return

	switch (inter.commandName) {
		case 'ping':
			console.log('pong!')
			inter.reply({ content: `Pong! (${Date.now() - inter.createdTimestamp}ms)`, ephemeral: true })
			break

		case 'toggle-ocr':
			inter.defer()

			let newChannelID = inter.options.first()?.value || inter.channel.id
			let ch = await client.channels.fetch(newChannelID)
			if (!ch.isText()) return inter.editReply('Specified channel is not a text channel')

			let index = config.enabledChannels.indexOf(ch.id)
			if (index == -1) {
				config.enabledChannels.push(ch.id)
				inter.editReply(`Enabled ocr in ${ch}`)
			}
			else {
				config.enabledChannels.splice(index, 1)
				inter.editReply(`Disabled ocr in ${ch}`)
			}
			fs.writeFileSync('./config.json', JSON.stringify(config, null, 4))
	}
})

client.on('error', console.error)
client.login(token)