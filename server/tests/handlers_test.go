package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"grubrun/app"
)

func TestHandleCreateOrder(t *testing.T) {
	orders := newOrders()

	body := `{"name":"Alice","email":"alice@example.com","location":"Taco Place","max":5}`
	req := httptest.NewRequest(http.MethodPost, "/api/createOrder", strings.NewReader(body))
	rec := httptest.NewRecorder()

	app.HandleCreateOrder(rec, req, orders)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", ct)
	}

	var got app.OrderRun
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(got.OrderId) != 5 {
		t.Errorf("expected a 5-character orderId, got %q", got.OrderId)
	}
	if got.Owner != "Alice" {
		t.Errorf("expected owner Alice, got %q", got.Owner)
	}
	if got.MaxOrder != 5 {
		t.Errorf("expected max 5, got %d", got.MaxOrder)
	}

	// The run should have been stored in the orders map under its generated id.
	stored, exists := orders[got.OrderId]
	if !exists {
		t.Fatalf("created order %q was not stored in the orders map", got.OrderId)
	}
	if stored.Owner != "Alice" {
		t.Errorf("stored owner mismatch: got %q", stored.Owner)
	}
}

func TestHandleCreateOrderSerializesEmptyOrdersAsArray(t *testing.T) {
	orders := newOrders()

	body := `{"name":"Bob","email":"bob@example.com","location":"Pizza","max":3}`
	req := httptest.NewRequest(http.MethodPost, "/api/createOrder", strings.NewReader(body))
	rec := httptest.NewRecorder()

	app.HandleCreateOrder(rec, req, orders)

	// A run with no orders must serialize "orders":[] and not "orders":null,
	// which the client relies on.
	if !strings.Contains(rec.Body.String(), `"orders":[]`) {
		t.Errorf("expected empty orders to serialize as [], got: %s", rec.Body.String())
	}
}

func TestHandleCreateOrderRejectsNonPost(t *testing.T) {
	orders := newOrders()

	req := httptest.NewRequest(http.MethodGet, "/api/createOrder", nil)
	rec := httptest.NewRecorder()

	app.HandleCreateOrder(rec, req, orders)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status %d, got %d", http.StatusMethodNotAllowed, rec.Code)
	}
	if len(orders) != 0 {
		t.Errorf("expected no orders to be created, got %d", len(orders))
	}
}

func TestHandleCreateOrderRejectsInvalidJSON(t *testing.T) {
	orders := newOrders()

	req := httptest.NewRequest(http.MethodPost, "/api/createOrder", strings.NewReader("{not valid json"))
	rec := httptest.NewRecorder()

	app.HandleCreateOrder(rec, req, orders)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rec.Code)
	}
	if len(orders) != 0 {
		t.Errorf("expected no orders to be created, got %d", len(orders))
	}
}

func TestHandleGetOrderRun(t *testing.T) {
	orders := newOrders()
	orders["ABC12"] = app.OrderRun{
		OrderId:  "ABC12",
		Owner:    "Alice",
		Email:    "alice@example.com",
		Location: "Taco Place",
		MaxOrder: 5,
		Orders:   []app.Order{},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/getOrderRun?orderId=ABC12", nil)
	rec := httptest.NewRecorder()

	app.HandleGetOrderRun(rec, req, orders)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", ct)
	}

	// The response is shaped as a map keyed by orderId (data[orderId]).
	var got map[string]app.OrderRun
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	run, ok := got["ABC12"]
	if !ok {
		t.Fatalf("expected response keyed by orderId ABC12, got keys %v", keysOf(got))
	}
	if run.Owner != "Alice" {
		t.Errorf("expected owner Alice, got %q", run.Owner)
	}
}

func TestHandleGetOrderRunNotFound(t *testing.T) {
	orders := newOrders()

	req := httptest.NewRequest(http.MethodGet, "/api/getOrderRun?orderId=NOPE1", nil)
	rec := httptest.NewRecorder()

	app.HandleGetOrderRun(rec, req, orders)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, rec.Code)
	}
}
