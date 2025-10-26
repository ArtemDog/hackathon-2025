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
		// guest.POST("/users/register", h.RegisterUser)
		guest.POST("/users/login", h.Login)
	}

	usermoder := router.Group("/api")
	usermoder.Use(h.AuthMiddleware(role.User, role.Admin))
	{
		// usermoder.GET("/users/me", h.GetProfile)
		// usermoder.POST("/draft-request-of-the-distance-to-the-star/add-star", h.AddStarToRequestJSON)
		// usermoder.POST("/users/logout", h.Logout)

	}
}
