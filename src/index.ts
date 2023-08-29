import { Client, GatewayIntentBits, Partials, Events, Interaction, CacheType, REST, Routes, MessageReaction, PartialMessageReaction, PartialUser, User, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js'
import * as dotenv from 'dotenv'
import { CommandManager } from './CommandManager';
import { ReactionManager } from './ReactionManager';
import { GuildConfigManager } from './GuildConfig';

// Setup some basic stuff
process.chdir(__dirname)
dotenv.config()

// Setup command and reaction manager
const commandMgr = new CommandManager("./commands/")
const reactionMgr = new ReactionManager("./reactions/")

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
		const data: any = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID || ""), { body: commandMgr.getSlashCommandsAsJSON() });		

		await client.login(process.env.DISCORD_TOKEN || "")
		console.log(`Logged in! (Managing dungeons raids for ${(await client.guilds.fetch()).size} Guild)`)
	} catch(error: any) {
		console.error("Application Error! Exiting....");		
		console.error(error)
		
		process.exit(-1)
	}

	// Register Discord-Handlers
	client.on(Events.MessageReactionAdd, (reaction: MessageReaction|PartialMessageReaction, user: User|PartialUser) => {reactionMgr.handler(reaction, user)})
	client.on(Events.InteractionCreate, (i: Interaction<CacheType>) => {commandMgr.handler(i as ChatInputCommandInteraction|ButtonInteraction)})
} ());
