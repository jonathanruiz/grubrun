package main

import (
	"net/http"

	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

// Takes a normal HTTP connection and upgrades it to a WebSocket connection.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// TODO: Add a function that checks the origin of the request is from a trusted domain for production.
	// This is a function that allows us to specify which origins are allowed to access our WebSocket.
	CheckOrigin: func(r *http.Request) bool {
		// Set to true for development purposes
		return true
	},
}

// Stores the last received message from the client.
var lastReceivedMessage []uint8

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error(err)
	}

	log.Info("New WebSocket connection established")

	// Close the connection when the function returns
	defer ws.Close()

	for {
		// Read in a new message as JSON and map it to a Message object
		messageType, message, err := ws.ReadMessage()
		if err != nil {
			log.Warn(err)
			break
		}

		log.Infof("Received a %v message: %s", messageType, message)

		// Store the last received message
		lastReceivedMessage = message

		// Send the last received message back to the client
		if err := ws.WriteMessage(messageType, lastReceivedMessage); err != nil {
			log.Warn(err)
			break
		}

	}
}

func main() {
	// Print a message to the console once the application starts
	log.Info("HTTP server started on port 8000")

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start the server on localhost port 8000 and log any errors
	log.Fatal(http.ListenAndServe(":8000", nil))

}
