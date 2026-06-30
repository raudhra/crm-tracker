package models

import "time"

type LineItem struct {
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
}

type Invoice struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	UserID        uint       `json:"user_id" gorm:"index;not null"`
	InvoiceNumber string     `json:"invoice_number" gorm:"unique;not null"`
	CustomerID    uint       `json:"customer_id" gorm:"not null"`
	IssueDate     time.Time  `json:"issue_date"`
	DueDate       time.Time  `json:"due_date"`
	Status        string     `json:"status" gorm:"default:draft"` // draft, sent, paid, overdue
	LineItems     []LineItem `json:"line_items" gorm:"serializer:json"`
	TotalAmount   float64    `json:"total_amount"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}
