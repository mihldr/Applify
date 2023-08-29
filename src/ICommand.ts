import { CacheType, Interaction, SlashCommandBuilder } from 'discord.js'
import { IPromiseStatus } from './IPromiseStatus';

export interface ICommand {
	name: string,
	slashCommand?: SlashCommandBuilder,

	checkPermission: (interaction: Interaction<CacheType>) => Promise<IPromiseStatus>,
	execute: (interaction: Interaction<CacheType>) => Promise<IPromiseStatus>,
}