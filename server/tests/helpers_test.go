package tests

import "grubrun/app"

// newOrders returns a fresh orders map for a test so tests don't share state.
func newOrders() map[string]app.OrderRun {
	return make(map[string]app.OrderRun)
}

// keysOf returns the keys of a map for clearer test failure messages.
func keysOf(m map[string]app.OrderRun) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
