# Applify
Applify is a minimalistic discord bot written in typescript that provides an application process for discord servers. The main use of this bot is to hide applications from the public. It consists of three different steps/functions as described below.
- **Introduction**: The applicant is able to get some initial information before applying and is given a button to start his personal own application process.
- **Application-Channel**: Upon clicking the button within the Introduction step, a new channel is being created in which the applicant is able to write a few words about themselves.
- **Vote**: Upon clicking the button within the Introduction step, the bot also generates a voting process in another dedicated discord channel with an additional thread to discuss in.

# Installation & Setup
1. Clone the project
2. Install dependencies using e.g. `npm install`
3. create an `.env` file within the root folder and define the two environment variables   
```
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
```
4. Run the bot using `npm run run-ts`
5. Add the bot to your discord server
6. Setup your channel-structure (e.g. see the `Recommended Discord-Setup` chapter)
7. Use the command `/create-application-channel` in a discord channel and follow the instructions

# Recommended Discord-Setup
Create a new category called `Applications`. Deny View-permissions to guests/_everyone_ for this category but grant those permissions to your member role.
Create a new channel called `application` within the `Applications` category. Grant _everyone_ view permissions to this channel but deny writing messages for everyone. This will also be the channel you'll use the `/create-application-channel` command in.  
Create a new channel called `votes` within the `Applications` category. Grant your Member-Role view and write permissions to this channel.  
  
  
This setup ensures, guests only having access to the channel containing the `Create-Application` button but no voting/discussion channels, while your members having access to all channels, including the dynamically created applicant-channels.

