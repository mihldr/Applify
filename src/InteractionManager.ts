import { ButtonInteraction, CacheType, ChatInputCommandInteraction, Interaction, ModalSubmitInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody} from 'discord.js'
import * as fs from 'node:fs'
import { IInteraction as IInteraction } from './IInteraction'

export class InteractionManager {
	private interactions: Map<string, IInteraction>

	constructor(path: string) {
		this.interactions = new Map<string, IInteraction>()

		this.loadInteractions(path);
	}

	async handler(i: ChatInputCommandInteraction<CacheType>|ButtonInteraction<CacheType>|ModalSubmitInteraction<CacheType>): Promise<void> {
		const interactionInput = 'customId' in i ? i.customId : i.commandName
		const interactionPair = [...this.interactions.entries()].find(([key, interaction]) => interactionInput.startsWith(key))

		// Verify if command exists, else abort
		if(!interactionPair) {
			console.warn(`There's no handler for interaction with name: ${interactionInput}`)
			return
		}

		// Destructure found interaction pair
		const [interactionName, interaction] = interactionPair

		// Check permissions
		const permissionCheck = await interaction.checkPermission(i)
		if(permissionCheck.message) {
			i.reply({content: permissionCheck.message!, ephemeral: permissionCheck.ephermal !== undefined ? permissionCheck.ephermal : true})

			return
		}

		// Execute command
		const commandReturn = await interaction.execute(i)
		if(commandReturn.message) {
			i.reply({content: commandReturn.message, ephemeral: commandReturn.ephermal !== undefined ? commandReturn.ephermal : true})
			
			return
		}
	}

	getSlashCommandsAsJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
		let tmpCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

		for(const [name, interaction] of this.interactions) {
			if(interaction.slashCommand)
				tmpCommands.push(interaction.slashCommand.toJSON())
		}

		return tmpCommands
	}

	private loadInteractions(interactionPath: string): void {
		if(!fs.existsSync(interactionPath)) {
			console.error("Interaction Path does not exist!")
			process.exit(-1)
		}

		const interactionFiles = fs.readdirSync(interactionPath)
		for(const file of interactionFiles) {
			const command: IInteraction = require(`${interactionPath}/${file}`)["default"] as IInteraction
			
			if(this.interactions.get(command.name))
				throw new Error(`Tried to register an interaction that's already registered. ${command.name}`)

			this.interactions.set(command.name, command)
		}
	}
}