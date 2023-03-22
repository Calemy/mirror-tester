const fetch = require("node-fetch")
const fs = require("fs")
const Logger = new(require("cutesy.js"))().blue()
const config = require("./config")

const randoms = []
const ids = [];

for(var i = 0; i < 51; i++){
    randoms.push(makeid(5))
    ids.push(getRandomInt(2000000))
}

main()

const maps = []

async function main() {
    Logger.send("Beatmap Storage Speedtest")
    Logger.orange().send("Loading Beatmap Info")


    for(let i = 0; i < config.maps.length; i++) {
        const request = await fetch(`https://catboy.best/api/s/${config.maps[i]}`)
        const { Title, SetID } = await request.json()

        maps.push({title: Title, id: SetID})
    }

    if(config.tests.maps){
        Logger.reset().blue().send("Testing Maps")
        for(var i = 0; i < config.server.length; i++){
            await beatmap(i)
        }
    }

    if(config.tests.maps){
        Logger.reset().blue().send("Testing Sets")
        for(var i = 0; i < config.server.length; i++){
            await beatmapset(i)
        }
    }

    if(config.tests.direct){
        Logger.reset().blue().send("Testing Direct")
        for(var i = 0; i < config.server.length; i++){
            await direct(i)
        }
    }

    if(config.tests.download){
        Logger.reset().blue().send("Testing Download")
        for(var i = 0; i < config.server.length; i++){
            for(let j = 0; j < config.maps.length; j++){
                await download(maps[j], i)
            }
        }
    }
}

async function download(set, i){
    return new Promise(async (resolve) => {
        const start = Date.now()
        let file;
    
        try {
            file = await fetch(`${config.server[i].url}/${config.server[i].name.includes("Beatconnect") ? "b" : "d"}/${set.id}`)
            const fileStream = fs.createWriteStream(`./${set.id}-${start}.osz`);
    
            file.body.pipe(fileStream);
            fileStream.on("finish", done);
        } catch {
            
        }
    
        async function done(){
            Logger.changeTag(config.server[i].name + ` (${set.title})`)[config.server[i].color || "blue"]()
            .send(`Download completed in ${Date.now() - start}ms`)
            fs.rmSync(`./${set.id}-${start}.osz`)

            resolve()
        }
    })
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



async function direct(i){
    Logger.changeTag(config.server[i].name)[config.server[i].color || "blue"]()

    let timeout = 0;
    let time = 0;

    for(let j = 0; j < 50; j++) {
        try {
            let start = Date.now()
            const request = await fetch(`${config.server[i].api}/search?q=&limit=50`)
            const data = await request.json()
            if(data.error) throw new Error("Error!")
            const end = Date.now()
            time += (end - start)
        } catch (e) {
            timeout++
        }
    }

    Logger.send(`Search took on average ${Math.floor(time / (50 - timeout)) || 0}ms in 50 Attempts and timed out ${timeout} times`)
}

async function beatmap(i){
    Logger.changeTag(config.server[i].name)[config.server[i].color || "blue"]()

    let timeout = 0;
    let time = 0;

    for(let j = 0; j < 50; j++) {
        try {
            let start = Date.now()
            const request = await fetch(`${config.server[i].api}/${config.server[i].name.includes("Chimu") ? "map" : "b"}/${ids[j]}`)
            const data = await request.json()
            const end = Date.now()
            time += (end - start)
        } catch (e) {
            timeout++
        }
    }

    Logger.send(`Beatmaps took on average ${Math.floor(time / (50 - timeout)) || 0}ms in 50 Attempts and timed out ${timeout} times`)
}

async function beatmapset(i){
    Logger.changeTag(config.server[i].name)[config.server[i].color || "blue"]()

    let timeout = 0;
    let time = 0;

    for(let j = 0; j < 50; j++) {
        try {
            let start = Date.now()
            const request = await fetch(`${config.server[i].api}/${config.server[i].name.includes("Chimu") ? "set" : "s"}/${ids[j]}`)
            const data = await request.json()
            const end = Date.now()
            time += (end - start)
        } catch (e) {
            timeout++
        }
    }

    Logger.send(`Beatmaps took on average ${Math.floor(time / (50 - timeout)) || 0}ms in 50 Attempts and timed out ${timeout} times`)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}