package invoices

import (
	"crm-tracker/internal/models"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(invoice *models.Invoice) error {
	return r.db.Create(invoice).Error
}

func (r *Repository) FindAll(userID uint, status string, customerID *uint) ([]models.Invoice, error) {
	var invoices []models.Invoice
	query := r.db.Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if customerID != nil {
		query = query.Where("customer_id = ?", *customerID)
	}

	err := query.Order("created_at DESC").Find(&invoices).Error
	return invoices, err
}

func (r *Repository) FindByID(id uint, userID uint) (*models.Invoice, error) {
	var invoice models.Invoice
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&invoice).Error
	if err != nil {
		return nil, err
	}
	return &invoice, nil
}

func (r *Repository) Update(invoice *models.Invoice) error {
	return r.db.Save(invoice).Error
}

func (r *Repository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Invoice{}).Error
}
