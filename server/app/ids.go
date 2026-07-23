package app

import (
	"math/rand"
	"strings"
)

// orderIDChars is the set of characters used to build a random order id.
const orderIDChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateRandomString generates a random string of 5 characters, including
// uppercase letters and numbers.
func GenerateRandomString() string {
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
