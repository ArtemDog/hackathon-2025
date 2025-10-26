package handler

import (
	"backend-server/internal/app/config"
	"backend-server/internal/app/redis"
	"backend-server/internal/app/repository"
)

// Handler обрабатывает HTTP-запросы и хранит ссылки на репозиторий и конфиг
type Handler struct {
	Repository *repository.Repository
	Config     *config.Config
	Redis      *redis.Client
}

// NewHandler создает новый Handler с подключенным репозиторием и конфигом
func NewHandler(r *repository.Repository, cfg *config.Config, redisClient *redis.Client) *Handler {
	return &Handler{
		Repository: r,
		Config:     cfg,
		Redis:      redisClient,
	}
}
