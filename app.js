var discord = require('discord.js');
var request = require('request');
var config = require('./config.js');

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

bot.on("disconnected", function() {
    console.log("Disconnected");
});

bot.on("ready", function() {
    console.log("Connected");

    getTwitchEmotes();
    getBttvEmotes();
});

bot.on("message", function(message) {
    var text = message.content;

    if (message.channel && message.channel.server) {
        var words = text.split(" ");
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
                            console.log("** ERROR OCCURED:");
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
