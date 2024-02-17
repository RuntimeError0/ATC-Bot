var usaco = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=25&upcoming=true&format=json";
var codechef = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=2&upcoming=true&format=json";
var atcoder = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=93&upcoming=true&format=json";
var codeforces = "https://clist.by/api/v4/contest/?username=RuntimeError0&api_key=f11119d090d20aecdb2835c60d564587b92ac06a&resource_id=1&upcoming=true&format=json";
const database = require('./database');
const ALL_NAMES = ["Codeforces" , "AtCoder", "Codechef", "USACO"];
var ALL_PLATFORMS = new Map();

ALL_PLATFORMS.set("Codeforces", codeforces);
ALL_PLATFORMS.set("AtCoder", atcoder);
ALL_PLATFORMS.set("Codechef", codechef);
ALL_PLATFORMS.set("USACO", usaco);


async function makeAPICall(endpoint) {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
}

async function makeMultipleAPICalls(endpoints) {
    const promises = endpoints.map(makeAPICall);
    const responses = await Promise.all(promises);
    return responses;
}

async function isUserAdmin(ctx, userID, chatID) {

    const user = await ctx.api.getChatMember(chatID, userID);

    console.log("CHECKING IF THE USER IS ADMIN: ");
    console.log(user);

    const admin =  user.status == "administrator" || user.status == "creator";

    return admin;

}

async function getAllContests(maxtime) {

    let message = "<b> <i>Upcoming Contests in 7 Days</i> </b>\n\n";
    let allContests = [];

    const responses = await makeMultipleAPICalls([codeforces, atcoder, codechef, usaco]);

    var plat = 0;
    const platnames = ["Codeforces", "AtCoder", "Codechef", "USACO"];
    for(var data of responses) {

        console.log("Got Data from : " + platnames[plat]);
        console.log(data.objects);
        
        
        for(var contest of data.objects) {
          
            let msg = "";

            msg += "<b>Name:</b> " + contest.event + '\n';

            var dt = new Date(contest.start);
            var now = new Date();
            var dateFormat = new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Damascus",
                hour: "numeric",
                minute: "numeric",
                year: "numeric",
                day: "numeric",
                month: "numeric"
            
            });
            var hourdiff = 0;
            var lastdate = dateFormat.format(dt);
            var start = dt - now;
            var daydiff = Math.floor(start / (1000 * 60 * 60 * 24));  

            if(daydiff > maxtime || daydiff < 0) continue;
            msg += "<b>Platform:</b> " + platnames[plat] + '\n';
            msg += "<b>Date:</b> " + lastdate + '\n';
            if(daydiff > 0) { 
                msg += "<b>Time Left:</b> " +  daydiff + " days left\n";
            }
            else {
                hourdiff = diff_hours(dt, now);
                msg += "<b>Time Left:</b> " + hourdiff + " hours left\n";
            }

            var pair = {"key": daydiff, "value": msg, "hour": hourdiff};
            allContests.push(pair);
        }

        allContests.sort((a,b) => {
            if(a.key < b.key) return -1;
            else if(a.key == b.key) {
                if(a.hour < b.hour) return -1;
                else if(a.hour == b.hour) return 0;
                else return 1;
            }
            else return 1;
        })

        plat = plat + 1;
    }

    for(let one of allContests) {
        message += one.value + '\n';
    }

    return message;

}

async function updateContestsDaily(bot) {

        const toSend = await getAllContests(7);
        console.log("GOT TO PREV DAY != DAY");

        var groups = await database.getGroups();
        console.log("GOT MESSAGE: ");
        var threadIDs = [];
        console.log(toSend);

        var cnt = 0;
        groups.forEach(async chatID => {
            threadIDs[cnt] = await database.getMainThreadId(chatID);
            console.log("Set Chat ID " + chatID + " 's Thread ID to " + threadIDs[cnt]);
            cnt = cnt + 1;
        });

        cnt = 0;
        groups.forEach(async chatID => {
            
            const threadID = threadIDs[cnt];

            
            bot.api.sendMessage(chatID, toSend, {
                parse_mode: "HTML",
                message_thread_id: threadID
            });
            console.log("Sent Message to Chat ID: " + chatID + " Thread ID: " + threadID);
            cnt = cnt + 1;
        });



    }



function diff_hours(dt2, dt1) 
 {

    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff));
  
 }

async function getContests(chatid, name, api, threadid, maxtime) {
    var response;
    var data;
    try {
        response = await fetch(api);
        data = await response.json();
    } catch(err) {
        console.log("Error: " + err);
    }
    console.log("GOT SOME HUGE DATA FROM " + name);
    console.log(data.objects);
    let message = "<b> <i>" + name + " Upcoming Contests: </i> </b>\n\n";
    let allContests = [];
    
    for(var contest of data.objects) {
        
        
        let msg = "";

        msg += "<b>Name:</b> " + contest.event + '\n';

        var dt = new Date(contest.start);
        var now = new Date();
        var dateFormat = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Damascus",
            hour: "numeric",
            minute: "numeric",
            year: "numeric",
            day: "numeric",
            month: "numeric"
            
        });
        var lastdate = dateFormat.format(dt);
        var start = dt - now;
        var daydiff = Math.floor(start / (1000 * 60 * 60 * 24));  
        var hourdiff = 0;
        if(daydiff > maxtime || daydiff < 0) continue;

        msg += "<b>Platform:</b> " + name + '\n';
        msg += "<b>Date:</b> " + lastdate + '\n';
        if(daydiff > 0) { 
            msg += "<b>Time Left:</b> " +  daydiff + " days left\n";
        }
        else {
            hourdiff = diff_hours(dt, now);
            msg += "<b>Time Left:</b> " + hourdiff + " hours left\n";
        }

        var pair = {"key": daydiff, "value": msg, "hour": hourdiff};
        allContests.push(pair);
    }

    allContests.sort((a,b) => {
        if(a.key < b.key) return -1;
        else if(a.key == b.key) {
            if(a.hour < b.hour) return -1;
            else if(a.hour == b.hour) return 0;
            else return 1;
        }
        else return 1;
    })

    for(one of allContests) {
        message += one.value + '\n';
    }

    return message;

}

function getDayNow() {

    var now = new Date();
    var dateFormat = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Damascus",
        day: "numeric"
    });
    
    var day = dateFormat.format(now);

    return day;
}

module.exports = {getAllContests, getContests, updateContestsDaily, getDayNow, isUserAdmin};