package main

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from a specific origin
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000" // Example: Allow frontend running on localhost
	},
}

// Client represents a connected WebSocket client
type Client struct {
	Conn      *websocket.Conn
	SessionID string
}

// In-memory store for clients
var (
	clients      = make(map[*websocket.Conn]*Client)
	broadcast    = make(chan Message)
	clientsMutex = &sync.Mutex{}
)

// Message represents a message to be broadcasted
type Message struct {
	SessionID string      `json:"session_id"`
	Event     string      `json:"event"`
	Payload   interface{} `json:"payload"`
	Sender    *websocket.Conn
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	token := r.URL.Query().Get("token")
	if sessionID == "" || token == "" {
		http.Error(w, "Session ID and token are required", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	session, ok := sessions[sessionID]
	if !ok {
		mutex.Unlock()
		http.Error(w, "Invalid session ID", http.StatusNotFound)
		return
	}

	// Check if the token is valid and consume it
	var validToken bool
	if session.TempTokenA != "" && session.TempTokenA == token {
		validToken = true
		session.TempTokenA = "" // Consume token
	} else if session.TempTokenB != "" && session.TempTokenB == token {
		validToken = true
		session.TempTokenB = "" // Consume token
	}
	mutex.Unlock()

	if !validToken {
		http.Error(w, "Invalid authentication token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	client := &Client{Conn: conn, SessionID: sessionID}
	clientsMutex.Lock()
	clients[conn] = client
	clientsMutex.Unlock()

	log.Printf("Client connected to session %s", sessionID)

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Read error: %v", err)
			clientsMutex.Lock()
			delete(clients, conn)
			clientsMutex.Unlock()
			break
		}
		msg.Sender = conn // Identify the sender
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		clientsMutex.Lock()
		for clientConn, client := range clients {
			if client.SessionID == msg.SessionID && clientConn != msg.Sender {
				err := clientConn.WriteJSON(msg)
				if err != nil {
					log.Printf("Write error: %v", err)
					clientConn.Close()
					delete(clients, clientConn)
				}
			}
		}
		clientsMutex.Unlock()
	}
}

func notifyPartner(sessionID string, event string, payload interface{}) {
	msg := Message{
		SessionID: sessionID,
		Event:     event,
		Payload:   payload,
	}
	// Give a moment for the WebSocket connection to be established
	time.AfterFunc(1*time.Second, func() {
		broadcast <- msg
	})
}

func init() {
	go handleMessages()
}
