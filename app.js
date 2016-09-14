var discord = require('discord.js');
var request = require('request');
var config = require('./config.js');
var version = "1.2.1";

var bot = new discord.Client({
    autoReconnect: true
});

var epBase = 'https://ep.decapi.me';
var urlTemplates = {
    twitch: epBase + '/t/2/{id}',
    bttv: epBase + '/b/2/{id}.{type}'
};

var emotes = {
    twitch: {},
    twitchLC: {},
    bttv: {},
    bttvLC: {}
};

var authUrl = 'https://discordapp.com/oauth2/authorize?client_id=' + config.discord.client_id + '&scope=bot&permissions=19456';

/**
 * Sends a GET request for the specified URL
 *
 * @param  {String}   url     Request URL
 * @param  {Object}   headers HTTP headers to send with the request
 * @param  {Function} cb      Callback function
 * @return {void}
 */
var get = function(url, headers, cb) {
    request({
        url: url,
        headers: headers
    }, cb);
};

/**
 * Refreshes all cached Twitch emotes.
 *
 * @return {void}
 */
var getTwitchEmotes = function() {
    get("https://api.twitch.tv/kraken/chat/emoticon_images", {'Client-ID': config.twitch.client_id}, function(error, response, body) {
        if (response.statusCode === 200) {
            body = JSON.parse(body);

            body.emoticons.forEach(function(emote) {
                var code = emote.code;

                emotes.twitch[code] = {
                    id: emote.id,
                    set: emote.emoticon_set
                };

                emotes.twitchLC[code.toLowerCase()] = code;
            });
            console.log("Added Twitch emotes");
        }

        // Global emotes override all else:
        get("https://api.twitch.tv/kraken/chat/emoticon_images?emotesets=0,457", {'Client-ID': config.twitch.client_id}, function(error, response, body) {
            if (response.statusCode === 200) {
                body = JSON.parse(body);

                body.emoticon_sets[0].forEach(function(emote) {
                    var code = emote.code;

                    emotes.twitch[code] = {
                        id: emote.id,
                        set: 0
                    };

                    emotes.twitchLC[code.toLowerCase()] = code;
                });

                body.emoticon_sets[457].forEach(function(emote) {
                    var code = emote.code;

                    emotes.twitch[code] = {
                        id: emote.id,
                        set: 457
                    };

                    emotes.twitchLC[code.toLowerCase()] = code;
                });
                console.log("Added and prioritized Twitch global emotes");
            }
        });
    });
};

/**
 * Refreshes all BTTV emotes (including channel emotes)
 *
 * @return {void}
 */
var getBttvEmotes = function() {
    get("https://api.betterttv.net/2/emotes", {}, function(error, response, body) {
        if (response.statusCode === 200) {
            body = JSON.parse(body);

            body.emotes.forEach(function(emote) {
                var code = emote.code;

                emotes.bttv[code] = {
                    id: emote.id,
                    type: emote.imageType
                };

                emotes.bttvLC[code.toLowerCase()] = code;
            });
            console.log("Added global BTTV emotes");
        }
    });

    config.bttv.channels.forEach(function(channel) {
        channel = channel.toLowerCase();
        get("https://api.betterttv.net/2/channels/" + channel, {}, function(error, response, body) {
            if (response.statusCode === 200) {
                body = JSON.parse(body);

                body.emotes.forEach(function(emote) {
                    var code = emote.code;

                    emotes.bttv[code] = {
                        id: emote.id,
                        type: emote.imageType
                    };

                    emotes.bttvLC[code.toLowerCase()] = code;
                });

                console.log("Added BTTV emotes for channel: " + channel);
            }
        });
    });
};

/**
 * Checks the specified code if it's a valid emote.
 *
 * @param  {string} code      Emote code to check for.
 * @param  {bool} lowerCase   If true, it strict-checks with case-sensitivity in mind.
 * @return {mixed}            null if no emote was found, string of URL if one was.
 */
var checkEmote = function(code, lowerCase) {
    if (lowerCase === false) {
        if (emotes.twitch[code]) {
            return urlTemplates.twitch.replace('{id}', emotes.twitch[code].id);
        }

        if (emotes.bttv[code]) {
            var emote = emotes.bttv[code];
            return urlTemplates.bttv.replace('{id}', emote.id).replace('{type}', emote.type);
        }
    }

    if (lowerCase === true) {
        if (emotes.twitchLC[code]) {
            var emote = emotes.twitch[emotes.twitchLC[code]];
            return urlTemplates.twitch.replace('{id}', emote.id);
        }

        if (emotes.bttvLC[code]) {
            var emote = emotes.bttv[emotes.bttvLC[code]];
            return urlTemplates.bttv.replace('{id}', emote.id).replace('{type}', emote.type);
        }
    }

    return null;
};

/**
 * Returns the bot's uptime, since the "ready" event was fired.
 *
 * @return {string}
 */
var uptime = function() {
    // uptime returned in milliseconds
    var seconds = (bot.uptime / 1000);
    var time = [];

    // Remember when I said I was going to refactor?
    // Yeah...
    if (seconds > 86400) {
        var days = parseInt(seconds / 86400);
        time.push(days + " day" + (days > 1 ? "s" : ""));
        seconds = seconds % 86400;
    }

    if (seconds > 3600) {
        var hours = parseInt(seconds / 3600);
        time.push(hours + " hour" + (hours > 1 ? "s" : ""));
        seconds = seconds % 3600;
    }

    if (seconds > 60) {
        var minutes = parseInt(seconds / 60);
        time.push(minutes + " minute" + (minutes > 1 ? "s" : ""));
        seconds = seconds % 60;
    }

    seconds = parseInt(seconds);
    if (seconds > 0) {
        time.push(seconds + " second" + (seconds > 1 ? "s" : ""));
    }

    return time.join(", ");
}

/**
 * Returns the current datetime.
 *
 * @return {String} Datetime
 */
var now = function() {
    return "[" + new Date().toUTCString() "] ";
};

var commands = {
    "!bttv_channels": {
        permissions: 0,
        func: function(cb) {
            var channels = config.bttv.channels.join(", ");
            cb("Current channels BetterTTV emotes are retrieved from are: " + channels);
        }
    },
    "!info": {
        permissions: 0,
        func: function(cb) {
            var msg = [
                "**Bot version:** " + version,
                "**Project URL:** https://github.com/Decicus/DEB",
                "**Server connections:** " + bot.servers.length,
                "**Uptime:** " + uptime()
            ];

            cb(msg.join("\n"));
        }
    },
    "!invite": {
        permissions: 0,
        func: function(cb) {
            cb("Use this URL to add the bot to a server you have permissions in: " + authUrl);
        }
    },
    "!quit": {
        permissions: 100,
        func: function(cb) {
            cb("Emotes bot will be shutting down in a few seconds... Goodbye!");
            setTimeout(function() {
                console.log(now() + "Shutting down bot...");
                bot.logout(function() {
                    process.exit();
                });
            }, 5000);
        }
    },
    "!update_emotes": {
        permissions: 100,
        func: function(cb) {
            getTwitchEmotes();
            getBttvEmotes();
            cb("Updating all emotes.");
        }
    },
};

bot.on('error', function(error) {
    console.log(now() + "ERROR OCCURRED:");
    console.log(error);
});

bot.on("disconnected", function() {
    console.log(now() + "Disconnected");
});

bot.on("ready", function() {
    console.log(now() + "Connected");
    config.discord.admins.forEach(function(admin) {
        bot.sendMessage(admin, now + "Emotes bot has been initialized.");
    });

    getTwitchEmotes();
    getBttvEmotes();
});

bot.on("message", function(message) {
    var text = message.content;
    var words = text.split(" ");

    // Direct messages
    if (!message.channel.server) {
        var userId = message.author.id;
        var permissions = 0;
        if (config.discord.admins.indexOf(userId) > -1) {
            permissions = 100;
        }

        var cmd = words[0];
        if (commands[cmd] && commands[cmd].permissions <= permissions) {
            commands[cmd].func(function(reply) {
                bot.sendMessage(message.channel, reply);
            }, {
                message: text.replace(cmd + " ", null),
                user: message.author
            });
        }
    }

    if (message.channel && message.channel.server) {
        var code = null;

        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var code = null;
            var lowerCase = true;

            if (word.startsWith("#")) {
                code = word.substr(1);
                lowerCase = false;
            }

            if (word.startsWith(":") && word.endsWith(":")) {
                code = word.substr(1, word.length - 2).toLowerCase();
            }

            if (code !== null) {
                var emote = checkEmote(code, lowerCase);
                if (emote !== null) {
                    bot.sendMessage(message.channel, emote, function(error, message) {
                        if (error) {
                            console.log(now() + "ERROR OCCURRED:");
                            console.log(error);
                        }
                    });
                    break;
                }
            }
        }
    }
});

bot.loginWithToken(config.discord.token);
