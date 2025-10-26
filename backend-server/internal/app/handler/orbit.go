package handler

import (
	"encoding/json"
	"mime/multipart"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"backend-server/internal/app/orbitclient"

	"github.com/sirupsen/logrus"
)

// CalculateOrbitHandler accepts observations JSON and forwards to python orbit service
func (h *Handler) CalculateOrbitHandler(c *gin.Context) {
	// Support both JSON body and multipart/form-data (with photo and name)
	var obsReq []orbitclient.ObservationReq

	contentType := c.ContentType()
	var cometName string
	var photoHeader *multipart.FileHeader

	if strings.HasPrefix(contentType, "multipart/") {
		// multipart: observations as JSON string in form field, plus name and photo file
		cometName = c.PostForm("name")
		observationsStr := c.PostForm("observations")
		if observationsStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "observations form field is required"})
			return
		}
		if err := json.Unmarshal([]byte(observationsStr), &obsReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid observations JSON: " + err.Error()})
			return
		}
		file, _ := c.FormFile("photo")
		photoHeader = file
	} else {
		// assume application/json
		var body struct {
			Name         string `json:"name"`
			Observations []struct {
				RA   float64 `json:"ra" binding:"required"`
				Dec  float64 `json:"dec" binding:"required"`
				Time string  `json:"time" binding:"required"`
			} `json:"observations" binding:"required"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		cometName = body.Name
		for _, o := range body.Observations {
			obsReq = append(obsReq, orbitclient.ObservationReq{RA: o.RA, Dec: o.Dec, Time: o.Time})
		}
	}

	if len(obsReq) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "need at least 5 observations"})
		return
	}

	// Создаём запись кометы в базе (с именем, если указано)
	cometNameTrim := strings.TrimSpace(cometName)
	if cometNameTrim == "" {
		cometNameTrim = "Unnamed comet"
	}
	comet, err := h.Repository.CreateComet(cometNameTrim)
	if err != nil {
		logrus.WithError(err).Error("failed to create comet record")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comet record"})
		return
	}

	// Если пришла фотография — загрузим в Minio и обновим запись
	if photoHeader != nil {
		_, err := h.Repository.UploadCometImage(comet.ID, photoHeader)
		if err != nil {
			logrus.WithError(err).Error("failed to upload comet image")
			// не фатализируем запрос — логируем и продолжаем
		}
	}

	// Теперь вызываем внешний python сервис для расчёта
	res, err := orbitclient.CalculateOrbit(obsReq)
	if err != nil {
		logrus.WithError(err).Error("failed to calculate orbit via python service")
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
