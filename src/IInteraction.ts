import { CacheType, Interaction, SlashCommandBuilder } from 'discord.js'
import { IPromiseStatus } from './IPromiseStatus';

export interface IInteraction {
	/**
	 *  The name of the handler which will be used to identify which
	 *  handler to run upon an incoming interaction event
	 */
	name: string,

	/**
	 * If the handler is supposed to be tied to a discord slashcommand,
	 * the slashCommand field has to be set. This will be used to register
	 * the command within the Discord API
	 */
	slashCommand?: SlashCommandBuilder,

	/**
	 * A step before actual execution. Any requirements can be checked here,
	 * such as permissions or requirements in the guildconfig.
	 * 
	 * @param interaction 
	 * @returns 
	 */
	checkPermission: (interaction: Interaction<CacheType>) => Promise<IPromiseStatus>,

	/**
	 * The actual logic of the interaction handler
	 * 
	 * @param interaction 
	 * @returns 
	 */
	execute: (interaction: Interaction<CacheType>) => Promise<IPromiseStatus>,
}