package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"grubrun/app"
)

func TestCorsMiddlewareSetsHeaders(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/api/getOrderRun", nil)
	rec := httptest.NewRecorder()

	app.CorsMiddleware(next).ServeHTTP(rec, req)

	if !called {
		t.Error("expected the wrapped handler to be called for a GET request")
	}
	if origin := rec.Header().Get("Access-Control-Allow-Origin"); origin != "*" {
		t.Errorf("expected Access-Control-Allow-Origin *, got %q", origin)
	}
	if methods := rec.Header().Get("Access-Control-Allow-Methods"); methods != "GET, POST, OPTIONS" {
		t.Errorf("unexpected Access-Control-Allow-Methods: %q", methods)
	}
}

func TestCorsMiddlewareHandlesPreflight(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	req := httptest.NewRequest(http.MethodOptions, "/api/createOrder", nil)
	rec := httptest.NewRecorder()

	app.CorsMiddleware(next).ServeHTTP(rec, req)

	if called {
		t.Error("preflight OPTIONS request should not reach the wrapped handler")
	}
	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected status %d for preflight, got %d", http.StatusNoContent, rec.Code)
	}
}
