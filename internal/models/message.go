package models

import "time"

type Message struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	CustomerID uint      `json:"customer_id" gorm:"index;not null"`
	UserID     uint      `json:"user_id" gorm:"index;not null"`
	SenderName string    `json:"sender_name" gorm:"not null"`
	Content    string    `json:"content" gorm:"type:text;not null"`
	Channel    string    `json:"channel" gorm:"not null;default:note"` // note, email, call, meeting
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
