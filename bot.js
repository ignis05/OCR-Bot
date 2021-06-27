const { exit } = require('process')
const fs = require('fs')

const { recognize } = require('tesseract.js')

const Discord = require('discord.js')
const intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED)
const client = new Discord.Client({ intents })

var botOwnerID
var token
var config

const configPlaceholder = { enabledGuilds: [], enabledChannels: [], botOwnerID: "id_here" }

try {
	config = require('./config.json')
	botOwnerID = config.botOwnerID
} catch (err) {
	config = configPlaceholder
	fs.writeFileSync('./config.json', JSON.stringify(configPlaceholder, null, 4))
}

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


client.on('ready', () => {
	client.users.fetch(botOwnerID).then(owner => {
		owner.send("Active and ready")
	}).catch(err => console.error("failed to fetch bot owner - make sure that botOwnerID in config is correct and bot shares at least one server with the owner"))
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
	if (msg.author.bot) return
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
		console.log(`running ocr in ${msg.channel.name}`)
		res = await recognize(msg.attachments.first().attachment, 'pol', { errorHandler: console.error })
		/**
		* @type {String}
		**/
		var resmsg = res.data?.text
		if (resmsg) {
			if (resmsg.length > 1950) resmsg = resmsg.substring(0, 1950)
			msg.reply(`\`\`\`${resmsg}\`\`\``, { allowedMentions: { users: [] } })
		}
		else console.log('ocr failed')
	}

})

/**
 * @param inter {Discord.CommandInteraction}
 */
client.on('interaction', async inter => {
	if (!inter.isCommand()) return
	console.log(`Received interaction ${inter.commandName} from ${inter.user.tag}`)

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