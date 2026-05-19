package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"unique;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Customer struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `json:"email"`
	Company   string    `json:"company"`
	Status    string    `gorm:"not null;default:'active'" json:"status"` // active, lead, lost
	Deals     []Deal    `json:"deals,omitempty" gorm:"foreignKey:CustomerID"`
	Tasks     []Task    `json:"tasks,omitempty" gorm:"foreignKey:CustomerID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Deal struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Title      string    `gorm:"not null" json:"title"`
	Value      float64   `gorm:"not null" json:"value"`
	Stage      string    `gorm:"not null;default:'prospect'" json:"stage"` // prospect, negotiation, won, lost
	CustomerID uint      `json:"customer_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Task struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	DueDate     time.Time `json:"due_date"`
	IsCompleted bool      `gorm:"not null;default:false" json:"is_completed"`
	CustomerID  uint      `json:"customer_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
