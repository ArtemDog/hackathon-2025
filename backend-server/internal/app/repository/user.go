package repository

import (
	"backend-server/internal/app/ds"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

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
