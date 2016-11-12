# Teleportal
## Easy office-office permanent video links

Teleportal is a simple JS application which connects offices via WebRTC links in
order to maintain persistent video connections.  The goal is to reduce
communication latency between people by removing the friction of setting up a
video call and getting a room.  By having a room dedicated to Teleportal, a
connected space is immediately available to people in both places.

## Usage

```sh
# start teleportal
docker run -d --name teleportal -e DOMAIN=foobar.com -p 3000:3000 carlsverre/teleportal

# open teleportal in Chrome
# https://localhost:3000

# stop teleportal
docker rm -f teleportal

# re-create the docker image if needed
docker build -t teleportal .
```

## Important Notes

### Probably only works in Chrome

This is a fun side-project with a constrained set of requirements.  One of those
is Chrome support.  If you want to support other browsers please send a pull
request.

### Teleportal is not secure

Right now, accessing audio/video in Chrome requires that you have an HTTPS
connection to the server. So, Teleportal creates a self-signed certificate when
it starts which you need to accept in order to use the software.  This is obv
jank - but if you want to run it on premise its the best we can do
automatically.  In order to secure Teleportal please install your own
certificate in place of the self signed cert.  Just mount host.cert and related
files at `/ssl` and teleportal will automatically pick them up.

If you don't use your own cert you should set the DOMAIN env variable to w/e
domain will be serving Teleportal.  The self-signed cert will be setup to match.

### Why not use Skype or Bluejeans or Google Hangouts?

A number of reasons which are probably invalid.

1. Not hackable - the Teleportal interface is easy to modify and brand as you
   like
2. Some of them don't route packets P2P - this means performance issues!
3. Have to manage accounts which can be annoying
4. They are designed for on-demand short-term communication, not persistent
   long-term links.

### Recommendation: run it in VPN

In order to increase security and performance, I recommend that you run
Teleportal within your office network, and in such a way that all of the
connected offices can reach each other directly via their intranet ip.  This
means that the video and audio streams will be contained in your network which
will help improve the security/performance story by an order of magnitude.

### Channels

Right now I have two example channels setup in index.html: "Prague" and
"Seattle".  Feel free to add more channels by just adding more `channel-btn`
buttons with different `data-channel` attributes.
