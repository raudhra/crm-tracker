package calendar

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

func (h *Handler) GetEvents(c *gin.Context) {
	userID, _ := c.Get("userID")

	events, err := h.service.GetCombinedEvents(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch calendar events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

func (h *Handler) CreateEvent(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input CreateEventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event, err := h.service.Create(userID.(uint), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, event)
}
