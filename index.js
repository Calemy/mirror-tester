const fetch = require("node-fetch")
const fs = require("fs")
const Logger = new(require("cutesy.js"))().blue()
const config = require("./config")

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

    if(config.tests.direct){
        Logger.blue().send("Testing Direct")
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
            file = await fetch(`${config.server[i].url}/d/${set.id}`)
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

async function direct(i){
    Logger.changeTag(config.server[i].name)[config.server[i].color || "blue"]()

    let timeout = 0;
    let time = 0;

    for(let j = 0; j < 51; j++) {
        try {
            let start = Date.now()
            const request = await fetch(`${config.server[i].api}/search?limit=50`)
            const s = await request.json()
            const end = Date.now()
            if(j > 0) time += (end - start)
        } catch (e) {
            timeout++
            Logger.send("request timed out")
        }
    }

    Logger.send(`Search took on average ${Math.floor(time / (50 - timeout))}ms in 50 Attempts and timed out ${timeout} times`)
}