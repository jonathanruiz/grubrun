// Package app contains the grubrun HTTP/WebSocket server logic. It is kept
// separate from package main so the handlers can be exercised by tests in the
// grubrun/server/tests package.
package app

import (
	"net/http"

	"github.com/charmbracelet/log"
)

// Run wires up the routes and starts the HTTP server on port 8000. It blocks
// until the server exits.
func Run() {
	// Initialize a new connection pool
	pool := NewConnectionPool()

	// Stores the orders that have been created.
	var orders = make(map[string]OrderRun)

	// Print a message to the console once the application starts
	log.Info("HTTP server started on port 8000")

	// Configure websocket route
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		pool.HandleConnections(w, r, orders)
	})

	// Create an API post route that will generate a random string whenever /api/createOrder is called
	http.HandleFunc("/api/createOrder", func(w http.ResponseWriter, r *http.Request) {
		HandleCreateOrder(w, r, orders)
	})

	// Create an API get route that will return the orders map as a JSON object based on the orderId
	http.HandleFunc("/api/getOrderRun", func(w http.ResponseWriter, r *http.Request) {
		HandleGetOrderRun(w, r, orders)
	})

	// Start the server on localhost port 8000, wrapping all routes with the
	// CORS middleware, and log any errors
	log.Fatal(http.ListenAndServe(":8000", CorsMiddleware(http.DefaultServeMux)))
}
