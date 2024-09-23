var request = require('request');
var uuid = require('node-uuid');
var crypto = require('crypto');
var fs = require('fs');
var express = require('express');
var multer = require('multer');
var Houndify = require('houndify');
var wav = require('wav');

function generateAuthHeaders (clientId, clientKey, userId, requestId, ts) {
    if (!clientId || !clientKey) {
        throw new Error('Must provide a Client ID and a Client Key');
    }
    userId = userId || uuid.v1();
    requestId = requestId || uuid.v1();
    var requestData = userId + ';' + requestId;
    var timestamp = ts,  
        unescapeBase64Url = function (key) {
            return key.replace(/-/g, '+').replace(/_/g, '/');
        },
        escapeBase64Url = function (key) {
            return key.replace(/\+/g, '-').replace(/\//g, '_');
        },
        signKey = function (clientKey, message) {
            var key = new Buffer(unescapeBase64Url(clientKey), 'base64');
            var hash = crypto.createHmac('sha256', key).update(message).digest('base64');
            return escapeBase64Url(hash);
        },
        encodedData = signKey(clientKey, requestData + timestamp),
        headers = {
            'Hound-Request-Authentication': requestData,
            'Hound-Client-Authentication': clientId + ';' + timestamp + ';' + encodedData
        };
    return headers;
};

clientId = 'ZYDfTCi_vC0_Vs62GNGkRA=='
clientKey = '-eX3p6Yd7neYStn9FLDAMAOt4yCg6I55kjmNTrjR6NIp29KlB4MibSnguu6SzsQ9QIMZAQbpWsJkx3v2R053tw=='
userId = '28f78270-7987-11ef-82b3-3d971b614111'
sessionId = '51da6db0-7987-11ef-82b3-3d971b614111'
requestId = uuid.v1()
ts = Math.floor(Date.now() / 1000)

var audioData = fs.readFileSync('rec.wav');
var file = fs.createReadStream('whatistheweatherlikeintoronto.wav');
// var base64Audio = audioData.toString('base64');

var voiceRequest;
    voiceRequest = new Houndify.VoiceRequest({
        clientId:  clientId,
        clientKey: clientKey,

        // sampleRate: format.sampleRate,
        convertAudioToSpeex: false,
        enableVAD: true,

        //REQUEST INFO JSON
        //see https://houndify.com/reference/RequestInfo
        requestInfo: {
            UserID: userId
        },

        onResponse: function(response, info) {
            console.log(response);
        },

        onTranscriptionUpdate: function(trObj) {
            console.log("Partial Transcript:", trObj.PartialTranscript);
        },

        onError: function(err, info) {
            console.log(err);
        }
    });

file.on('data', function (chunk) {
    voiceRequest.write(chunk);
});

file.on('end', function() {
    voiceRequest.end();
});

// reader.on('data', function (chunk) {
//     var arrayBuffer = new Uint8Array(chunk).buffer;
//     var view = new Int16Array(arrayBuffer);
//     voiceRequest.write(view);
// });

// reader.on('end', function() {
//     voiceRequest.end();
// });

// file.pipe(reader);

// var houndRequest = {
//     ClientID: clientId,
//     RequestID: requestId,
//     // DeviceID: '8333687f040f3d88',
//     ClientVersion: '1.0',
//     SessionID: sessionId,
//     TimeStamp: ts,
//     InputLanguageIETFTag: 'en-US',
//     // ResponseAudioVoice: 'Chris',
//     // ResponseAudioShortOrLong: 'Short'
//     AudioRequest: {
//       AudioData: base64Audio,
//       Encoding: 'wav',
//       SampleRate: 16000, // Adjust this according to your audio file's sample rate
//       Format: '16bit PCM'
//     }
// };

// request({
//     url: 'https://api.houndify.com/v1/text?query=What is the weather like in San Francisco?',
//     headers: {
//         ...headers,
//         'Hound-Request-Info': JSON.stringify(houndRequest)
//     },
//     json: true
// }, function (err, resp, body) {
//     //body will contain the JSON response
//     console.log(body);
// });

// var conversationState
// requestInfo = { UserID: userId }
// myClientVoice = new Houndify.VoiceRequest({
//     clientId: clientId,
//     clientKey: clientKey,
//     requestInfo: requestInfo,
//     sampleRate: 8000,
//     enableVAD: true,
//     onversationState: conversationState,
//     onResponse: function(response, info) {
//         console.log("HERE IS THE VOICE RESPONSE", response);
//         if (response.AllResults[0].CommandKind == 'NoResultCommand') {
//             console.log('No results found');
//             // res.type('text/xml');
//             // res.send(twiml.toString());
//         } else {
//             // twiml.say({
//             //     voice: 'alice'
//             // }, response.AllResults[0].SpokenResponseLong);
//             console.log('SpokenResponseLong:', response.AllResults[0].SpokenResponseLong);

//             // Keep on looping on this route as long as user has questions
//             // twiml.say({
//             //     voice: 'alice'
//             // }, 'Do you have another question that I could help you with?');
//             // twiml.record({
//             //     action: ' [ADD YOUR NGROK OR CLOUD SERVICE PROVIDER URL HERE]/userquestion'
//             // });
//             // res.type('text/xml');
//             // res.send(twiml.toString());
//         }
//         //get current conversation state for a user and save it somewhere
//         //you can then re-set it later, before sending another request for that user
//         conversationState = response.AllResults[0].ConversationState;
//     },

//     onTranscriptionUpdate: function(trObj) {
//         console.log("Partial Transcript:", trObj.PartialTranscript);
//     },

//     onError: function(err, info) {
//         console.log(err);
//     }
// });

// // var arrayBuffer = new Uint8Array(audioData).buffer;
// // var view = new Int16Array(arrayBuffer);
// // console.log(view.length);
// setTimeout(() => { myClientVoice.end() }, 500);
// myClientVoice.write(audioData);

// var app = express();
// var upload = multer();
// var audioBuffer = Buffer()

// function hasSilence(buffer, sampleRate, silenceThreshold, silenceDuration) {
//   var samples = buffer.length / 2; // 16-bit PCM, so 2 bytes per sample
//   var silenceSamples = silenceDuration * sampleRate;
//   var silenceCount = 0;

//   if (samples < silenceSamples) {
//     return false;
//   }

//   for (var i = samples - 1; i >= 0; i--) {
//     var sample = buffer.readInt16LE(i * 2) / 32768.0; // Normalize to -1.0 to 1.0
//     if (Math.abs(sample) < silenceThreshold) {
//       silenceCount++;
//       if (silenceCount >= silenceSamples) {
//         return true;
//       }
//     } else {
//       silenceCount = 0;
//     }
//   }
//   return false;
// }

// app.post('/bot', upload.single('audio'), function (req, res) {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   var audioData = req.file.buffer;
//   // var base64Audio = audioData.toString('base64');

//   audioBuffer = Buffer.concat([audioBuffer, audioData]);
//   if (hasSilence(audioBuffer, 16000, 0.01, 2)) {
//     const requestBuffer = audioBuffer;
//     audioBuffer = Buffer();
//     var base64Audio = requestBuffer.toString('base64');

//     var houndRequest = {
//       ClientID: clientId,
//       RequestID: uuid.v1(),
//       ClientVersion: '1.0',
//       SessionID: sessionId,
//       TimeStamp: Math.floor(Date.now() / 1000),
//       InputLanguageIETFTag: 'en-US',
//       AudioRequest: {
//         AudioData: base64Audio,
//         Encoding: 'wav',
//         SampleRate: 16000,
//         Format: '16bit PCM'
//       }
//     };

//     request({
//       url: 'https://api.houndify.com/v1/audio',
//       method: 'POST',
//       headers: {
//         ...headers,
//         'Hound-Request-Info': JSON.stringify(houndRequest)
//       },
//       json: true
//     }, function (err, resp, body) {
//       if (err) {
//         return res.status(500).send('Error processing audio.');
//       }
//       res.json(body);
//     });
//   } else {
//     console.log('Audio buffer does not have 2 seconds of silence at the end.');
//   }
// });

// app.listen(3000, function () {
//   console.log('Server is listening on port 3000');
// });