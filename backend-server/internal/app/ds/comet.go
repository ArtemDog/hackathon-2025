package ds

import (
	"time"

	"gorm.io/gorm"
)

// Comet представляет комету и её орбитальные параметры
type Comet struct {
	ID              uint            `gorm:"primaryKey;autoIncrement" json:"id"` // Уникальный идентификатор
	Name            string          `gorm:"type:text;not null" json:"name"`     // Имя кометы
	ImageURL        string          `gorm:"type:text" json:"image_url"`         // Ссылка на изображение в Minio
	Epoch           time.Time       `gorm:"not null" json:"epoch"`              // Эпоха орбиты
	A               float64         `gorm:"not null" json:"a"`                  // Большая полуось (AU)
	E               float64         `gorm:"not null" json:"e"`                  // Эксцентриситет
	I               float64         `gorm:"not null" json:"i"`                  // Наклонение орбиты (deg)
	Node            float64         `gorm:"not null" json:"Node"`               // Долгота восходящего узла (deg)
	ArgPeri         float64         `gorm:"not null" json:"ArgPeri"`            // Аргумент перицентра (deg)
	T               time.Time       `gorm:"not null" json:"T"`                  // Время прохождения перигелия
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `gorm:"index" json:"-"`
	Observations    []Observation   `gorm:"foreignKey:CometID" json:"observations"`     // Связь 1:N с наблюдениями
	CloseApproaches []CloseApproach `gorm:"foreignKey:CometID" json:"close_approaches"` // Связь 1:N с сближениями
}
