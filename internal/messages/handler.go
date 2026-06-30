package messages

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetMessages(c *gin.Context) {
	custIDStr := c.Query("customer_id")
	if custIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "customer_id is required"})
		return
	}

	customerID, err := strconv.ParseUint(custIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid customer_id"})
		return
	}

	var afterID uint
	if afterStr := c.Query("after"); afterStr != "" {
		if parsedAfter, err := strconv.ParseUint(afterStr, 10, 32); err == nil {
			afterID = uint(parsedAfter)
		}
	}

	messages, err := h.service.GetByCustomer(uint(customerID), afterID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}

func (h *Handler) CreateMessage(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input CreateMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	message, err := h.service.Create(userID.(uint), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, message)
}
