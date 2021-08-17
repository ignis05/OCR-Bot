/** @typedef {import("discord.js").CommandInteraction} CommandInteraction */
const fs = require('fs')
const config = require('../data/config.json')

module.exports = {
	interaction: {
		name: 'toggle-ocr',
		description: 'Toggles OCR in current channel',
		options: [],
	},
	/** @param {CommandInteraction} inter */
	handler(inter) {
		//  no dms
		if (!inter.guild) return inter.reply({ content: `Bot cant be enabled in DMs`, ephemeral: true })
		// enabled guilds only
		if (!config.enabledGuilds.includes(inter.guild.id))
			return inter.reply({ content: `Bot was not enabled on this guild`, ephemeral: true })
		// members with "manage channels"
		if (inter.user.id != inter.client.application.owner.id && !inter.member.permissions.has(`MANAGE_CHANNELS`))
			return inter.reply({ content: `You need MANAGE_CHANNELS permission to use this command`, ephemeral: true })

		let ch = inter.channel
		if (!ch.isText()) return inter.reply({ content: 'Specified channel is not a text channel', ephemeral: true })

		let index = config.enabledChannels.indexOf(ch.id)
		if (index == -1) {
			// permission check
			if (!ch.permissionsFor(inter.guild.me).has('VIEW_CHANNEL')) return inter.reply('Missing **view channel** permission.')
			if (!ch.permissionsFor(inter.guild.me).has('SEND_MESSAGES')) return inter.reply('Missing **send messages** permission.')
			if (!ch.permissionsFor(inter.guild.me).has('READ_MESSAGE_HISTORY')) return inter.reply('Missing **read message history** permission.')
			config.enabledChannels.push(ch.id)
			inter.reply(`Enabled ocr in ${ch}`)
		} else {
			config.enabledChannels.splice(index, 1)
			inter.reply(`Disabled ocr in ${ch}`)
		}
		fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2))
	},
}
