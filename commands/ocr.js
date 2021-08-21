/** @typedef {import("discord.js").ContextMenuInteraction} ContextMenuInteraction */
/** @typedef {import("../modules/ocr").multiOcrRes} multiOcrRes */
const multiOcr = require('../modules/ocr')

module.exports = {
	interaction: {
		name: 'OCR',
		type: 3, // message
	},
	/** @param {ContextMenuInteraction} inter */
	async handler(inter) {
		let msg = inter.options.getMessage('message')

		if (msg.attachments.size > 0 && (msg.attachments.first().name.endsWith('png') || msg.attachments.first().name.endsWith('jpg'))) {
			await inter.deferReply()

			console.log(`running ocr in #${msg.channel.name}`)

			let limit = 1950 - msg.url.length
			/** @type {multiOcrRes} **/
			var res = await multiOcr(msg.attachments.first())
			if (res.success) {
				let resMsg = res.text
				if (!resMsg) return inter.reply({ content: `No text found`, ephemeral: true })
				// trim message if it's too long
				if (resMsg.length > limit) resMsg = resMsg.substring(0, limit)
				inter.editReply(`[link](${msg.url})\n\`\`\`${resMsg}\`\`\``)
			} else {
				inter.editReply(`Ocr failed.`)
			}
		} else inter.reply({ content: `This message has no png/jpg attachments.`, ephemeral: true })
	},
}
