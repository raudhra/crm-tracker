package models

import "time"

type Customer struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"index;not null"`
	Name        string    `json:"name" gorm:"not null"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	Company     string    `json:"company"`
	Status      string    `json:"status" gorm:"default:Active"`
	LastContact time.Time `json:"last_contact"`
	Avatar      string    `json:"avatar"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
