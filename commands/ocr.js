/** @typedef {import("discord.js").MessageAttachment} MessageAttachment */
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

		if (msg.attachments.size == 0) return inter.reply({ content: `This message has no attachments.`, ephemeral: true })
		/** @type {MessageAttachment} **/
		let attachment = msg.attachments.first()
		if (!/\.(png|jpg)$/i.test(attachment.name)) return inter.reply({ content: `The attachment is not a png/jpg file.`, ephemeral: true })

		await inter.deferReply()

		console.log(`processing ocr interaction in #${msg.channel.name}`)

		let limit = 1950 - msg.url.length
		/** @type {multiOcrRes} **/
		var res = await multiOcr(attachment)
		if (res.success) {
			let resMsg = res.text
			if (!resMsg) return inter.editReply({ content: `No text found` })
			// trim message if it's too long
			if (resMsg.length > limit) resMsg = resMsg.substring(0, limit)
			inter.editReply(`[link](${msg.url})\n\`\`\`${resMsg}\`\`\``)
		} else inter.editReply(`Ocr failed.`)
	},
}
