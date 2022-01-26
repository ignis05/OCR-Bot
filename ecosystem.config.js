module.exports = {
	apps: [
		{
			name: 'OCR-Bot',
			script: 'bot.js',

			// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
			args: 'one two',
			instances: 1,
			autorestart: true,
			watch: ['bot.js', 'commands', 'modules'],
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'development',
			},
			env_production: {
				NODE_ENV: 'production',
			},
		},
	],
}
