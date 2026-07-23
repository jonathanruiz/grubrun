package app

import "sync"

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
