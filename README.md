# DEB (Discord Emotes Bot)
Discord Emotes Bot is a replacement of "Twitch Emotes Bot", which was a fork of [BotVentic made by 3ventic](https://github.com/3ventic/BotVentic).
I wanted something a bit more simplified in terms of features, and something to replace "Twitch Emotes Bot", as I was taking that server down ASAP, so I wrote this.

Some (if not most) of the code needs to be refactored, but currently it does its job. ¯\\\_(ツ)\_/¯.

This utilizes another project of mine called [DEP (Discord Emotes Proxy)](https://github.com/Decicus/DEP), which is a very basic [Lumen](https://lumen.laravel.com/)-based web application.

Most of the bot and web-based project was built over a span of 2-3 days.

If you wish to use my currently hosted version of the bot, please use [this link](https://discordapp.com/oauth2/authorize?client_id=218423098494550018&scope=bot&permissions=19456).

## Features
- Supports both Twitch (global/turbo/subscriber) and BetterTTV (global/channel) emotes.
    - Like BotVentic (and its fork), it checks for messages using the `hash (#)` character (capital **sensitive**) or `double colons (:)` (capital **insensitive**)
        - For capital **insensitive** emotes, it will prioritize global and Turbo emotes over subscriber ones.
        - For capital **sensitive** emotes, it does a strict check for the emote code.
        - Example: `:dansgame:` and `#DansGame` work the same, as a global emote will be prioritized: ![DansGame](https://static-cdn.jtvnw.net/emoticons/v1/33/1.0)
            - However, `#danSgame` will give you [DansGaming's](https://www.twitch.tv/dansgaming) subscriber emote: ![danSgame](https://static-cdn.jtvnw.net/emoticons/v1/109603/1.0)
- Link embedding
    - GIFs are embedded properly in Discord.
    - On a sidenote: Certain emotes that were somewhat broken in BotVentic for whatever reason, should work with this one.
- Commands:
    - There aren't very many of them, but they are all DM-based. This means you have to directly message the bot to use them. You can read more about them in the [commands](COMMANDS.md) page.

## Changelog
The full changelog can be found in the [changelog](CHANGELOG.md) file.

## Requirements
- [Node.js & npm](https://nodejs.org/) has to be installed.
- An application via the [Discord developer docs](https://discordapp.com/developers/docs/intro).
    - **Important note:** This has to be made a "bot user".
- A registered application via the [Twitch connections settings](https://www.twitch.tv/settings/connections)
    - This is used to retrieve emote information from the Twitch API.

## Installation
1. [Clone the repository](https://help.github.com/articles/cloning-a-repository/) or download the [latest release](https://github.com/Decicus/DEB/releases/latest).
2. After cloning, or extracting the release file, go into the install folder via the commandline and run `npm install` to install the dependencies.
3. Once you're finished installing dependencies, rename `config.sample.js` to `config.js`.
4. Fill in your `config.discord` values, where `client_id` and `token` are values from your [Discord developer application](https://discordapp.com/developers/applications/me) page.
    - **Please make sure to JUST replace the `YOUR_TOKEN_HERE` text with your token, or else the bot will not be able to connect properly.**
5. Fill in your Twitch developer **client ID** in `config.twitch.client_id`.
6. **[Optional]** You can add an "array" (list) of BetterTTV channel emotes you want to retrieve as well in `config.bttv`.
    - Example: `channels: ['decicus', 'iwinuloselol']` will retrieve channel-specific emotes from myself and [iwinuloselol](https://www.twitch.tv/iwinuloselol).
7. Start the bot using `node app.js`. I recommend using something like [pm2](https://github.com/Unitech/pm2) to start it instead.

## TODO
- Refactor the code.
- Handle editing of messages.

## License
[MIT License](LICENSE)
