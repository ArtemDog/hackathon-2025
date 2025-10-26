package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"backend-server/internal/app/orbitclient"

	"github.com/sirupsen/logrus"
)

// CalculateOrbitHandler accepts observations JSON and forwards to python orbit service
func (h *Handler) CalculateOrbitHandler(c *gin.Context) {
	var body struct {
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
	if len(body.Observations) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "need at least 5 observations"})
		return
	}

	obs := make([]orbitclient.ObservationReq, 0, len(body.Observations))
	for _, o := range body.Observations {
		obs = append(obs, orbitclient.ObservationReq{RA: o.RA, Dec: o.Dec, Time: o.Time})
	}

	res, err := orbitclient.CalculateOrbit(obs)
	if err != nil {
		logrus.WithError(err).Error("failed to calculate orbit via python service")
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}
