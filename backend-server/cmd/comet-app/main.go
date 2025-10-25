package main

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"backend-server/internal/app/config"
	"backend-server/internal/app/handler"
	"backend-server/internal/pkg"
)

func main() {
	router := gin.Default()

	// 1. Загрузка конфигурации
	conf, err := config.NewConfig()
	if err != nil {
		logrus.Fatalf("error loading config: %v", err)
	}

	// 2. Создание хендлера
	hand := handler.NewHandler()

	// 3. Инициализация и запуск приложения
	app := pkg.NewApp(conf, router, hand)
	app.RunApp()
}
