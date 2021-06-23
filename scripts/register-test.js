const auth = require('../token.json')
const Discord = require('discord.js')
const { exit } = require('process')

const testGuildID = "467313439413501983"
const interactions = require('../interactions.json')

const intents = new Discord.Intents()
const client = new Discord.Client({ intents })

client.once('ready', async () => {
	console.log('Running TestGuild command list update')

	let testGuild = await client.guilds.fetch(testGuildID)
	let commands = await testGuild.commands.fetch()

	for (let cmd of commands.array()) {
		console.log(cmd.name)
		if (!interactions.find(int => int.name == cmd.name)) {
			console.log(`Found registered command ${cmd.name} with no matching interaction - removing it`)
			await cmd.delete()
		}
	}

	for (let interaction of interactions) {
		console.log(`Registering command ${interaction.name}`)
		await testGuild.commands.create(interaction)
	}
	console.log('TestGuild command list update completed')
	exit(0)
})

client.on('error', console.error)
client.login(auth.token)
