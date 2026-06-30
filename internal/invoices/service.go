package invoices

import (
	"errors"
	"fmt"
	"time"

	"crm-tracker/internal/customers"
	"crm-tracker/internal/models"
)

type Service struct {
	repo         *Repository
	customerRepo *customers.Repository
}

func NewService(repo *Repository, customerRepo *customers.Repository) *Service {
	return &Service{repo: repo, customerRepo: customerRepo}
}

type CreateInvoiceInput struct {
	InvoiceNumber string            `json:"invoice_number"`
	CustomerID    uint              `json:"customer_id" binding:"required"`
	IssueDate     string            `json:"issue_date"`
	DueDate       string            `json:"due_date"`
	Status        string            `json:"status"`
	LineItems     []models.LineItem `json:"line_items"`
}

type UpdateInvoiceInput struct {
	InvoiceNumber string            `json:"invoice_number"`
	IssueDate     string            `json:"issue_date"`
	DueDate       string            `json:"due_date"`
	Status        string            `json:"status"`
	LineItems     []models.LineItem `json:"line_items"`
}

func calculateTotal(items []models.LineItem) float64 {
	var total float64
	for _, item := range items {
		total += float64(item.Quantity) * item.UnitPrice
	}
	return total
}

func (s *Service) Create(userID uint, input CreateInvoiceInput) (*models.Invoice, error) {
	status := input.Status
	if status == "" {
		status = "draft"
	}

	invoiceNum := input.InvoiceNumber
	if invoiceNum == "" {
		invoiceNum = fmt.Sprintf("INV-%d", time.Now().Unix())
	}

	invoice := &models.Invoice{
		UserID:        userID,
		InvoiceNumber: invoiceNum,
		CustomerID:    input.CustomerID,
		Status:        status,
		LineItems:     input.LineItems,
		TotalAmount:   calculateTotal(input.LineItems),
	}

	if input.IssueDate != "" {
		t, err := time.Parse(time.RFC3339, input.IssueDate)
		if err == nil {
			invoice.IssueDate = t
		}
	} else {
		invoice.IssueDate = time.Now()
	}

	if input.DueDate != "" {
		t, err := time.Parse(time.RFC3339, input.DueDate)
		if err == nil {
			invoice.DueDate = t
		}
	} else {
		invoice.DueDate = time.Now().AddDate(0, 1, 0) // Default +1 month
	}

	if err := s.repo.Create(invoice); err != nil {
		return nil, errors.New("failed to create invoice")
	}

	return invoice, nil
}

func (s *Service) GetAll(userID uint, status string, customerID *uint) ([]models.Invoice, error) {
	return s.repo.FindAll(userID, status, customerID)
}

func (s *Service) GetByID(id uint, userID uint) (*models.Invoice, error) {
	return s.repo.FindByID(id, userID)
}

func (s *Service) Update(id uint, userID uint, input UpdateInvoiceInput) (*models.Invoice, error) {
	invoice, err := s.repo.FindByID(id, userID)
	if err != nil {
		return nil, errors.New("invoice not found")
	}

	if input.InvoiceNumber != "" {
		invoice.InvoiceNumber = input.InvoiceNumber
	}
	if input.Status != "" {
		invoice.Status = input.Status
	}
	if input.LineItems != nil {
		invoice.LineItems = input.LineItems
		invoice.TotalAmount = calculateTotal(input.LineItems)
	}

	if input.IssueDate != "" {
		t, err := time.Parse(time.RFC3339, input.IssueDate)
		if err == nil {
			invoice.IssueDate = t
		}
	}
	if input.DueDate != "" {
		t, err := time.Parse(time.RFC3339, input.DueDate)
		if err == nil {
			invoice.DueDate = t
		}
	}

	if err := s.repo.Update(invoice); err != nil {
		return nil, errors.New("failed to update invoice")
	}

	return invoice, nil
}

func (s *Service) Delete(id uint, userID uint) error {
	return s.repo.Delete(id, userID)
}

func (s *Service) GeneratePDFBytes(id uint, userID uint) ([]byte, error) {
	invoice, err := s.repo.FindByID(id, userID)
	if err != nil {
		return nil, err
	}

	customer, err := s.customerRepo.FindByID(invoice.CustomerID, userID)
	if err != nil {
		return nil, errors.New("failed to fetch customer details for invoice")
	}

	return BuildInvoicePDF(invoice, customer)
}
