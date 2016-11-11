const express = require("express");
const app = express();

require("express-ws")(app);

app.use("/assets", express.static("assets"));
app.use("/", express.static("views"));

const connections = [];

function updateMaster() {
    if (connections.length > 0) {
        connections[0].send(JSON.stringify({ mode: "master" }));
        for (var i = 1; i < connections.length; i++) {
            connections[i].send(JSON.stringify({ mode: "slave" }));
        }
    }
}

app.ws("/connect", function(ws) {
    connections.push(ws);
    updateMaster();

    ws.on("message", function(msg) {
        connections.forEach(c => {
            if (c !== ws) { c.send(msg); }
        });
    });

    ws.on("close", function() {
        var idx = connections.indexOf(ws);
        if (idx >= 0) {
            connections.splice(idx, 1);
            updateMaster();
        }
    });
});

app.listen(3000);
