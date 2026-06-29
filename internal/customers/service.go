package customers

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

type CreateCustomerInput struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Company string `json:"company"`
	Status  string `json:"status"`
}

type UpdateCustomerInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Company string `json:"company"`
	Status  string `json:"status"`
}

type DashboardStats struct {
	TotalCustomers int64 `json:"totalCustomers"`
	ActiveCustomers int64 `json:"activeCustomers"`
	PendingCustomers int64 `json:"pendingCustomers"`
	InactiveCustomers int64 `json:"inactiveCustomers"`
	Revenue        float64 `json:"revenue"`
	OpenDeals      int     `json:"openDeals"`
	TasksCompleted int     `json:"tasksCompleted"`
}

func (s *Service) Create(userID uint, input CreateCustomerInput) (*models.Customer, error) {
	status := input.Status
	if status == "" {
		status = "Active"
	}

	customer := &models.Customer{
		UserID:      userID,
		Name:        input.Name,
		Email:       input.Email,
		Phone:       input.Phone,
		Company:     input.Company,
		Status:      status,
		LastContact: time.Now(),
	}

	if err := s.repo.Create(customer); err != nil {
		return nil, errors.New("failed to create customer")
	}

	return customer, nil
}

func (s *Service) GetAll(userID uint, search string, status string) ([]models.Customer, error) {
	return s.repo.FindAll(userID, search, status)
}

func (s *Service) GetByID(id uint, userID uint) (*models.Customer, error) {
	return s.repo.FindByID(id, userID)
}

func (s *Service) Update(id uint, userID uint, input UpdateCustomerInput) (*models.Customer, error) {
	customer, err := s.repo.FindByID(id, userID)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	if input.Name != "" {
		customer.Name = input.Name
	}
	if input.Email != "" {
		customer.Email = input.Email
	}
	if input.Phone != "" {
		customer.Phone = input.Phone
	}
	if input.Company != "" {
		customer.Company = input.Company
	}
	if input.Status != "" {
		customer.Status = input.Status
	}

	customer.LastContact = time.Now()

	if err := s.repo.Update(customer); err != nil {
		return nil, errors.New("failed to update customer")
	}

	return customer, nil
}

func (s *Service) Delete(id uint, userID uint) error {
	return s.repo.Delete(id, userID)
}

func (s *Service) GetDashboardStats(userID uint) (*DashboardStats, error) {
	total, _ := s.repo.Count(userID)
	active, _ := s.repo.CountByStatus(userID, "Active")
	pending, _ := s.repo.CountByStatus(userID, "Pending")
	inactive, _ := s.repo.CountByStatus(userID, "Inactive")

	return &DashboardStats{
		TotalCustomers:    total,
		ActiveCustomers:   active,
		PendingCustomers:  pending,
		InactiveCustomers: inactive,
		Revenue:           58432,
		OpenDeals:         346,
		TasksCompleted:    86,
	}, nil
}
