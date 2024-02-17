require('dotenv').config();
const CyclicDB = require('@cyclic.sh/dynamodb');
const DATABASE_TOKEN = process.env.CYCLIC_DB;
const database = CyclicDB(DATABASE_TOKEN);



async function getMainThreadId(chatID) {
    const db = database.collection('Groups');
    var key = chatID.toString();

    const groups = await getGroups();

    if(groups.indexOf(chatID) === -1) return undefined;

    var item = await db.get(key);

    if(item.props.threadID === -1) return undefined;

    return item.props.threadID;
}

async function getGroups() {

    const db = database.collection('Groups');
    const {results : groupsData} = await db.list();

    var groupsList = [];

    groupsData.map(obj => {
        const chatID = obj.key;
        groupsList.push(chatID);
    });

    console.log("Groups List: " + groupsList);

    return groupsList;
}

async function setMainThreadId(chatID, threadID) {

    const db = database.collection('Groups');
    var key = chatID.toString();
    console.log("Trying to set Thread ID to: " + threadID + " :");
    if(threadID != undefined) {
        await db.set(key , {
            "threadID": threadID
        });
    }

    else {
        await db.set(key, {"threadID": -1});
    }

    var test = await db.get(key);

    console.log("" + chatID + " 's Thread ID has been set to " + test.props.threadID);

}

module.exports = { setMainThreadId, getMainThreadId, getGroups };
