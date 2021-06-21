const auth = require('../token.json')
const Discord = require('discord.js')
const { exit } = require('process')

const testGuildID = "467313439413501983"

const intents = new Discord.Intents()
const client = new Discord.Client({ intents })

client.once('ready', async () => {
	console.log('Clearing all commands registered on testGuild')
	let testGuild = await client.guilds.fetch(testGuildID)
	let commands = await testGuild.commands.fetch()
	for (let cmd of commands.array()) {
		console.log(`Removing ${cmd.name}`)
		await cmd.delete()
	}
	console.log('TestGuild command list purge completed')
	exit(0)
})

client.on('error', console.error)
client.login(auth.token)
