package deals

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

func (r *Repository) Create(deal *models.Deal) error {
	return r.db.Create(deal).Error
}

func (r *Repository) FindAll(userID uint, stage string, customerID *uint) ([]models.Deal, error) {
	var deals []models.Deal
	query := r.db.Where("user_id = ?", userID)

	if stage != "" {
		query = query.Where("stage = ?", stage)
	}

	if customerID != nil {
		query = query.Where("customer_id = ?", *customerID)
	}

	err := query.Order("created_at DESC").Find(&deals).Error
	return deals, err
}

func (r *Repository) FindByID(id uint, userID uint) (*models.Deal, error) {
	var deal models.Deal
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&deal).Error
	if err != nil {
		return nil, err
	}
	return &deal, nil
}

func (r *Repository) Update(deal *models.Deal) error {
	return r.db.Save(deal).Error
}

func (r *Repository) UpdateStage(id uint, userID uint, stage string) error {
	return r.db.Model(&models.Deal{}).Where("id = ? AND user_id = ?", id, userID).Update("stage", stage).Error
}

func (r *Repository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Deal{}).Error
}
