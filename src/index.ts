import { Client, GatewayIntentBits, Partials, Events, Interaction, CacheType, REST, Routes, MessageReaction, PartialMessageReaction, PartialUser, User, ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction } from 'discord.js'
import * as dotenv from 'dotenv'
import { InteractionManager } from './InteractionManager';
import { GuildConfigManager } from './GuildConfig';

// Setup some basic stuff
process.chdir(__dirname)
dotenv.config()

// Setup CommandManager/-Handler
const interactionManager = new InteractionManager("./interactions/")

// Setup Discord Client
const client = new Client({
	intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers ],
    partials: [ Partials.Message, Partials.Reaction, Partials.GuildMember ]
}) 

// Initialize GuildConfigManger instance
const guilconfigMgr: GuildConfigManager = GuildConfigManager.i();

(async function() {
	try {
		// Send Application Commands to Discord
		const rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN || "")
		const data: any = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""), { body: interactionManager.getSlashCommandsAsJSON() });		

		await client.login(process.env.DISCORD_TOKEN || "")
		console.log(`Logged in! (Managing dungeons raids for ${(await client.guilds.fetch()).size} Guild)`)
	} catch(error: any) {
		console.error("Application Error! Exiting....");		
		console.error(error)
		
		process.exit(-1)
	}

	// Register Discord-Handlers
	client.on(Events.InteractionCreate, (i: Interaction<CacheType>) => {
		interactionManager.handler(i as ChatInputCommandInteraction|ButtonInteraction|ModalSubmitInteraction)
	})
} ());
