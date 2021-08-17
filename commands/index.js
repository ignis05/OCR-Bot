const fs = require('fs')

const commands = {}

for (let file of fs.readdirSync(__dirname).filter((file) => file.endsWith('.js'))) {
	if (file == 'index.js') continue
	let command = require(`./${file}`)
	let commandName = command.interaction.name
	commands[commandName] = command
}

module.exports = commands
