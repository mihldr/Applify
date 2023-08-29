import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder, GuildMember, TextChannel, CategoryChannel, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Interaction } from "discord.js";
import { GuildConfigManager, IGuildConfigExtra } from "../GuildConfig";
import { ICommand } from "../ICommand";
import { IPromiseStatus } from "../IPromiseStatus";


const commandName = "create-application-channel"
const command: ICommand = {
	name: commandName,
	slashCommand: new SlashCommandBuilder()
		.setName(commandName)
		.addChannelOption(r => {
			return r
				.setName("application-category")
				.setRequired(true)
				.setDescription("Specify the category in which application-channels should be generated in.")
		})
		.addChannelOption(r => {
			return r
				.setName("vote-channel")
				.setRequired(true)
				.setDescription("Channel used to place votes in")
		})
		.setDescription("Marks this channel as an application entypoint."),

	checkPermission: async function (i: Interaction<CacheType>): Promise<IPromiseStatus> {
		let interaction = i as ChatInputCommandInteraction

		return new Promise(async (resolve) => {
			let missingPermissions: {category: string[], vote: string[], introduction: string[]} = {category: [], vote: [], introduction: []};

			// Check if member has admin permissions
			if(!(interaction.member as GuildMember).permissions.has("Administrator"))
				return resolve({status: false, message: "Only Administrators are able to use this command!"})

			// Check if tagged channel IS CATEGORY
			let taggedCategory = interaction.options.getChannel("application-category") as CategoryChannel
			if(!(taggedCategory instanceof CategoryChannel))
				return resolve({status: false, message: `The tagged channel is not a category!`, ephermal: true})

			// Check if bot has permissions to VIEW CATEGORY
			if(!(taggedCategory.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.ViewChannel)))
				missingPermissions.category.push("View Channel")
			// Check if bot has permissions to MANAGE CHANNELS IN CATEGORY
			if(!(taggedCategory.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.ManageChannels)))
				missingPermissions.category.push("Manage Channels")
			// Check if bot has permissions to MANAGE PERMISSIONS IN CATEGORY
			if(!(taggedCategory.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.ManageRoles)))
				missingPermissions.category.push("Manage Permissions")

			// Check if bot has permissions to VIEW INTRODUCTION-CHANNEL
			if(!(interaction.channel as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.ViewChannel))
				missingPermissions.introduction.push("View Channel");
			// Check if bot has permissions to SEND MESSAGES IN INTRODUCTION
			if(!(interaction.channel as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.SendMessages))
				missingPermissions.introduction.push("Send Messages");

			// Check if bot has permissions to VIEW VOTE-CHANNEL
			if(!(interaction.options.getChannel("vote-channel") as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.ViewChannel))
				missingPermissions.vote.push("View Channel")
			// Check if bot has permissions to SEND MESSAGES IN VOTE
			if(!(interaction.options.getChannel("vote-channel") as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.SendMessages))
				missingPermissions.vote.push("Send Messages")
			// Check if bot has permissions to REACT ONTO MESSAGES IN VOTE
			if(!(interaction.options.getChannel("vote-channel") as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.AddReactions))
				missingPermissions.vote.push("Add Reactions")

			// Check if bot has any missing permissions across all relevant channels/category. If so provide a list of missing permissions
			if(missingPermissions.category.length || missingPermissions.vote.length || missingPermissions.introduction.length) {
				return resolve({status: false, ephermal: true, message: `
					The bot is missing permissions in order to function. These are the ones the bot needs to have:

					**Category (${taggedCategory.toString()}):**
					${missingPermissions.category.map(el => `- \`${el}\``).join("\n")}

					**Vote-Channel (${interaction.options.getChannel("vote-channel")!.toString()}):**
					${missingPermissions.vote.map(el => `- \`${el}\``).join("\n")}

					**Introduction-Channel (${interaction.channel!.toString()}):**
					${missingPermissions.introduction.map(el => `- \`${el}\``).join("\n")}

					Please fix these permissions and try to execute this command again.
				`.replaceAll("	", "")})
			}


			return resolve({status: true})
		})
	},

	execute: async function (i: Interaction<CacheType>): Promise<IPromiseStatus> {
		let interaction = i as ChatInputCommandInteraction
		let guildconfig: IGuildConfigExtra = GuildConfigManager.i().get(interaction.guildId!)

		return new Promise(async (res) => {
			let category = interaction.options.getChannel("application-category") as CategoryChannel
			let channel = interaction.channel as TextChannel
			let voteChannel = interaction.options.getChannel("vote-channel") as TextChannel
	
			// Button Row
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('startapplication')
						.setLabel('Start Application')
						.setStyle(ButtonStyle.Danger)
				)
	
			// Send message into channel
			let applicationMessage = await channel.send({embeds: [
				new EmbedBuilder()
					.setTitle("Application Process")
					.setFooter({text: "Attitude (Applications)", iconURL: "https://cdn.discordapp.com/app-icons/1098192239072661606/4eb518a8d9ffca9b7790b96138c2d58e.png?size=256"})
					.setColor([235, 79, 52])
					.setDescription(`Hello and welcome to our Discord server! We're thrilled to have you here and excited to hear that you're interested in joining Attitude. You can find instructions on how our application process works below.`)
					.addFields(
						{name: "1. Private Channel", value: "Click the 'Start Application' button to create a dedicated channel for your application. This channel will only be accessible to you and our members.", inline: false},
						{name: "2. Introduction", value: "We would appreciate it if you could introduce yourself to us. The bot will provide you with some example questions to help you get started.", inline: false},
						{name: "3. Voting", value: "Once you've introduced yourself, we will commence an internal voting process and contact you as soon as possible.", inline: false},
					)
			], components: [ row as any ]})
	
			// Edit Guildconfig
			guildconfig.applicationMessage[applicationMessage.id] = {
				applicationCategory: category.id, 
				openApplicants: [],
				voteChannel: voteChannel.id
			}
			guildconfig.flush()
	
	
			return res({status: true, message: `done`, ephermal: true})
		})
	}
}

export default command;