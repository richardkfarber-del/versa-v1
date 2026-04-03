package main

import (
	"log"
	"net/http"
)

func main() {
	// API endpoint for creating a new pairing session
	http.HandleFunc("/pair/create", createPairingSession)

	// API endpoint for accepting a pairing invitation
	http.HandleFunc("/pair/accept", acceptPairingInvitation)

	// WebSocket endpoint for the paired session
	http.HandleFunc("/ws", handleWebSocket)

	log.Println("Starting server on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
