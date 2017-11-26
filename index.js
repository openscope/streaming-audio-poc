const express = require('express');
const BinaryServer = require('binaryjs').BinaryServer;
const wav = require('wav');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(logger(process.env.LOG_FORMAT));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// controllers
app.get('/', (req, res) => {
    res.render('home');
});

app.listen(app.get('port'), () => {
    console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

const demoWav = 'demo.wav';
binaryServer = new BinaryServer({
    host: process.env.SOCKET_HOST,
    port: process.env.SOCKET_PORT
});
binaryServer.on('connection', function(client) {
    console.log('new connection');
    var fileWriter = new wav.FileWriter(demoWav, {
        channels: 1,
        sampleRate: 48000,
        bitDepth: 16
      });

    client.on('stream', function(stream, meta) {
        console.log('streaming...');

        stream.pipe(fileWriter);

        stream.on('end', function() {
            fileWriter.end();

            console.log('wrote to file ' + demoWav);
        });
    });
});

module.exports = app;
