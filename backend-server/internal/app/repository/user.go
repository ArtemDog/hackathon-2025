package repository

import (
	"backend-server/internal/app/ds"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func (r *Repository) GetByLogin(login string) *ds.User {
	var user ds.User
	if err := r.db.Where("login = ?", login).First(&user).Error; err != nil {
		return nil
	}
	return &user
}

func (r *Repository) Create(user *ds.User) error {
	return r.db.Create(user).Error
}

// Authenticate выполняет аутентификацию пользователя по логину и паролю.
// Возвращает пользователя или ошибку, если логин или пароль неверны.
func (r *Repository) Authenticate(login, password string) (*ds.User, error) {
	var user ds.User
	if err := r.db.Where("login = ?", login).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Сравниваем введённый пароль с хешем
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	return &user, nil
}

func (r *Repository) GetByID(id uint) (*ds.User, error) {
	var user ds.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) Update(user *ds.User) error {
	return r.db.Save(user).Error
}
