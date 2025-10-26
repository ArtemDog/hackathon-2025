package repository

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"
	"unicode"

	"backend-server/internal/app/ds"

	"github.com/minio/minio-go/v7"
)

// CreateComet создает запись кометы с указанным именем.
// Инициализирует обязательные поля дефолтными значениями (времена = now).
func (r *Repository) CreateComet(name string) (*ds.Comet, error) {
	now := time.Now()
	comet := &ds.Comet{
		Name:    name,
		Epoch:   now,
		A:       0.0,
		E:       0.0,
		I:       0.0,
		Node:    0.0,
		ArgPeri: 0.0,
		T:       now,
	}
	if err := r.db.Create(comet).Error; err != nil {
		return nil, err
	}
	return comet, nil
}

// UpdateCometImageURL обновляет image_url у кометы.
func (r *Repository) UpdateCometImageURL(id uint, imageURL string) error {
	return r.db.Model(&ds.Comet{}).Where("id = ?", id).Update("image_url", imageURL).Error
}

// UploadCometImage загружает файл в Minio и обновляет запись кометы.
func (r *Repository) UploadCometImage(id uint, fileHeader *multipart.FileHeader) (string, error) {
	var comet ds.Comet
	if err := r.db.First(&comet, id).Error; err != nil {
		return "", err
	}

	// удаляем старое изображение, если есть
	if comet.ImageURL != "" {
		parts := strings.Split(comet.ImageURL, "/")
		objectName := parts[len(parts)-1]
		_ = r.minioClient.RemoveObject(context.Background(), r.bucketName, objectName, minio.RemoveObjectOptions{})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	base := strings.TrimSuffix(fileHeader.Filename, ext)
	latinBase := toLatin(base)

	objectName := fmt.Sprintf("comet-%s%s", latinBase, ext)

	_, err = r.minioClient.PutObject(context.Background(), r.bucketName, objectName, file, fileHeader.Size, minio.PutObjectOptions{ContentType: fileHeader.Header.Get("Content-Type")})
	if err != nil {
		return "", err
	}

	imageURL := fmt.Sprintf("http://%s/%s/%s", r.minioClient.EndpointURL().Host, r.bucketName, objectName)

	if err := r.db.Model(&ds.Comet{}).Where("id = ?", id).Update("image_url", imageURL).Error; err != nil {
		return "", err
	}

	return imageURL, nil
}

// helper toLatin
func toLatin(s string) string {
	var out strings.Builder
	for _, r := range s {
		if unicode.IsLetter(r) && r <= unicode.MaxASCII {
			out.WriteRune(unicode.ToLower(r))
		} else if unicode.IsDigit(r) {
			out.WriteRune(r)
		}
	}
	return out.String()
}
