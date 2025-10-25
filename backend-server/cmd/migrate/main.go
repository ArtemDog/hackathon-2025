package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"backend-server/internal/app/dsn"
)

func main() {
	// Загружаем переменные окружения из .env
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env file not found, using system environment variables")
	}

	// Получаем строку подключения
	dsnString := dsn.FromEnv()
	fmt.Println("🔗 Connecting to DB with DSN:", dsnString)

	// Подключаемся к PostgreSQL
	db, err := gorm.Open(postgres.Open(dsnString), &gorm.Config{})
	if err != nil {
		log.Fatalf(" Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf(" Failed to get generic DB object: %v", err)
	}
	defer sqlDB.Close()

	// Проверяем подключение
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf(" Database ping failed: %v", err)
	}

	fmt.Println("✅ Successfully connected to PostgreSQL!")
}
