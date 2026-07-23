package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strings"
	"sync"

	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

// ordersMu guards the shared orders map, which is accessed concurrently by
// the HTTP handlers and every WebSocket goroutine.
var ordersMu sync.RWMutex

type OrderRun struct {
	OrderId  string  `json:"orderId"`
	Owner    string  `json:"name"`
	Email    string  `json:"email"`
	Location string  `json:"location"`
	MaxOrder int     `json:"max"`
	Orders   []Order `json:"orders"`
}

type Order struct {
	OrderId string `json:"orderId"`
	Owner   string `json:"name"`
	Order   string `json:"order"`
}

type ConnectionPool struct {
	clients   map[*websocket.Conn]bool
	clientsMu sync.Mutex
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
func (pool *ConnectionPool) handleConnections(w http.ResponseWriter, r *http.Request, orders map[string]OrderRun) {
	// Upgrade initial GET request to a WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		// The upgrade failed, so ws is nil; bail out before using it.
		log.Error(err)
		return
	}

	log.Info("New WebSocket connection established")

	// Close the connection when the function returns
	defer ws.Close()

	pool.clientsMu.Lock()
	pool.clients[ws] = true
	pool.clientsMu.Unlock()

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
		ordersMu.Lock()
		orderRuns, exists := orders[order.OrderId]
		if !exists {
			ordersMu.Unlock()
			http.Error(w, "Order not found", http.StatusNotFound)
			return
		}

		// Append the new order to the Orders slice
		orderRuns.Orders = append(orderRuns.Orders, order)

		// Put the modified OrderRuns object back into the orders map
		orders[order.OrderId] = orderRuns
		ordersMu.Unlock()

		// Broadcast the updated orders to every connected client. This
		// includes the sender, so there is no need to write to ws separately.
		pool.handleBroadcast(orders)
	}
}

func (pool *ConnectionPool) handleBroadcast(orders map[string]OrderRun) {
	ordersMu.RLock()
	defer ordersMu.RUnlock()

	pool.clientsMu.Lock()
	defer pool.clientsMu.Unlock()

	// Send it out to every client that is currently connected
	for client := range pool.clients {
		err := client.WriteJSON(orders)
		if err != nil {
			log.Printf("error: %v", err)
			client.Close()
			delete(pool.clients, client)
		}
	}
}

// orderIDChars is the set of characters used to build a random order id.
const orderIDChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// Generates a random string of 5 characters, including uppercase letters and numbers.
func generateRandomString() string {
	// Create a string builder that will be used to build the random string
	var sb strings.Builder
	sb.Grow(5)

	// Loop 5 times and each time append a random character from orderIDChars.
	for i := 0; i < 5; i++ {
		sb.WriteByte(orderIDChars[rand.Intn(len(orderIDChars))])
	}

	// Return the string builder as a string
	return sb.String()
}

// corsMiddleware adds CORS headers to every response and answers the
// browser's preflight OPTIONS request so cross-origin requests from the
// client (e.g. http://localhost:5173) are allowed.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Answer the preflight request without hitting the route handlers.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Handles the POST request to /api/createOrder
func handleCreateOrder(w http.ResponseWriter, r *http.Request, orders map[string]OrderRun) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Create a new OrderRun object
	var orderRun OrderRun

	// Read the JSON body and decode into an OrderRun object
	err := json.NewDecoder(r.Body).Decode(&orderRun)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure Orders is a non-nil slice so it serializes as [] rather than null
	// for a run that has no orders yet.
	if orderRun.Orders == nil {
		orderRun.Orders = []Order{}
	}

	// Assign a unique order id and store the run. Generating the id under the
	// lock and retrying on the rare chance of a collision keeps two concurrent
	// requests from being assigned the same id.
	ordersMu.Lock()
	for {
		orderRun.OrderId = generateRandomString()
		if _, exists := orders[orderRun.OrderId]; !exists {
			break
		}
	}
	orders[orderRun.OrderId] = orderRun
	ordersMu.Unlock()

	// Marshal the OrderRuns object into a JSON object
	jsonResponse, err := json.Marshal(orderRun)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set the content type to application/json
	w.Header().Set("Content-Type", "application/json")

	// Send the JSON response back to the client
	w.Write(jsonResponse)
}

// Handles the GET request to /api/getOrderRun
func handleGetOrderRun(w http.ResponseWriter, r *http.Request, orders map[string]OrderRun) {
	// Get the orderId from the query string
	orderId := r.URL.Query().Get("orderId")

	// Look up only the requested order run rather than returning the entire
	// orders map.
	ordersMu.RLock()
	orderRun, exists := orders[orderId]
	ordersMu.RUnlock()
	if !exists {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// Marshal the order into a map keyed by orderId, which is the shape the
	// client expects (it indexes the response as data[orderId]).
	jsonResponse, err := json.Marshal(map[string]OrderRun{orderId: orderRun})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set the content type to application/json
	w.Header().Set("Content-Type", "application/json")

	// Send the JSON response back to the client
	w.Write(jsonResponse)

	// Log the GET request
	log.Infof("GET request received on /api/getOrderRun: %s", orderId)
}

func main() {
	// Initialize a new connection pool
	pool := &ConnectionPool{
		clients: make(map[*websocket.Conn]bool),
	}

	// Stores the orders that have been created.
	var orders = make(map[string]OrderRun)

	// Print a message to the console once the application starts
	log.Info("HTTP server started on port 8000")

	// Configure websocket route
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		pool.handleConnections(w, r, orders)
	})

	// Create an API post route that will generate a random string whenever /api/createOrder is called
	http.HandleFunc("/api/createOrder", func(w http.ResponseWriter, r *http.Request) {
		handleCreateOrder(w, r, orders)
	})

	// Create an API get route that will return the orders map as a JSON object based on the orderId
	http.HandleFunc("/api/getOrderRun", func(w http.ResponseWriter, r *http.Request) {
		handleGetOrderRun(w, r, orders)
	})

	// Start the server on localhost port 8000, wrapping all routes with the
	// CORS middleware, and log any errors
	log.Fatal(http.ListenAndServe(":8000", corsMiddleware(http.DefaultServeMux)))

}
