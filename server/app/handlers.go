package app

import (
	"encoding/json"
	"net/http"

	"github.com/charmbracelet/log"
)

// HandleCreateOrder handles the POST request to /api/createOrder.
func HandleCreateOrder(w http.ResponseWriter, r *http.Request, orders map[string]OrderRun) {
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
		orderRun.OrderId = GenerateRandomString()
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

// HandleGetOrderRun handles the GET request to /api/getOrderRun.
func HandleGetOrderRun(w http.ResponseWriter, r *http.Request, orders map[string]OrderRun) {
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
