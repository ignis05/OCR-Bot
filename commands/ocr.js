/** @typedef {import("discord.js").ContextMenuInteraction} ContextMenuInteraction */
const { recognize } = require('tesseract.js')

module.exports = {
	interaction: {
		name: 'OCR',
		type: 3, // message
	},
	/** @param {ContextMenuInteraction} inter */
	async handler(inter) {
		let msg = inter.options.getMessage('message')

		if (msg.attachments.size > 0) {
			await inter.deferReply()

			console.log(`running ocr in #${msg.channel.name}`)

			res = await recognize(msg.attachments.first().attachment, 'pol', { errorHandler: console.error })

			let limit = 1950 - msg.url.length
			/** @type {String} **/
			var resmsg = res.data?.text
			if (resmsg) {
				// trim message if its too long
				if (resmsg.length > limit) resmsg = resmsg.substring(0, limit)
				inter.editReply(`[link](${msg.url})\n\`\`\`${resmsg}\`\`\``)
			} else {
				inter.editReply(`Ocr failed.`)
			}
		} else inter.reply({ content: `This message has no attachments.`, ephemeral: true })
	},
}
