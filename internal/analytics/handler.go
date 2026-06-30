package analytics

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetRevenueMonthly(c *gin.Context) {
	userID, _ := c.Get("userID")
	data, err := h.service.GetRevenueMonthly(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch revenue data"})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *Handler) GetPipelineByStage(c *gin.Context) {
	userID, _ := c.Get("userID")
	data, err := h.service.GetPipelineByStage(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch pipeline data"})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *Handler) GetNewCustomersMonthly(c *gin.Context) {
	userID, _ := c.Get("userID")
	data, err := h.service.GetNewCustomersMonthly(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch customer data"})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *Handler) GetTaskStats(c *gin.Context) {
	userID, _ := c.Get("userID")
	data, err := h.service.GetTaskStats(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch task stats"})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *Handler) GetKeyMetrics(c *gin.Context) {
	userID, _ := c.Get("userID")
	data, err := h.service.GetKeyMetrics(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch metrics"})
		return
	}
	c.JSON(http.StatusOK, data)
}
