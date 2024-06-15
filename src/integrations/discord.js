const RPC = require('discord-rpc');
const rpcClient = new RPC.Client({
    transport: 'ipc'
});
const APPLICATION_ID = '1251595332161110026';
RPC.register(APPLICATION_ID);

let wasInitialized = false;
let startTimestamp;

function onRpcReady() {
    if (wasInitialized) {
        return;
    }
    wasInitialized = true;
    startTimestamp = Date.now();
    rpcClient.setActivity({
        state: "Sur le lanceur Flashorama",
        details: "Flashorama - Heaventy Projects",
        startTimestamp: startTimestamp,
        largeImageKey: "flashoramaicon",
        instance: true,
    });
}

function updatePresence(state, details, largeImageKey) {
    rpcClient.setActivity({
        state: state,
        details: details,
        startTimestamp: startTimestamp,
        largeImageKey: largeImageKey,
        instance: true,
    });
}

function initDiscordRichPresence() {
    rpcClient.on('ready', onRpcReady);
    rpcClient.login({
        clientId: APPLICATION_ID
    }).catch(console.error);
}

module.exports = {
    initDiscordRichPresence,
    updatePresence
}