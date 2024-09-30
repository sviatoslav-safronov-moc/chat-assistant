var request = require('request');
var uuid = require('node-uuid');
var crypto = require('crypto');
var fs = require('fs');
var express = require('express');
var multer = require('multer');
var Houndify = require('houndify');
var wav = require('wav');
var http = require('http');
var socket = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { Readable } = require('stream');

ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');

function convertOggToWav(oggBuffer) {
    return new Promise((resolve, reject) => {
        const wavBuffers = [];
        const readableStream = new Readable();
        readableStream.push(oggBuffer);
        readableStream.push(null);

        ffmpeg(readableStream)
            .inputFormat('ogg')
            .audioCodec('pcm_s16le')
            .format('wav')
            .on('error', reject)
            .on('data', (chunk) => { console.log(chunk); wavBuffers.push(chunk) })
            .on('end', () => {
                console.log('End')
                resolve(Buffer.concat(wavBuffers));
            })
            .output('/dev/null')
            .run();
    });
}

// function generateAuthHeaders (clientId, clientKey, userId, requestId, ts) {
//     if (!clientId || !clientKey) {
//         throw new Error('Must provide a Client ID and a Client Key');
//     }
//     userId = userId || uuid.v1();
//     requestId = requestId || uuid.v1();
//     var requestData = userId + ';' + requestId;
//     var timestamp = ts,  
//         unescapeBase64Url = function (key) {
//             return key.replace(/-/g, '+').replace(/_/g, '/');
//         },
//         escapeBase64Url = function (key) {
//             return key.replace(/\+/g, '-').replace(/\//g, '_');
//         },
//         signKey = function (clientKey, message) {
//             var key = new Buffer(unescapeBase64Url(clientKey), 'base64');
//             var hash = crypto.createHmac('sha256', key).update(message).digest('base64');
//             return escapeBase64Url(hash);
//         },
//         encodedData = signKey(clientKey, requestData + timestamp),
//         headers = {
//             'Hound-Request-Authentication': requestData,
//             'Hound-Client-Authentication': clientId + ';' + timestamp + ';' + encodedData
//         };
//     return headers;
// };

clientId = 'ZYDfTCi_vC0_Vs62GNGkRA=='
clientKey = '-eX3p6Yd7neYStn9FLDAMAOt4yCg6I55kjmNTrjR6NIp29KlB4MibSnguu6SzsQ9QIMZAQbpWsJkx3v2R053tw=='
userId = '28f78270-7987-11ef-82b3-3d971b614111'
sessionId = '51da6db0-7987-11ef-82b3-3d971b614111'
requestId = uuid.v1()
ts = Math.floor(Date.now() / 1000)

var file = fs.createReadStream('whatistheweatherlikeintoronto.wav');
let transcript, answer, voiceRequest;

// file.on('data', function (chunk) {
//     console.log(chunk);
//     voiceRequest.write(chunk);
// });

// file.on('end', function() {
//     voiceRequest.end();
// });

var app = express();

// app.use(express.static('frontend'));

app.get('/', function(req, res) {
    transcript, answer = '';
    voiceRequest = new Houndify.VoiceRequest({
        clientId:  clientId,
        clientKey: clientKey,

        convertAudioToSpeex: false,
        enableVAD: true,

        //REQUEST INFO JSON
        //see https://houndify.com/reference/RequestInfo
        requestInfo: {
            UserID: userId
        },

        onResponse: function(response, info) {
            answer  = response.AllResults[0].WrittenResponse;
            console.log(response);
        },

        onTranscriptionUpdate: function(trObj) {
            transcript = trObj.PartialTranscript;
            console.log("Partial Transcript:", trObj.PartialTranscript);
        },

        onError: function(err, info) {
            console.log(err);
        }
    });
    res.sendFile(__dirname + '/frontend/index.html');
});

app.get('/test', function(req, res) {
    res.sendFile(__dirname + '/frontend/test.html');
});


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
let audioFileNumber = 0
app.post('/chunks', upload.single('audio'), async function(req, res) {
    audioFileNumber += 1;
    const audioPath = `recordings/${audioFileNumber}.wav`;
    console.log(req.file);
    fs.writeFile(audioPath, req.file.buffer, (err) => {
        if (err) {
            console.error('Error saving PCM file:', err);
            return;
        }
        console.log('PCM file saved successfully');
    });
    
    voiceRequest.write(req.file.buffer);
    // convertOggToWav(req.file.buffer).then((wavBuffer) => {
    //     console.log(wavBuffer);
    //     voiceRequest.write(wavBuffer);
    // });
    res.send(transcript);
});

app.get('/end', function(req, res) {
    voiceRequest.end()
    res.send('');
});

app.get('/answer', function(req, res) {
    res.send(answer);
});

var server = http.Server(app);
// var io = socket(server);

// io.on('connection', function(socket) {
//     console.log('Client connected');

//     socket.on('message', function(chunk) {
//         if (chunk) {
//             voiceRequest.write(Buffer.from(chunk));
//         } else {
//             voiceRequest.end();
//         }
//     });

//     socket.on('disconnect', () => console.log('Client disconnected'));
// });

server.listen(3000, function() {
    console.log('Listening on port 3000');
});