package repository

import (
	"context"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Repository реализует доступ к данным о звёздах и заявках, а также к Minio-хранилищу.
type Repository struct {
	db          *gorm.DB
	minioClient *minio.Client
	bucketName  string
}

// NewRepository создаёт новый экземпляр Repository, подключается к базе данных PostgreSQL и Minio.
// dsn — строка подключения к PostgreSQL.
// minioEndpoint — адрес Minio-сервера.
// minioAccessKey, minioSecretKey — учётные данные для доступа к Minio.
// minioBucket — имя бакета для хранения файлов.
// Возвращает указатель на Repository или ошибку подключения.
func NewRepository(dsn, minioEndpoint, minioAccessKey, minioSecretKey, minioBucket string) (*Repository, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	minioClient, err := minio.New(minioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(minioAccessKey, minioSecretKey, ""),
		Secure: false, // true если используете https
	})
	if err != nil {
		return nil, err
	}

	// Проверяем, существует ли бакет, если нет — создаём
	exists, err := minioClient.BucketExists(context.Background(), minioBucket)
	if err != nil {
		return nil, err
	}
	if !exists {
		err = minioClient.MakeBucket(context.Background(), minioBucket, minio.MakeBucketOptions{})
		if err != nil {
			return nil, err
		}
	}

	return &Repository{
		db:          db,
		minioClient: minioClient,
		bucketName:  minioBucket,
	}, nil
}
