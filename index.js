const express = require("express");
const app = express();

require("express-ws")(app);

app.use("/assets", express.static("assets"));
app.use("/", express.static("views"));

function Channel(name) {
    this.conns = [];
    this.name = name;

    this.addConnection = (ws) => {
        if (this.conns.length === 2) {
            throw new Error("Channel is at capacity");
        }
        this.conns.push(ws);
        this.broadcastRoles();
    };

    this.removeConnection = (ws) => {
        var idx = this.conns.indexOf(ws);
        if (idx >= 0) { this.conns.splice(idx, 1); }
    };

    this.broadcastRoles = () => {
        for (var i = 0; i < this.conns.length; i++) {
            this.conns[i].send(JSON.stringify({
                mode: i === 0 ? "master" : "slave"
            }));
        }
    };

    this.broadcast = (source, msg) => {
        this.conns.forEach(conn => {
            if (conn !== source) { conn.send(msg); }
        });
    };

    this.empty = () => {
        return this.conns.length === 0;
    };
}

const CHANNELS = [];

var findChannel = name => {
    for (var i = 0; i < CHANNELS.length; i++) {
        if (CHANNELS[i].name === name) { return CHANNELS[i]; }
    }
};

var removeConnFromChannel = (channel, ws) => {
    channel.removeConnection(ws);
    if (channel.empty()) {
        var idx = CHANNELS.indexOf(channel);
        if (idx >= 0) { CHANNELS.splice(idx, 1); }
    }
};

app.ws("/connect", function(ws) {
    var channel;

    ws.on("message", function(msg) {
        try {
            var data = JSON.parse(msg);
            if (data.channel) {
                if (channel) {
                    removeConnFromChannel(channel, ws);
                }

                channel = findChannel(data.channel);
                if (!channel) {
                    channel = new Channel(data.channel);
                    CHANNELS.push(channel);
                }
                channel.addConnection(ws);
            } else {
                if (channel) {
                    channel.broadcast(ws, msg);
                } else {
                    throw new Error("No channel selected");
                }
            }
        } catch(err) {
            ws.send(JSON.stringify({ error: err }));
        }
    });

    ws.on("close", function() {
        if (channel) {
            removeConnFromChannel(channel, ws);
        }
    });
});

app.listen(3000);
