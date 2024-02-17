require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const database = require('./database');
const Telegram = require('grammy');
const TOKEN = process.env.TOKEN;
const bot = new Telegram.Bot(TOKEN);
const contests = require('./contests');

bot.command('start', async (ctx) => {

    var chatID = ctx.message.chat.id;
    var threadID = undefined;

    if(ctx.message.is_topic_message) {
        threadID = ctx.message.message_thread_id;
    }

    bot.api.sendMessage(chatID, "Hello! Welcome to Aleppo Teenagers Competitors' Bot!\nIf you are in a supergroup, Make sure to use the command /setmainchannel", {
        parse_mode: "HTML",
        message_thread_id: threadID
    });

});

/*bot.command('testmainchannel', async (ctx) => {
    var chatID = ctx.message.chat.id;

    var threadID = await database.getMainThreadId(chatID);

    if(ctx.message.chat.type == "private") {
        bot.api.sendMessage(chatID, "You cannot do that in a private chat!");
        return;
    }

    if(!contests.isUserAdmin(ctx, userID, chatID)) {
        bot.api.sendMessage(chatID, "You aren't allowed to do that!", {
            message_thread_id: threadID
        });
        return;
    }


    bot.api.sendMessage(chatID, "Testing Main Channel! " , {
        message_thread_id: threadID
    })

});*/

bot.command('setmainchannel', async (ctx) => {
    
    var userID = ctx.from.id;
    var chatID = ctx.message.chat.id;
    var threadID = undefined;

    if(ctx.message.chat.type == "private") {
        bot.api.sendMessage(chatID, "You cannot do that in a private chat!");
        return;
    }

    if(ctx.message.is_topic_message) {
        threadID = ctx.message.message_thread_id;
    }

    const isadmin = contests.isUserAdmin(bot, userID, chatID);

    if(!isadmin) {
        bot.api.sendMessage(chatID, "You aren't allowed to do that!", {
            message_thread_id: threadID
        });
        return;
    }

    await database.setMainThreadId(chatID, threadID);

    bot.api.sendMessage(chatID, "<b>This channel has been set as main channel successfully!</b>" , {
        parse_mode: "HTML",
        message_thread_id: threadID
    })
});

/*bot.command("testdaily", async (ctx) => {
    var chatID = ctx.message.chat.id;
    var threadID = undefined;
    if(ctx.message.is_topic_message) {
        threadID = ctx.message.message_thread_id;
    }

    if(ctx.message.chat.type == "private") {
        bot.api.sendMessage(chatID, "You cannot do that in a private chat!");
        return;
    }

    if(!contests.isUserAdmin(ctx, userID, chatID)) {
        bot.api.sendMessage(chatID, "You aren't allowed to do that!", {
            message_thread_id: threadID
        });
        return;
    }


    await bot.api.sendMessage(chatID, "Sending Updates to All Group Chats...", {
        message_thread_id: threadID
    })

    await contests.updateContestsDaily(bot);
});
*/


bot.command("contests", async (ctx) => {

    var chatID = ctx.message.chat.id;
    var threadID = undefined;
    if(ctx.message.is_topic_message) {
        threadID = ctx.message.message_thread_id;
    }

    const msg = ctx.message;
    const txt = msg.text;
    const platform = txt.substring(txt.indexOf(" ") + 1);
    platform = platform.toLowerCase();
    var usaco = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=25&upcoming=true&format=json";
    var codechef = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=2&upcoming=true&format=json";
    var atcoder = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=93&upcoming=true&format=json";
    var codeforces = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=1&upcoming=true&format=json";
    const topic = ctx.message.is_topic_message ? ctx.message.message_id : undefined;
    if(platform == "codeforces") {
        const tosend = await contests.getContests(msg.chat.id, "Codeforces", codeforces ,topic,7);
        bot.api.sendMessage(chatID, tosend, {
            parse_mode: "HTML",
            message_thread_id: threadID
        });
    }

    else if(txt == "/contests" || txt == "/contests@atc_contestsbot") {
        const tosend = await contests.getAllContests(7);
        bot.api.sendMessage(chatID, tosend, {
            parse_mode: "HTML",
            message_thread_id: threadID
        });
    }

    else if(platform == "codechef") {
        const tosend = await contests.getContests(msg.chat.id, "Codechef", codechef, topic, 7);
        bot.api.sendMessage(chatID, tosend, {
            parse_mode: "HTML",
            message_thread_id: threadID
        });
    }

    else if(platform == "atcoder") {
        const tosend = await contests.getContests(msg.chat.id, "AtCoder", atcoder, topic, 7);
        bot.api.sendMessage(chatID, tosend, {
            parse_mode: "HTML",
            message_thread_id: threadID
        });
    }

    else if(platform == "usaco") {
        const tosend = await contests.getContests(msg.chat.id, "USACO", usaco, topic, 7);
        bot.api.sendMessage(chatID, tosend, {
            parse_mode: "HTML",
            message_thread_id: threadID
        });
    }

    else {
        bot.api.sendMessage(chatID, "Unknown command, do /help", {
            parse_mode: "HTML",
            message_thread_id: threadID
        });
    }

});

app.post('/webhook', Telegram.webhookCallback(bot, "express"));

app.post('/update', async (req, res) => {
    await contests.updateContestsDaily(bot);
    return res.status(200).send();
});

app.listen(3000, () => {
    
    bot.api.setWebhook("" + process.env.SERVER_URL + "/webhook");
    console.log("Running!");
    
})

module.exports = { bot };