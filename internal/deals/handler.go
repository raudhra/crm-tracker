package deals

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

func (h *Handler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var input CreateDealInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deal, err := h.service.Create(userID.(uint), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, deal)
}

func (h *Handler) GetAll(c *gin.Context) {
	userID, _ := c.Get("userID")
	stage := c.Query("stage")
	
	var customerIDPtr *uint
	if custIDStr := c.Query("customer_id"); custIDStr != "" {
		if cid, err := strconv.ParseUint(custIDStr, 10, 32); err == nil {
			parsedCid := uint(cid)
			customerIDPtr = &parsedCid
		}
	}

	deals, err := h.service.GetAll(userID.(uint), stage, customerIDPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch deals"})
		return
	}

	c.JSON(http.StatusOK, deals)
}

func (h *Handler) GetByID(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid deal ID"})
		return
	}

	deal, err := h.service.GetByID(uint(id), userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "deal not found"})
		return
	}

	c.JSON(http.StatusOK, deal)
}

func (h *Handler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid deal ID"})
		return
	}

	var input UpdateDealInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deal, err := h.service.Update(uint(id), userID.(uint), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, deal)
}

func (h *Handler) UpdateStage(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid deal ID"})
		return
	}

	var input UpdateStageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateStage(uint(id), userID.(uint), input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deal stage updated"})
}

func (h *Handler) Delete(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid deal ID"})
		return
	}

	if err := h.service.Delete(uint(id), userID.(uint)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deal deleted"})
}
