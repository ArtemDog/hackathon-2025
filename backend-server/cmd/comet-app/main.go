package main

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"backend-server/internal/app/config"
	"backend-server/internal/app/dsn"
	"backend-server/internal/app/handler"
	"backend-server/internal/app/redis"
	"backend-server/internal/app/repository"
	"backend-server/internal/pkg"
)

func main() {
	ctx := context.Background()
	router := gin.Default()

	cfg, err := config.NewConfig()
	if err != nil {
		logrus.Fatalf("failed to load config: %v", err)
	}

	postgresDSN := dsn.FromEnv()
	fmt.Println(postgresDSN)

	repo, err := repository.NewRepository(
		postgresDSN,
		cfg.Minio.Endpoint,
		cfg.Minio.AccessKey,
		cfg.Minio.SecretKey,
		cfg.Minio.Bucket,
	)
	if err != nil {
		logrus.Fatalf("failed to initialize repository: %v", err)
	}

	redisClient, err := redis.New(ctx, cfg.Redis)
	if err != nil {
		logrus.Fatalf("failed to initialize Redis: %v", err)
	}
	defer redisClient.Close()

	handler := handler.NewHandler(repo, cfg, redisClient)

	app := pkg.NewApp(cfg, router, handler)
	app.RunApp()
}
