package tasks

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

type CreateTaskInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	DueDate     string `json:"due_date"`
	CustomerID  *uint  `json:"customer_id"`
	DealID      *uint  `json:"deal_id"`
}

type UpdateTaskInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	DueDate     string `json:"due_date"`
	CustomerID  *uint  `json:"customer_id"`
	DealID      *uint  `json:"deal_id"`
}

func (s *Service) Create(userID uint, input CreateTaskInput) (*models.Task, error) {
	status := input.Status
	if status == "" {
		status = "todo"
	}

	priority := input.Priority
	if priority == "" {
		priority = "med"
	}

	task := &models.Task{
		UserID:      userID,
		Title:       input.Title,
		Description: input.Description,
		Status:      status,
		Priority:    priority,
		CustomerID:  input.CustomerID,
		DealID:      input.DealID,
	}

	if input.DueDate != "" {
		t, err := time.Parse(time.RFC3339, input.DueDate)
		if err == nil {
			task.DueDate = t
		}
	}

	if err := s.repo.Create(task); err != nil {
		return nil, errors.New("failed to create task")
	}

	return task, nil
}

func (s *Service) GetAll(userID uint, status string, customerID *uint) ([]models.Task, error) {
	return s.repo.FindAll(userID, status, customerID)
}

func (s *Service) GetByID(id uint, userID uint) (*models.Task, error) {
	return s.repo.FindByID(id, userID)
}

func (s *Service) Update(id uint, userID uint, input UpdateTaskInput) (*models.Task, error) {
	task, err := s.repo.FindByID(id, userID)
	if err != nil {
		return nil, errors.New("task not found")
	}

	if input.Title != "" {
		task.Title = input.Title
	}
	if input.Description != "" {
		task.Description = input.Description
	}
	if input.Status != "" {
		task.Status = input.Status
	}
	if input.Priority != "" {
		task.Priority = input.Priority
	}
	
	// if customer ID or deal ID explicitly passed, update them
	if input.CustomerID != nil {
		task.CustomerID = input.CustomerID
	}
	if input.DealID != nil {
		task.DealID = input.DealID
	}

	if input.DueDate != "" {
		t, err := time.Parse(time.RFC3339, input.DueDate)
		if err == nil {
			task.DueDate = t
		}
	}

	if err := s.repo.Update(task); err != nil {
		return nil, errors.New("failed to update task")
	}

	return task, nil
}

func (s *Service) Delete(id uint, userID uint) error {
	return s.repo.Delete(id, userID)
}
