package messages

import (
	"errors"

	"crm-tracker/internal/auth"
	"crm-tracker/internal/models"
)

type Service struct {
	repo     *Repository
	authRepo *auth.Repository
}

func NewService(repo *Repository, authRepo *auth.Repository) *Service {
	return &Service{repo: repo, authRepo: authRepo}
}

type CreateMessageInput struct {
	CustomerID uint   `json:"customer_id" binding:"required"`
	Content    string `json:"content" binding:"required"`
	Channel    string `json:"channel"`
}

func (s *Service) Create(userID uint, input CreateMessageInput) (*models.Message, error) {
	user, err := s.authRepo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	senderName := user.Name
	if senderName == "" {
		senderName = user.Email
	}

	channel := input.Channel
	if channel == "" {
		channel = "note"
	}

	message := &models.Message{
		CustomerID: input.CustomerID,
		UserID:     userID,
		SenderName: senderName,
		Content:    input.Content,
		Channel:    channel,
	}

	if err := s.repo.Create(message); err != nil {
		return nil, errors.New("failed to create message")
	}

	return message, nil
}

func (s *Service) GetByCustomer(customerID uint, afterID uint) ([]models.Message, error) {
	return s.repo.FindByCustomer(customerID, afterID)
}
