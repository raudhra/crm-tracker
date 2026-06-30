package deals

import (
	"errors"
	"time"

	"crm-tracker/internal/models"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateDealInput struct {
	Title             string  `json:"title" binding:"required"`
	CustomerID        uint    `json:"customer_id" binding:"required"`
	Value             float64 `json:"value"`
	Stage             string  `json:"stage"`
	ExpectedCloseDate string  `json:"expected_close_date"`
	Notes             string  `json:"notes"`
}

type UpdateDealInput struct {
	Title             string  `json:"title"`
	Value             float64 `json:"value"`
	ExpectedCloseDate string  `json:"expected_close_date"`
	Notes             string  `json:"notes"`
}

type UpdateStageInput struct {
	Stage string `json:"stage" binding:"required"`
}

func (s *Service) Create(userID uint, input CreateDealInput) (*models.Deal, error) {
	stage := input.Stage
	if stage == "" {
		stage = "lead"
	}

	deal := &models.Deal{
		UserID:     userID,
		Title:      input.Title,
		CustomerID: input.CustomerID,
		Value:      input.Value,
		Stage:      stage,
		Notes:      input.Notes,
	}

	if input.ExpectedCloseDate != "" {
		t, err := time.Parse(time.RFC3339, input.ExpectedCloseDate)
		if err == nil {
			deal.ExpectedCloseDate = t
		}
	}

	if err := s.repo.Create(deal); err != nil {
		return nil, errors.New("failed to create deal")
	}

	return deal, nil
}

func (s *Service) GetAll(userID uint, stage string, customerID *uint) ([]models.Deal, error) {
	return s.repo.FindAll(userID, stage, customerID)
}

func (s *Service) GetByID(id uint, userID uint) (*models.Deal, error) {
	return s.repo.FindByID(id, userID)
}

func (s *Service) Update(id uint, userID uint, input UpdateDealInput) (*models.Deal, error) {
	deal, err := s.repo.FindByID(id, userID)
	if err != nil {
		return nil, errors.New("deal not found")
	}

	if input.Title != "" {
		deal.Title = input.Title
	}
	if input.Value >= 0 { // allow updating value
		deal.Value = input.Value
	}
	if input.Notes != "" {
		deal.Notes = input.Notes
	}
	if input.ExpectedCloseDate != "" {
		t, err := time.Parse(time.RFC3339, input.ExpectedCloseDate)
		if err == nil {
			deal.ExpectedCloseDate = t
		}
	}

	if err := s.repo.Update(deal); err != nil {
		return nil, errors.New("failed to update deal")
	}

	return deal, nil
}

func (s *Service) UpdateStage(id uint, userID uint, input UpdateStageInput) error {
	if input.Stage == "" {
		return errors.New("stage is required")
	}
	if err := s.repo.UpdateStage(id, userID, input.Stage); err != nil {
		return errors.New("failed to update deal stage")
	}
	return nil
}

func (s *Service) Delete(id uint, userID uint) error {
	return s.repo.Delete(id, userID)
}
