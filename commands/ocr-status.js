/** @typedef {import("discord.js").CommandInteraction} CommandInteraction */
const config = require('../data/config.json')

module.exports = {
	interaction: {
		name: 'ocr-status',
		description: 'Checks if ocr is enabled in current channel',
		options: [],
	},
	/** @param {CommandInteraction} inter */
	handler(inter) {
		inter.reply({
			content: `OCR is ${config.enabledChannels.includes(inter.channelId) ? 'enabled' : 'disabled'} in this channel`,
			ephemeral: true,
		})
	},
}
