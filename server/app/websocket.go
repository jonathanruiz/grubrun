package app

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

type ConnectionPool struct {
	clients   map[*websocket.Conn]bool
	clientsMu sync.Mutex
}

// NewConnectionPool returns a ConnectionPool with an initialized clients map.
func NewConnectionPool() *ConnectionPool {
	return &ConnectionPool{
		clients: make(map[*websocket.Conn]bool),
	}
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

// HandleConnections handles WebSocket connections.
func (pool *ConnectionPool) HandleConnections(w http.ResponseWriter, r *http.Request, orders map[string]OrderRun) {
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
		pool.HandleBroadcast(orders)
	}
}

// HandleBroadcast sends the current orders to every connected WebSocket client.
func (pool *ConnectionPool) HandleBroadcast(orders map[string]OrderRun) {
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
