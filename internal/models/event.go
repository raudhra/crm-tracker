package models

import "time"

type Event struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"index;not null"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time" gorm:"not null"`
	EndTime     time.Time `json:"end_time"`
	Type        string    `json:"type" gorm:"not null;default:custom"` // meeting, custom
	LinkedID    *uint     `json:"linked_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
