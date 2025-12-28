import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder, GuildMember, GuildTextBasedChannel, TextChannel, CategoryChannel, Guild, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Interaction, ButtonInteraction, GuildChannel, ChannelType, ContextMenuCommandAssertions, DiscordAPIError, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { GuildConfigManager, IGuildConfig, IGuildConfigExtra } from "../GuildConfig";
import { IInteraction } from "../IInteraction";
import { IPromiseStatus } from "../IPromiseStatus";

const command: IInteraction = {
	name: "1-setup-introduction-message-",
	
	checkPermission: async function (i: Interaction<CacheType>): Promise<IPromiseStatus> {
		let interaction = i as ModalSubmitInteraction

		return new Promise(async (resolve) => {
			let member = interaction.member! as GuildMember
			
			// If for some reason someone triggers this interactions who's not an administrator...
			if(!member.permissions.has(PermissionsBitField.Flags.Administrator))
				return resolve({status: false, message: "Only Administrators are able to execute this action", ephermal: true})

			return resolve({status: true})
		})
	},

	execute: async function (i: Interaction<CacheType>): Promise<IPromiseStatus> {
		let interaction = i as ModalSubmitInteraction
		
		return new Promise(async (resolve) => {
			let guildconfig = GuildConfigManager.i().get(interaction.guildId!)

			// Get all relevant data within ModalInteraction
			const applicationMessageId = interaction.customId.replaceAll(this.name, "");
			const introductionTitle = interaction.fields.getTextInputValue("introduction-title")
			const introductionContent = interaction.fields.getTextInputValue("introduction-content")
			const initialApplicationText = interaction.fields.getTextInputValue("initial-application-text")

			// Edit temporary message with data entered
			const message = await interaction.channel?.messages.fetch(applicationMessageId)
			if(!message) return resolve({status: false, message: "Couldn't find temporary message.", ephermal: true})

			// Edit message
			await message.edit({content: "", embeds: [new EmbedBuilder()
				.setTitle(introductionTitle)
				.setFooter({text: "Application Bot", iconURL: "https://cdn.discordapp.com/app-icons/1146028585107345538/5800697528f5fdc3b9b80d588ef41efa.png?size=256"})
				.setColor([235, 79, 52])
				.setDescription(introductionContent)				
			]})

			// Double check if applicationMessageId already exists in guildconfig, if not, something's odd.
			if(!(guildconfig.applicationMessage[applicationMessageId]))
				return resolve({status: false, ephermal: true, message: "Unexpected error happened."})

			// Set relevant data in Guildconfig and flush
			guildconfig.applicationMessage[applicationMessageId].introductionTitle = introductionTitle
			guildconfig.applicationMessage[applicationMessageId].introductionContent = introductionContent
			guildconfig.applicationMessage[applicationMessageId].initialApplicationText	= initialApplicationText
			guildconfig.flush()
			
			return resolve({status: true, message: "Sucessfully setup the application-system."})
		})
	}
}

export default command;