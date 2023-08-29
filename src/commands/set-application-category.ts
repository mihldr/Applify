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
			// Check if member has admin permissions
			if(!(interaction.member as GuildMember).permissions.has("Administrator"))
				return resolve({status: false, message: "Only Administrators are able to use this command!"})

			// Check if bot has permissions to send messages in the channel the command was executed in.
			if(!(interaction.channel as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.SendMessages))
				return resolve({status: false, message: `The bot is missing permissions to send messages into this channel!`, ephermal: true})

			// Check if bot has permissions to send messages in into the vote channel
			if(!(interaction.options.getChannel("vote-channel") as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.SendMessages))
				return resolve({status: false, message: `The bot is missing permissions to send messages into the vote channel!`, ephermal: true})

			// Check if bot has permissions to react onto messages in into the vote channel
			if(!(interaction.options.getChannel("vote-channel") as TextChannel).permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.AddReactions))
				return resolve({status: false, message: `The bot is missing permissions to react on messages in the vote channel!`, ephermal: true})	

			// Check if tagged channel is a category
			let taggedChannel = interaction.options.getChannel("application-category")
			if(!(taggedChannel instanceof CategoryChannel))
				return resolve({status: false, message: `The tagged channel is not a category!`, ephermal: true})

			// Check if bot has permission to create channels in category
			let category = taggedChannel as CategoryChannel
			let createChannelsPermitted = category.permissionsFor(interaction.guild!.members.me!).has(PermissionsBitField.Flags.ManageChannels)
			if(!createChannelsPermitted)
				return resolve({status: false, message: `The bot is missing permission to manage channels in the tagged category.`, ephermal: true})


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