package tests

import (
	"strings"
	"testing"

	"grubrun/app"
)

func TestGenerateRandomString(t *testing.T) {
	const validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	for i := 0; i < 100; i++ {
		s := app.GenerateRandomString()

		if len(s) != 5 {
			t.Fatalf("expected length 5, got %d for %q", len(s), s)
		}

		for _, c := range s {
			if !strings.ContainsRune(validChars, c) {
				t.Fatalf("string %q contains invalid character %q", s, c)
			}
		}
	}
}

func TestGenerateRandomStringVaries(t *testing.T) {
	// A tiny sanity check that the generator isn't returning a constant value.
	seen := make(map[string]bool)
	for i := 0; i < 50; i++ {
		seen[app.GenerateRandomString()] = true
	}
	if len(seen) < 2 {
		t.Fatalf("expected varied output, only saw %d distinct value(s)", len(seen))
	}
}
