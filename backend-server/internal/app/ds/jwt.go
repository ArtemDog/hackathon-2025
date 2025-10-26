package ds

import (
	"backend-server/internal/app/role"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims структура для токена
type JWTClaims struct {
	UserID uint      `json:"user_id"`
	Role   role.Role `json:"role"`
	jwt.RegisteredClaims
}
