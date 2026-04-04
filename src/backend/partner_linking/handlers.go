package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Session represents a pairing session
type Session struct {
	ID          string    `json:"id"`
	InviteCode  string    `json:"invite_code"`
	PartnerAKey string    `json:"partner_a_key"`
	PartnerBKey string    `json:"partner_b_key,omitempty"`
	TempTokenA  string    `json:"temp_token_a,omitempty"`
	TempTokenB  string    `json:"temp_token_b,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	Paired      bool      `json:"paired"`
}

// In-memory storage for sessions (for MVP)
var (
	sessions = make(map[string]*Session)
	mutex    = &sync.Mutex{}
)

// Generates a secure random string for tokens
func generateAuthToken() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Generates a random 6-character alphanumeric string
func generateInviteCode() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		for i := range b {
			b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
		}
		return string(b)
	}
	for i, val := range b {
		b[i] = charset[val%byte(len(charset))]
	}
	return string(b)
}

// Generate a new UUID v4
func newUUIDv4() (string, error) {
	uuid := make([]byte, 16)
	n, err := rand.Read(uuid)
	if n != len(uuid) || err != nil {
		return "", err
	}
	uuid[8] = uuid[8]&^0xc0 | 0x80
	uuid[6] = uuid[6]&^0xf0 | 0x40
	return fmt.Sprintf("%x-%x-%x-%x-%x", uuid[0:4], uuid[4:6], uuid[6:8], uuid[8:10], uuid[10:]), nil
}

// createPairingSession handles the creation of a new pairing session
func createPairingSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		PublicKey string `json:"public_key"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	sessionID, err := newUUIDv4()
	if err != nil {
		http.Error(w, "Failed to generate session ID", http.StatusInternalServerError)
		return
	}
	inviteCode := generateInviteCode()
	tokenA, err := generateAuthToken()
	if err != nil {
		http.Error(w, "Failed to generate auth token", http.StatusInternalServerError)
		return
	}

	session := &Session{
		ID:          sessionID,
		InviteCode:  inviteCode,
		PartnerAKey: req.PublicKey,
		TempTokenA:  tokenA,
		CreatedAt:   time.Now(),
		Paired:      false,
	}

	sessions[sessionID] = session

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":           session.ID,
		"invite_code":  session.InviteCode,
		"temp_token_a": session.TempTokenA,
	})
}

// acceptPairingInvitation handles the acceptance of a pairing invitation
func acceptPairingInvitation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		InviteCode string `json:"invite_code"`
		PublicKey  string `json:"public_key"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	var foundSession *Session
	for _, session := range sessions {
		if session.InviteCode == req.InviteCode && !session.Paired {
			foundSession = session
			break
		}
	}

	if foundSession == nil {
		http.Error(w, "Invalid or expired invite code", http.StatusNotFound)
		return
	}

	if time.Since(foundSession.CreatedAt) > 10*time.Minute {
		delete(sessions, foundSession.ID)
		http.Error(w, "Invite code expired", http.StatusNotFound)
		return
	}

	tokenB, err := generateAuthToken()
	if err != nil {
		http.Error(w, "Failed to generate auth token", http.StatusInternalServerError)
		return
	}

	foundSession.PartnerBKey = req.PublicKey
	foundSession.TempTokenB = tokenB
	foundSession.Paired = true

	notifyPartner(foundSession.ID, "pairing_successful", map[string]string{
		"partner_a_key": foundSession.PartnerAKey,
		"partner_b_key": foundSession.PartnerBKey,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"id":           foundSession.ID,
		"temp_token_b": foundSession.TempTokenB,
	})
}
