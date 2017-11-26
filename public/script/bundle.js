var main = (function(window) {
    // var audioElement = document.getElementById('js-audio');
    var client = new BinaryClient('ws://localhost:9001');

    client.on('open', function() {
        console.log('client open');

        window.Stream = client.createStream();

        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }

        if (!navigator.getUserMedia) {
            alert('getUserMedia not supported in this browser.');

            return;
        }

        navigator.getUserMedia({ audio: true }, onSuccess, function(e) {
            alert('Error capturing audio.');
        });


        var recording = false;

        window.startRecording = function() {
            recording = true;
        }

        window.stopRecording = function() {
            recording = false;

            window.Stream.end();
        }

        function onSuccess(e) {
            audioContext = window.AudioContext || window.webkitAudioContext;
            context = new audioContext();

            // the sample rate is in context.sampleRate
            audioInput = context.createMediaStreamSource(e);

            var bufferSize = 2048;
            recorder = context.createScriptProcessor(bufferSize, 1, 1);

            recorder.onaudioprocess = function(e){
                if (!recording) {
                    return;
                }

                console.log ('recording');
                var left = e.inputBuffer.getChannelData(0);

                window.Stream.write(convertoFloat32ToInt16(left));
            }

            audioInput.connect(recorder)
            recorder.connect(context.destination);
        }

        function convertoFloat32ToInt16(buffer) {
            var l = buffer.length;
            var buf = new Int16Array(l)

            while (l--) {
                buf[l] = buffer[l]*0xFFFF;    //convert to 16 bit
            }

            return buf.buffer
        }
    });
})(this);
