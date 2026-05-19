package customers

import (
	"crm-tracker/internal/models"
)

type Service interface {
	GetAllCustomers() ([]models.Customer, error)
	GetCustomerByID(id uint) (*models.Customer, error)
	CreateCustomer(customer *models.Customer) error
	UpdateCustomer(id uint, customer *models.Customer) error
	DeleteCustomer(id uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

func (s *service) GetAllCustomers() ([]models.Customer, error) {
	return s.repo.GetAll()
}

func (s *service) GetCustomerByID(id uint) (*models.Customer, error) {
	return s.repo.GetByID(id)
}

func (s *service) CreateCustomer(customer *models.Customer) error {
	return s.repo.Create(customer)
}

func (s *service) UpdateCustomer(id uint, customer *models.Customer) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	customer.ID = existing.ID
	return s.repo.Update(customer)
}

func (s *service) DeleteCustomer(id uint) error {
	return s.repo.Delete(id)
}
