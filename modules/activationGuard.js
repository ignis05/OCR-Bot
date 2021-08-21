/** @typedef {import("discord.js").Message} Message */
/** @typedef {import("discord.js").CommandInteraction} CommandInteraction */
const fs = require('fs')

/**
 * Checks if bot has been activaed on a guild and handles activation
 * @param {(Message|CommandInteraction)} data msg or interaction
 * @param {Object} config config object
 * @returns {boolean} true if access denied
 */
module.exports = function activationGuard(data, config) {
	// if activated then skip
	if (config.enabledGuilds.includes(data.guildId)) return false

	// activate when any message/interaction from owner is sent in guild
	if (data.member.id === data.client.application.owner.id) {
		config.enabledGuilds.push(data.guildId)
		console.log(`Bot activated in a new guild **${data.guild.name}**`)
		fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2))
		data.client.application.owner.send(`Bot activated in a new guild **${data.guild.name}**`)
		return false
	}
	return true
}
