package customers

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

func (r *Repository) Create(customer *models.Customer) error {
	return r.db.Create(customer).Error
}

func (r *Repository) FindAll(userID uint, search string, status string) ([]models.Customer, error) {
	var customers []models.Customer
	query := r.db.Where("user_id = ?", userID)

	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if status != "" && status != "All" {
		query = query.Where("status = ?", status)
	}

	err := query.Order("created_at DESC").Find(&customers).Error
	return customers, err
}

func (r *Repository) FindByID(id uint, userID uint) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&customer).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *Repository) Update(customer *models.Customer) error {
	return r.db.Save(customer).Error
}

func (r *Repository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Customer{}).Error
}

func (r *Repository) Count(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Customer{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

func (r *Repository) CountByStatus(userID uint, status string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Customer{}).Where("user_id = ? AND status = ?", userID, status).Count(&count).Error
	return count, err
}
