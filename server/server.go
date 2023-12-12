package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strings"

	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

type OrderRuns struct {
	OrderId   string  `json:"orderId"`
	Owner     string  `json:"name"`
	Email     string  `json:"email"`
	MaxOrder  string  `json:"max"`
	TimeLimit string  `json:"time"`
	Orders    []Order `json:"orders"`
}

type Order struct {
	OrderId string `json:"orderId"`
	Owner   string `json:"name"`
	Order   string `json:"order"`
}

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

// Handles WebSocket connections.
func handleConnections(w http.ResponseWriter, r *http.Request, orders map[string]OrderRuns) {
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

		// Parse the message into an Order object
		var order Order
		err = json.Unmarshal(message, &order)
		if err != nil {
			log.Warn(err)
			break
		}

		// Get the orders object from the orders map using the orderId as the key
		orderRuns, exists := orders[order.OrderId]
		if !exists {
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}

		// Append the new order to the Orders slice
		orderRuns.Orders = append(orderRuns.Orders, order)

		// Put the modified OrderRuns object back into the orders map
		orders[order.OrderId] = orderRuns

		// Log the orders object
		log.Infof("Orders object: %s", orders)

		// Send the orders object back to the client
		err = ws.WriteJSON(orders)
		if err != nil {
			log.Warn(err)
			break
		}

	}
}

// Generates a random string of 5 characters, inlcuding uppercase letters and numbers.
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

func handleCreateOrder(w http.ResponseWriter, r *http.Request, orders map[string]OrderRuns) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Create a new OrderRuns object
	var orderRun OrderRuns

	// Read the JSON body and decode into an OrderRuns object
	err := json.NewDecoder(r.Body).Decode(&orderRun)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate a random string
	randomString := generateRandomString()

	// Set the OrderId field of the OrderRuns object to the random string
	orderRun.OrderId = randomString

	// Store the OrderRuns object in the orders map using the orderID as the key
	orders[orderRun.OrderId] = orderRun

	// Send the JSON response
	sendJSONResponse(w, orders, orderRun.OrderId)

	// Log the POST request
	log.Infof("POST request received on /api/createOrder: %s", orders[orderRun.OrderId])
}

// Sends a JSON response back to the client.
func sendJSONResponse(w http.ResponseWriter, orders map[string]OrderRuns, orderId string) {
	// Marshal the OrderRuns object into a JSON object
	jsonResponse, err := json.Marshal(orders)
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
	// Stores the orders that have been created.
	var orders = make(map[string]OrderRuns)

	// Print a message to the console once the application starts
	log.Info("HTTP server started on port 8000")

	// Create an API post route that will generate a random string whenever /api/createOrder is called
	http.HandleFunc("/api/createOrder", func(w http.ResponseWriter, r *http.Request) {
		handleCreateOrder(w, r, orders)
	})

	// Create an API get route that will return the orders map as a JSON object based on the orderId
	http.HandleFunc("/api/getOrderRun", func(w http.ResponseWriter, r *http.Request) {
		// Get the orderId from the query string
		orderId := r.URL.Query().Get("orderId")

		// Send the JSON response
		sendJSONResponse(w, orders, orderId)

		// Log the GET request
		log.Infof("GET request received on /api/getOrder: %s", orderId)
	})

	// Configure websocket route
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleConnections(w, r, orders)
	})

	// Start the server on localhost port 8000 and log any errors
	log.Fatal(http.ListenAndServe(":8000", nil))

}
