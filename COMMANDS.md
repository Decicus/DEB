# Commands
While this bot supports commands, as of right now they're all DM-based, which means they all have to be done by sending a direct message to the bot.

As of version 1.1.0, they can be split up into two categories:
- Admins
    - Admins are based of the `config.discord.admins` array in the config, which is based of the user's *unique IDs*.
        - You can get these by going into your "User settings" on Discord, clicking "Appearance" and checking the "Developer mode" box. Then right-click on the user you want to add as an admin, and hit "Copy ID"
        - **Note:** These user IDs need to be saved as `string`s and not `int`s in the config.
- User (everyone else)

## User commands
- `!bttv_channels` - Sends back the list of channels it retrieves BetterTTV emotes of.
- `!invite` - Gives you an invite link to add the bot to a server you have the "Manage server" permission of.
- `!info` - Sends back a message with some information about the bot (version, server connections, project URL and uptime).


## Admin commands
- `!quit` - Disconnects the bot from Discord and shuts down the process for it.
- `!update_emotes` - Refreshes the emote data.
    - **Note:** If you add one or more channels to BetterTTV channel emote list while the bot is running, then the channels that were added will not be updated until the bot has been restarted.
