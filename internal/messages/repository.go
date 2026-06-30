package messages

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

func (r *Repository) Create(message *models.Message) error {
	return r.db.Create(message).Error
}

func (r *Repository) FindByCustomer(customerID uint, afterID uint) ([]models.Message, error) {
	var messages []models.Message
	query := r.db.Where("customer_id = ?", customerID)

	if afterID > 0 {
		query = query.Where("id > ?", afterID)
	}

	err := query.Order("id ASC").Find(&messages).Error
	return messages, err
}
