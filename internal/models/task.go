package models

import "time"

type Task struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"index;not null"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Status      string    `json:"status" gorm:"default:todo"`
	Priority    string    `json:"priority" gorm:"default:med"`
	DueDate     time.Time `json:"due_date"`
	CustomerID  *uint     `json:"customer_id"` // Optional
	DealID      *uint     `json:"deal_id"`     // Optional
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
