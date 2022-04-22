const { exit } = require('process')
const fs = require('fs')

const Discord = require('discord.js')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS] })

/** @typedef {import("./modules/ocr").multiOcrRes} multiOcrRes */
const multiOcr = require('./modules/ocr')
const activationGuard = require('./modules/activationGuard')

// #region config loading
const configPlaceholder = { enabledGuilds: [], enabledChannels: [] }
try {
	var config = require('./data/config.json')
} catch (err) {
	if (!fs.existsSync('./data')) fs.mkdirSync('./data')
	config = configPlaceholder
	fs.writeFileSync('./data/config.json', JSON.stringify(configPlaceholder, null, 2))
}
try {
	var { token } = require('./data/token.json')
	if (token == 'bot_token_here') {
		console.error(`./data/token.json is placehoder`)
		exit(0)
	}
} catch (err) {
	if (!fs.existsSync('./data')) fs.mkdirSync('./data')
	fs.writeFileSync('./data/token.json', `{"token":"bot_token_here"}`)
	console.error('Token not found: You need to paste bot token to ./data/token.json')
	exit(0)
}
// #endregion config loading

const commands = require('./commands')

client.on('ready', async () => {
	await client.application.fetch()
	client.application.owner.send('Active and ready').catch((err) => {
		console.log(`failed to send startup message to bot owner: ${err}`)
	})
	console.log('Ready!')
})

client.once('ready', () => {
	// save client id for register script
	fs.writeFileSync('./data/clientId.json', JSON.stringify({ clientId: client.user.id }))
})

client.on('guildCreate', (guild) => {
	client.application.owner.send(`${client.application.owner} - bot just joined a new guild: **${guild.name}**`)
})

const allowedMentions = { repliedUser: false }

/** @param {Discord.Message} msg */
client.on('messageCreate', async (msg) => {
	if (msg.author.bot) return
	if (!msg.guild) return // no dms
	if (activationGuard(msg, config)) return // guild not enabled
	if (!config.enabledChannels.includes(msg.channel.id)) return // limit to active channels

	for (let attachment of msg.attachments.values()) {
		if (!/\.(png|jpg)$/i.test(attachment.name)) continue // not an image

		console.log(`running ocr in #${msg.channel.name}`)

		let reply = await msg.reply({ content: `[ processing image ]`, allowedMentions }).catch((err) => {
			let errmsg = `Failed to reply to a message in channel #${msg.channel.name}:\n${err.code}: ${err.message}`
			// DiscordAPIError: Missing Permissions
			if (err.code === 50013) errmsg += '\nThis is most likely caused by missing **send messages** permission.'
			client.application.owner.send(errmsg)
			console.log(errmsg)
		})

		/** @type {multiOcrRes} **/
		let { success, text } = await multiOcr(attachment)

		if (!success) {
			reply.edit({ content: `[ ocr failed ]`, allowedMentions })
			continue
		}

		if (!text) {
			reply.edit({ content: `[ no text found ]`, allowedMentions })
			continue
		}
		// trim length
		if (text.length > 1950) text = text.substring(0, 1950)

		reply.edit({ content: `\`\`\`\n${text}\`\`\``, allowedMentions })
	}
})

/** @param {Discord.CommandInteraction} inter */
client.on('interactionCreate', (inter) => {
	if (!inter.isCommand() && !inter.isContextMenu()) return
	console.log(`Received interaction ${inter.commandName} from ${inter.user.tag}`)
	if (!inter.guild) return inter.reply({ content: "Bot doesn't work in DMs", ephemeral: true })
	if (activationGuard(inter, config)) return inter.reply({ content: 'Bot was not activated on this guild.', ephemeral: true })

	if (!commands[inter.commandName]) return console.error(`interaction ${inter.commandName} not recognized`)

	commands[inter.commandName]?.handler(inter)
})

client.on('error', console.error)
client.login(token)
