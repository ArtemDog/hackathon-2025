package handler

import (
	"backend-server/internal/app/role"

	"github.com/gin-gonic/gin"
)

// RegisterHandler регистрирует все маршруты для обработки HTTP-запросов
func (h *Handler) RegisterHandler(router *gin.Engine) {

	// Доступ только для гостей
	guest := router.Group("/api")
	guest.Use(h.BlockAuthUsers())
	{
		guest.POST("/users/registration", h.Registration)
		guest.POST("/users/login", h.Login)
	}

	usermoder := router.Group("/api")
	usermoder.Use(h.AuthMiddleware(role.User, role.Admin))
	{
		usermoder.POST("/orbit/calculate", h.CalculateOrbitHandler)
		usermoder.GET("/users/profile", h.GetProfile)
		usermoder.PUT("/users/profile/updating", h.UpdateProfile)
		usermoder.POST("/users/logout", h.Logout)

	}
}
