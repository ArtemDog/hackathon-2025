package ds

import (
	"time"

	"gorm.io/gorm"
)

// CloseApproach хранит результаты расчёта минимального сближения с Землей
type CloseApproach struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	CometID     uint           `gorm:"not null;index" json:"comet_id"` // Ссылка на комету
	ClosestDate time.Time      `gorm:"not null" json:"closest_date"`   // Дата минимального сближения
	DistanceAU  float64        `gorm:"not null" json:"distance_au"`    // Расстояние до Земли (AU)
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
