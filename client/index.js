import "./styles.css";
import "./adapter";
import iceServers from "./iceservers";

var remoteView, localView, localStream;
var channelNameEl;

var start = () => {
    remoteView = document.getElementById("remote");
    localView = document.getElementById("local");
    channelNameEl = document.getElementById("channel");

    navigator.getUserMedia({ audio: true, video: true }, stream => {
        localStream = stream;
        localView.srcObject = stream;
        startRTC();
    }, error => console.error(error));
};

var startRTC = () => {
    var wsProto = window.location.protocol === "https:" ? "wss" : "ws";
    var ws = new WebSocket(`${wsProto}://${location.host}/connect`);
    var peerConnection;

    Array.prototype.forEach.call(document.getElementsByClassName("channel-btn"), btn => {
        btn.addEventListener("click", () => {
            console.log(`joining channel ${btn.dataset.channel}`);
            channelNameEl.innerHTML = btn.dataset.channel;
            resetPeerConnection();
            ws.send(JSON.stringify({
                channel: btn.dataset.channel
            }));
        });
    });

    var resetPeerConnection = () => {
        if (peerConnection) {
            peerConnection.removeStream(localStream);
            peerConnection.close();
            remoteView.src = "";
        }

        peerConnection = new RTCPeerConnection({ iceServers });
        peerConnection.addStream(localStream);

        peerConnection.onicecandidate = function (evt) {
            ws.send(JSON.stringify({ candidate: evt.candidate }));
        };

        peerConnection.onaddstream = function (evt) {
            console.log("updating remoteview");
            remoteView.src = URL.createObjectURL(evt.stream);
        };
    };

    var dial = () => {
        peerConnection.createOffer(offer => {
            console.log("sending offer");
            peerConnection.setLocalDescription(offer);
            ws.send(JSON.stringify({ offer }));
        }, error => console.error(error));
    };

    ws.onopen = () => {
        ws.onmessage = evt => {
            var signal = JSON.parse(evt.data);

            if (signal.error) {
                console.error(signal.error);
            } else if (signal.mode) {
                console.log(`I am ${signal.mode}`);
                resetPeerConnection();
                if (signal.mode === "master") {
                    dial();
                }
            } else if (signal.candidate) {
                console.log("received candidate");
                peerConnection.addIceCandidate(
                    new RTCIceCandidate(signal.candidate));
            } else if (signal.offer) {
                console.log("received offer");
                peerConnection.setRemoteDescription(
                    new RTCSessionDescription(signal.offer));
                peerConnection.createAnswer(answer => {
                    console.log("sending answer");
                    peerConnection.setLocalDescription(answer);
                    ws.send(JSON.stringify({ answer }));
                }, error => console.error(error));
            } else if (signal.answer) {
                console.log("received answer");
                peerConnection.setRemoteDescription(
                    new RTCSessionDescription(signal.answer));
            }
        };

        console.log("connected to server");
    };
};

document.addEventListener("DOMContentLoaded", start);
