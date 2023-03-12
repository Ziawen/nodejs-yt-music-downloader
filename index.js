const ytdl = require("ytdl-core");
const fs = require("fs");
const axios = require("axios");
const prompt = require('prompt-sync')(); //nodejs console input libary
const ffmpeg = require('fluent-ffmpeg');
const YTAPI = "";

async function ytsearchdata(input) {
    return await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&order=viewCount&q=${encodeURI(input)}&type=video&key=${YTAPI}`);
}

async function downloadwebm(videoId) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(`./temp-music-files/${videoId}.webm`);

        ytdl(videoId, {
                filter: format => format.hasAudio === true && format.hasVideo === false && format.audioCodec === "opus" && format.container === "webm"
            })
            .pipe(fileStream)

        fileStream.on('finish', () => {
            fileStream.close();
            resolve();
        });

        fileStream.on('error', (err) => {
            reject(err);
        });

    })
}

async function main() {
    const input = prompt('Type video name :');

    let searchdata = await ytsearchdata(input); // calling yt search function with specific title input

    for (let i = 0; i < 15; i++) {

        console.log(i + " ) " + searchdata.data.items[i].snippet.title);

    }

    const choose = prompt('Which video do you wanna download :');

    let choosedvideo = searchdata.data.items[choose];
    await downloadwebm(choosedvideo.id.videoId);


    ffmpeg(`./temp-music-files/${choosedvideo.id.videoId}.webm`)
        .toFormat('mp3')
        .on('end', () => {
            console.log("convert done.");
            fs.unlink(`./temp-music-files/${choosedvideo.id.videoId}.webm`, err => {
                if (err) throw err
            }); 
        })
        .on('error', err => {
            console.log(err);
        })
        .output(`./converted-music-files/${choosedvideo.id.videoId}.mp3`)
        .run();


}


main();
