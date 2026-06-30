package models

import "time"

type Deal struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	UserID            uint      `json:"user_id" gorm:"index;not null"`
	Title             string    `json:"title" gorm:"not null"`
	CustomerID        uint      `json:"customer_id" gorm:"not null"` // Required FK
	Value             float64   `json:"value" gorm:"not null;default:0"`
	Stage             string    `json:"stage" gorm:"default:lead"`
	ExpectedCloseDate time.Time `json:"expected_close_date"`
	Notes             string    `json:"notes"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}
