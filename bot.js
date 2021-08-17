const { exit } = require('process')
const fs = require('fs')

const { recognize } = require('tesseract.js')

const Discord = require('discord.js')
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS] })

// #region config loading
const configPlaceholder = { enabledGuilds: [], enabledChannels: [] }
try {
	var config = require('./data/config.json')
} catch (err) {
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
	if (!fs.existsSync('./data')) {
		fs.mkdirSync('./data')
	}
	fs.writeFileSync('./data/token.json', `{"token":"bot_token_here"}`)
	console.error('Token not found: You need to paste bot token to ./data/token.json')
	exit(0)
}
// #endregion config loading

const commands = require('./commands')

client.on('ready', async () => {
	await client.application.fetch()
	client.application.owner.send('Active and ready')
	console.log('Ready!')
})

client.once('ready', () => {
	// save client id for register script
	fs.writeFileSync('./data/clientId.json', JSON.stringify({ clientId: client.user.id }))
})

client.on('guildCreate', (guild) => {
	client.application.owner.send(`${client.application.owner} - bot just joined a new guild: **${guild.name}**`)
})

/** @param {Discord.Message} msg */
client.on('messageCreate', async (msg) => {
	if (msg.author.bot) return
	if (!msg.guild || !config.enabledGuilds.includes(msg.guild.id)) {
		// activate when any message from owner is sent in guild
		if (msg.author.id === client.application.owner.id) {
			config.enabledGuilds.push(msg.guild.id)
			console.log(`Bot activated in a new guild **${msg.guild.name}**`)
			fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2))
			client.application.owner.send(`Bot activated in a new guild **${msg.guild.name}**`)
		} else return // no activity on inactive guilds
	}
	if (!config.enabledChannels.includes(msg.channel.id)) return // limit to active channels
	if (msg.attachments.size > 0) {
		console.log(`running ocr in #${msg.channel.name}`)
		res = await recognize(msg.attachments.first().attachment, 'pol', { errorHandler: console.error })
		/** @type {String} **/
		var resmsg = res.data?.text
		if (resmsg) {
			if (resmsg.length > 1950) resmsg = resmsg.substring(0, 1950)
			msg.reply({ content: `\`\`\`${resmsg}\`\`\``, allowedMentions: { repliedUser: false } }).catch((err) => {
				console.log('failed to send reply')
				console.log(err)
			})
		} else console.log('ocr failed')
	}
})

/** @param {Discord.CommandInteraction} inter */
client.on('interactionCreate', (inter) => {
	if (!inter.isCommand() && !inter.isContextMenu()) return
	console.log(`Received interaction ${inter.commandName} from ${inter.user.tag}`)

	if (!inter.guild || !config.enabledGuilds.includes(inter.guildId)) {
		// activate when any interaction from owner is sent in guild
		if (inter.user.id === client.application.owner.id) {
			config.enabledGuilds.push(inter.guild.id)
			console.log(`Bot activated in a new guild **${inter.guild.name}**`)
			fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2))
			client.application.owner.send(`Bot activated in a new guild **${inter.guild.name}**`)
		} else return inter.reply({ content: 'Bot was not activated on this guild.', ephemeral: true })
	}

	if (!commands[inter.commandName]) return console.error(`interaction ${inter.commandName} not recognized`)

	commands[inter.commandName]?.handler(inter)
})

client.on('error', console.error)
client.login(token)
