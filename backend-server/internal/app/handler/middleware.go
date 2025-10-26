package handler

import (
	"backend-server/internal/app/ds"
	"backend-server/internal/app/role"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v5"
)

const (
	jwtPrefix  = "Bearer "
	cookieName = "access_token"
)

// AuthMiddleware возвращает Gin middleware для проверки JWT токена,
// роли пользователя и наличия токена в блеклисте Redis.
// Если allowedRoles не пуст, доступ разрешается только указанным ролям.
func (h *Handler) AuthMiddleware(allowedRoles ...role.Role) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var tokenStr string

		// Получаем токен из cookie или заголовка Authorization
		if cookie, err := ctx.Cookie(cookieName); err == nil {
			tokenStr = cookie
		} else if authHeader := ctx.GetHeader("Authorization"); strings.HasPrefix(authHeader, jwtPrefix) {
			tokenStr = strings.TrimPrefix(authHeader, jwtPrefix)
		}

		if tokenStr == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
			return
		}

		// Проверка токена в блеклисте Redis
		if h.Redis != nil {
			if err := h.Redis.CheckJWTInBlacklist(ctx.Request.Context(), tokenStr); err == nil {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token is blacklisted"})
				return
			} else if !errors.Is(err, redis.Nil) {
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "redis error"})
				return
			}
		}

		// Парсинг JWT
		token, err := jwt.ParseWithClaims(tokenStr, &ds.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(h.Config.JWT.AccessSecret), nil
		})
		if err != nil || !token.Valid {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := token.Claims.(*ds.JWTClaims)
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		// Сохраняем user_id и роль в контексте
		ctx.Set("user_id", claims.UserID)
		ctx.Set("role", claims.Role)

		// Проверка ролей, если указаны
		if len(allowedRoles) > 0 {
			hasRole := false
			for _, r := range allowedRoles {
				if claims.Role == r {
					hasRole = true
					break
				}
			}
			if !hasRole {
				ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
				return
			}
		}

		ctx.Next()
	}
}

// BlockAuthUsers блокирует доступ авторизованным пользователям (User/Admin) к публичным маршрутам
func (h *Handler) BlockAuthUsers() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var tokenStr string

		// Получаем токен из cookie или заголовка Authorization
		if cookie, err := ctx.Cookie(cookieName); err == nil {
			tokenStr = cookie
		} else if authHeader := ctx.GetHeader("Authorization"); strings.HasPrefix(authHeader, jwtPrefix) {
			tokenStr = strings.TrimPrefix(authHeader, jwtPrefix)
		}

		if tokenStr == "" {
			// Токена нет — неавторизованный пользователь, можно проходить
			ctx.Next()
			return
		}

		// Проверка токена в блеклисте Redis
		if h.Redis != nil {
			if err := h.Redis.CheckJWTInBlacklist(ctx.Request.Context(), tokenStr); err == nil {
				// Токен найден в блеклисте — запрещаем
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token is blacklisted"})
				return
			} else if !errors.Is(err, redis.Nil) {
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "redis error"})
				return
			}
		}

		// Парсинг JWT
		token, err := jwt.ParseWithClaims(tokenStr, &ds.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(h.Config.JWT.AccessSecret), nil
		})
		if err != nil || !token.Valid {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := token.Claims.(*ds.JWTClaims)
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		// Если пользователь авторизован, блокируем доступ
		if claims.Role == role.User || claims.Role == role.Admin {
			ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "public route not accessible for authorized users"})
			return
		}

		ctx.Next()
	}
}
