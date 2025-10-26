package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

// MinioConfig содержит настройки подключения к MinIO.
type MinioConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
}

// JWTConfig содержит параметры для работы с JWT.
type JWTConfig struct {
	AccessSecret   string
	RefreshSecret  string
	AccessTokenTTL time.Duration
	//RefreshTokenTTL time.Duration
}

// RedisConfig содержит параметры подключения к Redis.
type RedisConfig struct {
	Host        string
	User        string
	Password    string
	Port        int
	DialTimeout time.Duration
	ReadTimeout time.Duration
}

// Config объединяет все настройки приложения.
type Config struct {
	ServiceHost string
	ServicePort int
	Minio       MinioConfig
	Redis       RedisConfig
	JWT         JWTConfig
}

// NewConfig загружает конфигурацию приложения из .env и TOML-файла.
func NewConfig() (*Config, error) {
	_ = godotenv.Load()

	configName := os.Getenv("CONFIG_NAME")
	if configName == "" {
		configName = "config"
	}

	viper.SetConfigName(configName)
	viper.SetConfigType("toml")
	viper.AddConfigPath("config")
	viper.AddConfigPath(".")
	viper.WatchConfig()

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	cfg := &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, err
	}

	log.Info("Config successfully parsed")

	cfg.Minio = MinioConfig{
		Endpoint:  os.Getenv("MINIO_ENDPOINT"),
		AccessKey: os.Getenv("MINIO_ACCESS_KEY"),
		SecretKey: os.Getenv("MINIO_SECRET_KEY"),
		Bucket:    os.Getenv("MINIO_BUCKET"),
	}

	cfg.JWT = JWTConfig{
		AccessSecret:   os.Getenv("JWT_ACCESS_SECRET"),
		RefreshSecret:  os.Getenv("JWT_REFRESH_SECRET"),
		AccessTokenTTL: 15 * time.Minute,
		//RefreshTokenTTL: 7 * 24 * time.Hour,
	}

	cfg.Redis = RedisConfig{
		Host:        viper.GetString("redis.host"),
		User:        viper.GetString("redis.user"),
		Password:    os.Getenv("REDIS_PASSWORD"),
		Port:        viper.GetInt("redis.port"),
		DialTimeout: 5 * time.Second,
		ReadTimeout: 3 * time.Second,
	}

	return cfg, nil
}
