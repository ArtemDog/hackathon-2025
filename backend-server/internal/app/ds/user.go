package ds

import "backend-server/internal/app/role"

// User представляет пользователя системы
type User struct {
	ID       uint      `gorm:"primaryKey;autoIncrement" json:"id"`       // уникальный идентификатор пользователя
	Name     string    `gorm:"varchar(100);not null" json:"name"`        // имя пользователя (не null)
	Login    string    `gorm:"varchar(25);unique;not null" json:"login"` // логин пользователя (уникальный, not null)
	Password string    `gorm:"varchar(100);not null" json:"-"`           // пароль (не возвращается в JSON, not null)
	Role     role.Role `gorm:"int;not null;default:0" json:"role"`       // роль пользователя (not null, по умолчанию Guest)
}
