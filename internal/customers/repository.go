package customers

import (
	"crm-tracker/internal/models"
	"gorm.io/gorm"
)

type Repository interface {
	GetAll() ([]models.Customer, error)
	GetByID(id uint) (*models.Customer, error)
	Create(customer *models.Customer) error
	Update(customer *models.Customer) error
	Delete(id uint) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db}
}

func (r *repository) GetAll() ([]models.Customer, error) {
	var customers []models.Customer
	err := r.db.Preload("Deals").Preload("Tasks").Find(&customers).Error
	return customers, err
}

func (r *repository) GetByID(id uint) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.Preload("Deals").Preload("Tasks").First(&customer, id).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *repository) Create(customer *models.Customer) error {
	return r.db.Create(customer).Error
}

func (r *repository) Update(customer *models.Customer) error {
	return r.db.Save(customer).Error
}

func (r *repository) Delete(id uint) error {
	return r.db.Delete(&models.Customer{}, id).Error
}
