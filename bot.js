const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const { MessageMentions: { USERS_PATTERN } } = require('discord.js');

// Create a new Discord client instance
const discord = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// Look for commands!
discord.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Loop over them and read them!
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	discord.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
discord.once('ready', () => {
	console.log('Discord Ready!');
});

// Commands handling
discord.on('interactionCreate', async interaction => {
	if ( interaction.isCommand() ) {
		const command = discord.commands.get(interaction.commandName);
		if (!command) return;
		try {
			await command.execute(interaction,discord);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Login to Discord with your client's token
discord.login(token);
