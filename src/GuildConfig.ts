import { Guild } from 'discord.js'
import * as fs from 'node:fs'

interface IGuildConfig {
	applicationMessage: {[channelId: string]: {
		applicationCategory: string
		voteChannel: string
		openApplicants: {channelId: string, memberId: string}[],
		introductionTitle: string|undefined,
		introductionContent: string|undefined,
		initialApplicationText: string|undefined,
	}}
}

interface IGuildConfigExtra extends IGuildConfig {
	flush: () => void
}

class GuildConfigManager {
	private static DEFAULT_PATH: string = "./guildconfigs"

	private configPath: string

	private constructor(path: string = GuildConfigManager.DEFAULT_PATH) {
		this.configPath = path

		if(!fs.existsSync(this.configPath))
			fs.mkdirSync(this.configPath)
	}

	public get(guildId: string): IGuildConfigExtra {
		let guildconfigLoaded = this.loadGuildConfig(guildId)
		
		let guildConfig: IGuildConfigExtra = {
			...guildconfigLoaded,
			flush: () => {
				// get rid of the flush method (we don't want to persist it)
				let copy: any = {...guildConfig}
				
				// Delete extra methods
				delete copy.flush

				// Write File
				fs.writeFileSync(`${this.configPath}/${guildId}.json`, JSON.stringify(copy))
			},

		}

		return guildConfig
	}

	private loadGuildConfig(guildId: string, forceRefresh: boolean = false): IGuildConfig {
		const filePath = `${this.configPath}/${guildId}.json`

		if(!fs.existsSync(filePath))
			GuildConfigManager.createDefaultConfig(filePath, guildId)
		
		return JSON.parse(fs.readFileSync(filePath).toString()) as IGuildConfig
	}

	private static createDefaultConfig(filePath: string, guildId: string) {
		const guildConfig: IGuildConfig = {
			applicationMessage: {}
		}

		fs.writeFileSync(filePath, JSON.stringify(guildConfig))
	}

	private static INSTANCE: GuildConfigManager
	public static i(path: string = GuildConfigManager.DEFAULT_PATH): GuildConfigManager {
		if(!GuildConfigManager.INSTANCE)
			GuildConfigManager.INSTANCE = new GuildConfigManager(path)

		return GuildConfigManager.INSTANCE
	}
}

export {GuildConfigManager, IGuildConfig, IGuildConfigExtra}