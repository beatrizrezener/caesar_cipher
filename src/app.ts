import express from 'express';
const app = express();
const port = 3000;

const request = require('request');
const fs = require('fs');
const sha1 = require('js-sha1');

const TOKEN = 'token';
const GENERATE_DATA_API = `get_url`;
const SUBMIT_API = `post_url`
const FILE_PATH  = __dirname + '/answer.json';

const _a = 97;
const _z = 122;

import FormData from 'form-data';

app.get('/', (_, res) => {
  res.send('Decrypting');

  request(GENERATE_DATA_API, { json: true }, (err, _, body) => {
    if (err) return console.log(err);

    let content = body;
    let deciphered = '';

    content.cifrado.split('').forEach(c => {
        const charCode = c.charCodeAt(0);

        if (charCode >= _a && charCode <= _z) {
            let charCodeDecifrado = c.charCodeAt(0) - content.numero_casas;
            if (charCodeDecifrado < _a) {
                charCodeDecifrado = _z - (_a - charCodeDecifrado) + 1;
            }
            deciphered += String.fromCharCode(charCodeDecifrado);
        } else {
            deciphered += c;   
        }
    });
    content.decifrado = deciphered;
    content.resumo_criptografico = sha1(deciphered);

    saveToFile(JSON.stringify(content));

    sendFile();

  });
});

app.listen(port, err => {
  if (err) return console.error(err);
  return console.log(`server is listening on ${port}`);
});

function sendFile() {
    const readStream = fs.createReadStream(FILE_PATH);
    const form = new FormData();
    form.append('answer', readStream);

    const req = request(
        {
            uri: SUBMIT_API,
            method: 'POST',
            headers: form.getHeaders(),
        },
        function (err, _, body) {
            if (err) {
                console.log(`Error: ${err}`);
            } else {
                console.log('Response: ' + body);
            }
        }
      );
    form.pipe(req);
}

function saveToFile(json: string) {
    fs.writeFile(FILE_PATH, json, 'utf8', function (err) {
        if (err) return console.log(err);
        console.log("File has been saved.");
    });
}