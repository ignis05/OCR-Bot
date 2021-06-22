const { exit } = require('process')
const fs = require('fs')

// const ocrSpace = require('ocr-space-api-wrapper')
const { recognize } = require('tesseract.js')

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
		console.log('running ocr')
		res = await recognize(msg.attachments.first().attachment, 'pol', { errorHandler: console.error })
		var resmsg = res.data?.text
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
			if (!inter.guild) return inter.reply({ content: `Bot cant be enabled in DMs`, ephemeral: true })
			if (!config.enabledGuilds.includes(inter.guild.id)) return inter.reply({ content: `Bot was not enabled on this guild`, ephemeral: true })
			if (inter.user.id != botOwnerID && !inter.member.permissions.has(`MANAGE_CHANNELS`)) return inter.reply({ content: `You need MANAGE_CHANNELS permission to use this command`, ephemeral: true })

			let newChannelID = inter.options.first()?.value || inter.channel.id
			let ch = await client.channels.fetch(newChannelID)
			if (!ch.isText()) return inter.reply({ content: 'Specified channel is not a text channel', ephemeral: true })

			let index = config.enabledChannels.indexOf(ch.id)
			if (index == -1) {
				config.enabledChannels.push(ch.id)
				inter.reply(`Enabled ocr in ${ch}`)
			}
			else {
				config.enabledChannels.splice(index, 1)
				inter.reply(`Disabled ocr in ${ch}`)
			}
			fs.writeFileSync('./config.json', JSON.stringify(config, null, 4))
			break
		case 'ocr-status':
			inter.reply({ content: `OCR is ${config.enabledChannels.includes(inter.channel.id) ? "enabled" : "disabled"} in this channel`, ephemeral: true })
			break
	}
})

client.on('error', console.error)
client.login(token)