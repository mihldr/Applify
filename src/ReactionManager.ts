import * as fs from 'node:fs'
import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js'
import { IReaction } from './IReaction'

export class ReactionManager {
	private reactions: Map<String, IReaction>

	constructor(path: string) {
		this.reactions = new Map()

		this.loadReactions(path);
	}

	async handler(reaction: MessageReaction|PartialMessageReaction, user: User|PartialUser): Promise<void> {
		const reactionFile = this.reactions.get(reaction.emoji.toString())
		
		// Verify if reaction exists
		if(!reactionFile)
			return

		// Check permissions
		if(!(await reactionFile.checkPermission(reaction, user)).status)
			return

		// Execute command
		await (reactionFile.execute(reaction, user))
	}

	private loadReactions(reactionPath: string): void {
		// Check if command path exists
		if(!fs.existsSync(reactionPath)) {
			console.error("Reaction Path does not exist!")

			process.exit(-1)
		}

		const reactionFiles = fs.readdirSync(reactionPath)
		for(const file of reactionFiles) {
			if(file.includes("placeholder"))
				continue

			const reaction: IReaction = require(`${reactionPath}/${file}`)["default"] as IReaction
			
			if(!reaction || !("name" in reaction))
				throw new Error(`Failed to register a reaction due to missing name or not exported correctly. ${file}`)

			if(this.reactions.get(reaction.name))
				throw new Error(`Tried to register a reaction that's already registered. ${reaction.name}`)

			this.reactions.set(reaction.name, reaction)
		}
	}
}