const auth = require('./token.json')
const Discord = require('discord.js')
const { exit } = require('process')

const interactions = require('./interactions.json')

const intents = new Discord.Intents()
const client = new Discord.Client({ intents })

client.once('ready', async () => {
	console.log('Running global command list update')

	let commands = await client.application.commands.fetch()

	for (let cmd of commands.array()) {
		if (!interactions.find(int => int.name == cmd.name)) {
			console.log(`Found registered command ${cmd.name} with no matching interaction - removing it`)
			await cmd.delete()
		}
	}

	for (let interaction of interactions) {
		console.log(`Registering command ${interaction.name}`)
		await client.application.commands.create(interaction)
	}
	console.log('Global command list update completed')
	exit(0)
})

client.on('error', console.error)
client.login(auth.token)
