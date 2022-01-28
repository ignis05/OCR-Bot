const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const { recognize } = require('tesseract.js')

/** @typedef {import("discord.js").MessageAttachment} MessageAttachment */

// after call limit is reached this changes to false for 10 minutes to not waste time waiting for api calls that will fail
var useOcrSpaceApi = true

/**
 * Transcribes image using ocr.space api call
 * @param {string} url url of image
 * @returns {Promise<string>} resolved text
 */
function ocrSpaceApi(url) {
	return new Promise(async (resolve, reject) => {
		const data = new FormData()
		data.append('url', url)
		data.append('language', 'pol')
		data.append('scale', 'true')
		data.append('OCREngine', '1')
		axios
			.post('https://api.ocr.space/parse/image', data, {
				headers: {
					apikey: 'helloworld',
					...data.getHeaders(),
				},
				maxContentLength: Infinity,
				maxBodyLength: Infinity,
			})
			.then((res) => {
				let text = res.data?.ParsedResults?.[0]?.ParsedText
				if (text !== undefined) resolve(text)
				else reject('no text')
			})
			.catch((err) => {
				console.log(err.response?.data)
				reject('api call failed')
			})
	})
}

/**
 * Uses tesseract to transcribe image
 * @param {MessageAttachment.attachment} attachment attachment stream/buffer
 * @returns {Promise<string>} resolved text
 */
function tesseractOcr(attachment) {
	return new Promise(async (resolve, reject) => {
		var res = await recognize(attachment, 'pol', { errorHandler: console.error })
		var resmsg = res.data?.text
		if (resmsg !== undefined) resolve(resmsg)
		else reject('failed')
	})
}

/**
 * @typedef {Object} multiOcrRes
 * @property {boolean} success
 * @property {string} [text]
 */

/**
 * Runs ocr using api or tesseract if api limit is reached
 * @param {MessageAttachment} attachment
 * @returns {Promise<multiOcrRes>} Promise with object coitaining success bool and text.
 */
module.exports = function multiOcr(attachment) {
	return new Promise(async (resolve) => {
		if (useOcrSpaceApi) {
			try {
				var ocrSpaceRes = await ocrSpaceApi(attachment.url)
			} catch (err) {
				if (err == 'api call failed') {
					console.log('api call failed')
					useOcrSpaceApi = false
					setTimeout(() => {
						useOcrSpaceApi = true
						console.log('internal api timeout finished')
					}, 180000) // 3 min
				}
			}
		}
		if (ocrSpaceRes !== undefined) {
			console.log('ocr.space api call successful')
			return resolve({ success: true, text: ocrSpaceRes })
		}

		tesseractOcr(attachment.attachment)
			.then((res) => {
				console.log('tesseract ocr successful')
				resolve({ success: true, text: res })
			})
			.catch(() => {
				resolve({ success: false })
			})
	})
}
