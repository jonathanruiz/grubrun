package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strings"

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

// Create a function that will generate a 5 character random string including numbers and uppercase letters.
func generateRandomString() string {
	// Create a slice of characters that will be used to generate the random string
	characters := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	// Create a string builder that will be used to build the random string
	var sb strings.Builder

	// Loop 5 times and each time generate a random character from the characters slice and add it to the string builder
	for i := 0; i < 5; i++ {
		randomIndex := rand.Intn(len(characters))
		sb.WriteRune(characters[randomIndex])
	}

	// Return the string builder as a string
	return sb.String()
}

func sendJSONResponse(w http.ResponseWriter, orderId string) {
	// Create a map to hold the response
	response := map[string]string{"orderId": orderId}

	// Marshal the map into a JSON object
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set the content type to application/json
	w.Header().Set("Content-Type", "application/json")

	// Send the JSON response back to the client
	w.Write(jsonResponse)
}

func main() {
	// Print a message to the console once the application starts
	log.Info("HTTP server started on port 8000")

	// Create an API post route that will generate a random string whenever /api/createOrder is called
	http.HandleFunc("/api/createOrder", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Generate a random string
		randomString := generateRandomString()

		// Send the JSON response
		sendJSONResponse(w, randomString)

		// Log the POST request
		log.Infof("POST request received on /api/createOrder: %s", randomString)
	})

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start the server on localhost port 8000 and log any errors
	log.Fatal(http.ListenAndServe(":8000", nil))

}
