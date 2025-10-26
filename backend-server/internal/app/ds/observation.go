package ds

import (
	"time"

	"gorm.io/gorm"
)

// Observation хранит отдельное наблюдение кометы
type Observation struct {
	ID         uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	CometID    uint           `gorm:"not null;index" json:"comet_id"` // Ссылка на комету
	RA         float64        `gorm:"not null" json:"ra"`             // Прямое восхождение (deg)
	Dec        float64        `gorm:"not null" json:"dec"`            // Склонение (deg)
	ObservedAt time.Time      `gorm:"not null" json:"observed_at"`    // Время наблюдения
	PhotoURL   string         `gorm:"type:text" json:"photo_url"`     // Ссылка на фото
	Notes      string         `gorm:"type:text" json:"notes"`         // Опциональные заметки
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
