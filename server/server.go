package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// Takes a normal HTTP connection and upgrades it to a WebSocket connection.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}

	// Close the connection when the function returns
	defer ws.Close()

	for {
		// Read in a new message as JSON and map it to a Message object
		_, _, err := ws.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
	}
}

func main() {
	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start the server on localhost port 8000 and log any errors
	log.Println("http server started on :8000", nil)
}
