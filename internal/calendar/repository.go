package calendar

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

func (r *Repository) Create(event *models.Event) error {
	return r.db.Create(event).Error
}

func (r *Repository) FindManualEvents(userID uint) ([]models.Event, error) {
	var events []models.Event
	err := r.db.Where("user_id = ?", userID).Find(&events).Error
	return events, err
}

func (r *Repository) FindTasksWithDueDates(userID uint) ([]models.Task, error) {
	var tasks []models.Task
	err := r.db.Where("user_id = ? AND due_date IS NOT NULL", userID).Find(&tasks).Error
	return tasks, err
}

func (r *Repository) FindDealsWithCloseDates(userID uint) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.db.Where("user_id = ? AND expected_close_date IS NOT NULL", userID).Find(&deals).Error
	return deals, err
}
