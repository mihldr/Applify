import {MessageReaction, PartialMessageReaction, PartialUser, User} from 'discord.js'
import { IPromiseStatus } from './IPromiseStatus';

export interface IReaction {
	name: string,
	checkPermission: (reaction: MessageReaction|PartialMessageReaction, user: User|PartialUser) => Promise<IPromiseStatus>,
	execute: (reaction: MessageReaction|PartialMessageReaction, user: User|PartialUser) => any,
}