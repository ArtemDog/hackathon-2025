package orbitclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// ObservationReq matches the python service expected object
type ObservationReq struct {
	RA   float64 `json:"ra"`
	Dec  float64 `json:"dec"`
	Time string  `json:"time"`
}

// CalculateOrbit posts observations to the python orbit service and returns parsed JSON
func CalculateOrbit(observations []ObservationReq) (map[string]interface{}, error) {
	url := os.Getenv("ORBIT_SERVICE_URL")
	if url == "" {
		url = "http://localhost:8000/calculate-orbit"
	}

	payload := map[string]interface{}{"observations": observations}
	b, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal payload: %w", err)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("orbit service returned %s: %s", resp.Status, string(body))
	}

	var out map[string]interface{}
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	return out, nil
}
