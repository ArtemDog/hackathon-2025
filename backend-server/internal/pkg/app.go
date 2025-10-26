package pkg

import (
	"fmt"

	"backend-server/internal/app/config"
	"backend-server/internal/app/handler"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Application представляет веб-приложение с конфигурацией, маршрутизатором и обработчиками.
type Application struct {
	Config  *config.Config
	Router  *gin.Engine
	Handler *handler.Handler
}

// NewApp возвращает новый экземпляр Application.
func NewApp(cfg *config.Config, router *gin.Engine, handler *handler.Handler) *Application {
	return &Application{
		Config:  cfg,
		Router:  router,
		Handler: handler,
	}
}

// RunApp инициализирует маршруты, Swagger UI и запускает веб-сервер.
func (a *Application) RunApp() {
	logrus.Info("Server starting...")

	a.Handler.RegisterHandler(a.Router)

	address := fmt.Sprintf("%s:%d", a.Config.ServiceHost, a.Config.ServicePort)
	if err := a.Router.Run(address); err != nil {
		logrus.Fatalf("failed to start server: %v", err)
	}

	logrus.Info("Server stopped.")
}
