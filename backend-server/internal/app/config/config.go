package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServiceHost string
	ServicePort int
}

func NewConfig() (*Config, error) {
	port, _ := strconv.Atoi(getEnv("SERVICE_PORT", "8080"))
	return &Config{
		ServiceHost: getEnv("SERVICE_HOST", "0.0.0.0"),
		ServicePort: port,
	}, nil
}

func getEnv(key, def string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return def
}
