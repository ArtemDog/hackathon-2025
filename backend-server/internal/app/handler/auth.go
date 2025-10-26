package handler

import (
	"backend-server/internal/app/ds"
	"backend-server/internal/app/role"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// LoginRequest описывает тело запроса для аутентификации пользователя.
func (h *Handler) Login(ctx *gin.Context) {
	var body struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	if err := ctx.BindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	user, err := h.Repository.Authenticate(body.Login, body.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	accessToken, err := h.GenerateTokens(user.ID, user.Role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// Отправляем токен в заголовке ответа
	ctx.Header("Authorization", "Bearer "+accessToken)

	ctx.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"login": user.Login,
		"role":  user.Role,
	})
}

// LogoutResponse описывает успешный ответ при выходе из системы.
func (h *Handler) Logout(ctx *gin.Context) {
	var tokenStr string

	// Сначала пробуем получить токен из cookie
	if cookie, err := ctx.Cookie(cookieName); err == nil {
		tokenStr = cookie
	}

	// Если нет в cookie, пробуем из Authorization header
	if tokenStr == "" {
		authHeader := ctx.GetHeader("Authorization")
		if after, ok := strings.CutPrefix(authHeader, jwtPrefix); ok {
			tokenStr = after
		}
	}

	if tokenStr == "" {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
		return
	}

	// Проверяем валидность токена
	if _, err := jwt.ParseWithClaims(tokenStr, &ds.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.Config.JWT.AccessSecret), nil
	}); err != nil {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	// Добавляем токен в блеклист Redis
	if h.Redis != nil {
		if err := h.Redis.WriteJWTToBlacklist(ctx.Request.Context(), tokenStr, h.Config.JWT.AccessTokenTTL); err != nil {
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to blacklist token"})
			return
		}
	}

	// Удаляем cookie на клиенте
	ctx.SetCookie(cookieName, "", -1, "/", "", false, true)
	ctx.JSON(http.StatusOK, gin.H{"message": "successfully logged out"})
}

// GetUserIDFromContext извлекает user_id из контекста Gin.
// Возвращает user_id и флаг успешного извлечения.
func GetUserIDFromContext(c *gin.Context) (uint, bool) {
	id, ok := c.Get("user_id")
	if !ok {
		return 0, false
	}
	uid, ok := id.(uint)
	return uid, ok
}

// GetUserRoleFromContext извлекает роль пользователя из контекста Gin.
// Возвращает роль и флаг успешного извлечения.
func GetUserRoleFromContext(c *gin.Context) (role.Role, bool) {
	r, ok := c.Get("role")
	if !ok {
		var zero role.Role
		return zero, false
	}
	userRole, ok := r.(role.Role)
	return userRole, ok
}

// GenerateTokens создаёт новый access JWT токен для указанного пользователя и роли.
// TTL токена берётся из конфигурации.
func (h *Handler) GenerateTokens(userID uint, role role.Role) (string, error) {
	now := time.Now()

	claims := ds.JWTClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(h.Config.JWT.AccessTokenTTL)),
		},
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.Config.JWT.AccessSecret))
	if err != nil {
		return "", err
	}

	return token, nil
}
