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

/** Singleton class to manage all discord servers this bot is in.
 * Basic persistence using local json files
 */
class GuildConfigManager {
	private static DEFAULT_PATH: string = "./guildconfigs"

	private configPath: string

	private constructor(path: string = GuildConfigManager.DEFAULT_PATH) {
		this.configPath = path

		if(!fs.existsSync(this.configPath))
			fs.mkdirSync(this.configPath)
	}

	/** Get a guildconfig with extra functions to flush/persist changes. 
	 * Generates a default config if isn't existing yet.
	 * 
	 * @param guildId The guildconfig given by its guild id to fetch
	 * @returns 
	 */
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


	/** Method to read the local json file and parse its content
	 * 
	 */
	private loadGuildConfig(guildId: string): IGuildConfig {
		const filePath = `${this.configPath}/${guildId}.json`

		if(!fs.existsSync(filePath))
			GuildConfigManager.createDefaultConfig(filePath, guildId)
		
		return JSON.parse(fs.readFileSync(filePath).toString()) as IGuildConfig
	}


	/** Create a default guild config 
	 * 
	 * @param filePath 
	 * @param guildId 
	 */
	private static createDefaultConfig(filePath: string, guildId: string) {
		const guildConfig: IGuildConfig = {
			applicationMessage: {}
		}

		fs.writeFileSync(filePath, JSON.stringify(guildConfig))
	}

	/** Singleton pattern
	 * 
	 */
	private static INSTANCE: GuildConfigManager
	public static i(path: string = GuildConfigManager.DEFAULT_PATH): GuildConfigManager {
		if(!GuildConfigManager.INSTANCE)
			GuildConfigManager.INSTANCE = new GuildConfigManager(path)

		return GuildConfigManager.INSTANCE
	}
}

export {GuildConfigManager, IGuildConfig, IGuildConfigExtra}