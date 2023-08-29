import { ButtonInteraction, CacheType, ChatInputCommandInteraction, Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody} from 'discord.js'
import * as fs from 'node:fs'
import { ICommand } from './ICommand'

export class CommandManager {
	private m_commands: Map<String, ICommand>

	constructor(path: string) {
		this.m_commands = new Map<string, ICommand>()

		this.loadCommands(path);
	}

	async handler(interaction: ChatInputCommandInteraction<CacheType>|ButtonInteraction<CacheType>): Promise<void> {
		let commandName = interaction.isButton() 
			? (interaction as ButtonInteraction).customId
			: (interaction as ChatInputCommandInteraction).commandName
		
		const command = this.m_commands.get(commandName)

		// Verify if command exists
		if(!command) {
			console.warn(`Tried to run command ${commandName} which does not exist!`)
			return
		}

		// Check permissions
		const permissionCheck = await command.checkPermission(interaction)
		if(permissionCheck.message) {
			interaction.reply({content: permissionCheck.message!, ephemeral: permissionCheck.ephermal !== undefined ? permissionCheck.ephermal : true})

			return
		}
			
		// Execute command
		const commandReturn = await command.execute(interaction)
		if(commandReturn.message) {
			interaction.reply({content: commandReturn.message, ephemeral: commandReturn.ephermal !== undefined ? commandReturn.ephermal : true})
			
			return
		}
	}

	getSlashCommandsAsJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
		let tmpCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

		for(const [name, command] of this.m_commands) {
			if(command.slashCommand)
				tmpCommands.push(command.slashCommand.toJSON())
		}

		return tmpCommands
	}

	private loadCommands(commandPath: string): void {
		// Check if command path exists
		if(!fs.existsSync(commandPath)) {
			console.error("Command Path does not exist!")

			process.exit(-1)
		}

		const commandFiles = fs.readdirSync(commandPath)
		for(const file of commandFiles) {
			const command: ICommand = require(`${commandPath}/${file}`)["default"] as ICommand
			
			if(this.m_commands.get(command.name))
				throw new Error(`Tried to register a command that's already registered. ${command.name}`)

			this.m_commands.set(command.name, command)
		}
	}
}