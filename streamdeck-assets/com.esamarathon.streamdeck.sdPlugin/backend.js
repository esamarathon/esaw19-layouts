// Store data supplied by the "connectSocket" function.
var connectSocketData = {
	port: undefined,
	pluginUUID: undefined,
	registerEvent: undefined,
	info: undefined
};

// Connect to our local socket.io server in our NodeCG bundle.
var socket = io('http://localhost:1235', {query: 'key=DEFAULT_KEY'});

// Triggered by the Stream Deck software.
function connectElgatoStreamDeckSocket(port, pluginUUID, registerEvent, info) {
	connectSocketData.port = port;
	connectSocketData.pluginUUID = pluginUUID;
	connectSocketData.registerEvent = registerEvent;
	connectSocketData.info = info;

	// Send this but only if the socket to the NodeCG server has already connected.
	if (socket.connected) socket.emit('sdConnectSocket', connectSocketData);
}

socket.on('connect', () => {
	// Send the data over the socket connection if it's set (which means it wasn't done above).
	if (connectSocketData.port) socket.emit('sdConnectSocket', connectSocketData);
});