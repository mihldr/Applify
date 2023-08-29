import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder, GuildMember, GuildTextBasedChannel, TextChannel, CategoryChannel, Guild, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Interaction, ButtonInteraction, GuildChannel, ChannelType, ContextMenuCommandAssertions, DiscordAPIError } from "discord.js";
import { GuildConfigManager, IGuildConfig, IGuildConfigExtra } from "../GuildConfig";
import { IInteraction } from "../IInteraction";
import { IPromiseStatus } from "../IPromiseStatus";
import dedent from "dedent-js";


const commandName = "startapplication"
const command: IInteraction = {
	name: commandName,
	
	checkPermission: async function (i: Interaction<CacheType>): Promise<IPromiseStatus> {
		let interaction = i as ButtonInteraction

		return new Promise(async (resolve) => {
			let guildconfig = GuildConfigManager.i().get(interaction.guildId!)
			let member = interaction.member! as GuildMember

			// Check if button is even associated to a current application process
			if(!(interaction.message.id in guildconfig.applicationMessage))
				return resolve({status: false, message: "Button is not associated to any application channel", ephermal: true})

			// Check if member has an open application already
			let alreadyOpenFoundIndex = guildconfig.applicationMessage[interaction.message.id].openApplicants.findIndex((o) => o.memberId === member.id)
			if(alreadyOpenFoundIndex !== -1) {
				try {
					await interaction.guild?.channels.fetch(guildconfig.applicationMessage[interaction.message.id].openApplicants[alreadyOpenFoundIndex].channelId) as TextChannel
					
					return resolve({status: false, message: "You're already having an open application!", ephermal: true})
				} catch(e: any) {
					// Remove faulty entry from guildconfig
					guildconfig.applicationMessage[interaction.message.id].openApplicants.splice(alreadyOpenFoundIndex, 1)
					guildconfig.flush()
				}					
			}
				

			return resolve({status: true})
		})
	},

	execute: async function (i: Interaction<CacheType>): Promise<IPromiseStatus> {
		let interaction = i as ButtonInteraction
		
		return new Promise(async (resolve) => {
			let guildconfig = GuildConfigManager.i().get(interaction.guildId!)
			let member = interaction.member! as GuildMember	
	
			// Get category
			let category = (await interaction.guild!.channels.fetch(guildconfig.applicationMessage[interaction.message.id].applicationCategory)) as CategoryChannel

			// Generate a new channel inside category
			let newChannel = await interaction.guild?.channels.create({
				name: `${member.displayName}`,
				type: ChannelType.GuildText, 
				parent: category.id
			}) as TextChannel

			// Abort if channel couldn't be generated
			if(!newChannel)
				return resolve({status: false, message: "Failed to generate new channel!", ephermal: false})
			newChannel.lockPermissions()
			newChannel.permissionOverwrites.edit(member.id, {SendMessages: true, ViewChannel: true},)


			// Send Info into private channel
			newChannel.send({content: guildconfig.applicationMessage[interaction.message.id].initialApplicationText})

			// Generate a vote
			let voteChannel = await interaction.guild?.channels.fetch(guildconfig.applicationMessage[interaction.message.id].voteChannel) as TextChannel
			let newMessage = await voteChannel.send({content: `Application for **${member.displayName}** (Channel: ${newChannel.toString()})`})
			newMessage.react("👍")
			newMessage.react("👎")
			newMessage.startThread({name: `Discussionthread for ${member.displayName}`})

			// Add member to open applications
			guildconfig.applicationMessage[interaction.message.id].openApplicants.push({memberId: member.id, channelId: newChannel.id})
			guildconfig.flush()

			resolve({status: true, message: `Your application channel has been created, please check ${newChannel}`, ephermal: true})
		})
	}
}

export default command;