package dsn

import (
	"fmt"
	"os"
)

// FromEnv формирует DSN для подключения к PostgreSQL из переменных окружения
func FromEnv() string {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")

	if host == "" || user == "" || dbname == "" {
		panic("missing required database environment variables")
	}

	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, pass, dbname,
	)
}
