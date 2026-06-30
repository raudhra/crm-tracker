package tasks

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

func (r *Repository) Create(task *models.Task) error {
	return r.db.Create(task).Error
}

func (r *Repository) FindAll(userID uint, status string, customerID *uint) ([]models.Task, error) {
	var tasks []models.Task
	query := r.db.Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if customerID != nil {
		query = query.Where("customer_id = ?", *customerID)
	}

	err := query.Order("created_at DESC").Find(&tasks).Error
	return tasks, err
}

func (r *Repository) FindByID(id uint, userID uint) (*models.Task, error) {
	var task models.Task
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&task).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

func (r *Repository) Update(task *models.Task) error {
	return r.db.Save(task).Error
}

func (r *Repository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Task{}).Error
}
