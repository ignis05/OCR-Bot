const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { exit } = require('process')

const commands = require('../commands')
try {
	var { token } = require('../data/token.json')
	var { clientId } = require('../data/clientId.json')
} catch (err) {
	console.log(`Failed to get token or client id.
  Make sure that the token in token.json is correct and that the bot can launch before running this script.`)
	exit(0)
}

const interactions = Object.values(commands).map((cmd) => cmd.interaction)

const rest = new REST({ version: '9' }).setToken(token)

const run = async () => {
	try {
		console.log('Updating registered command list:')
		console.log(interactions.map((i) => i.name).join('\n'))

		await rest.put(Routes.applicationCommands(clientId), { body: interactions })

		console.log('Successfully reloaded application commands.')
	} catch (error) {
		console.error(error)
	}
}
run()
