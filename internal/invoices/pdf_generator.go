package invoices

import (
	"bytes"
	"fmt"

	"crm-tracker/internal/models"

	"github.com/jung-kurt/gofpdf"
)

func BuildInvoicePDF(invoice *models.Invoice, customer *models.Customer) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 24)
	pdf.Cell(40, 10, "INVOICE")

	pdf.SetFont("Arial", "", 12)
	pdf.Ln(15)
	pdf.Cell(40, 8, fmt.Sprintf("Invoice Number: %s", invoice.InvoiceNumber))
	pdf.Ln(8)
	pdf.Cell(40, 8, fmt.Sprintf("Issue Date: %s", invoice.IssueDate.Format("Jan 02, 2006")))
	pdf.Ln(8)
	pdf.Cell(40, 8, fmt.Sprintf("Due Date: %s", invoice.DueDate.Format("Jan 02, 2006")))
	pdf.Ln(8)
	pdf.Cell(40, 8, fmt.Sprintf("Status: %s", invoice.Status))

	pdf.Ln(15)
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Bill To:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 8, customer.Name)
	if customer.Company != "" {
		pdf.Ln(6)
		pdf.Cell(40, 8, customer.Company)
	}
	if customer.Email != "" {
		pdf.Ln(6)
		pdf.Cell(40, 8, customer.Email)
	}

	pdf.Ln(15)

	// Table Header
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(90, 10, "Description", "1", 0, "L", false, 0, "")
	pdf.CellFormat(30, 10, "Qty", "1", 0, "C", false, 0, "")
	pdf.CellFormat(35, 10, "Unit Price", "1", 0, "C", false, 0, "")
	pdf.CellFormat(35, 10, "Amount", "1", 1, "C", false, 0, "")

	// Table Body
	pdf.SetFont("Arial", "", 12)
	for _, item := range invoice.LineItems {
		amount := float64(item.Quantity) * item.UnitPrice
		pdf.CellFormat(90, 10, item.Description, "1", 0, "L", false, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(35, 10, fmt.Sprintf("$%.2f", item.UnitPrice), "1", 0, "C", false, 0, "")
		pdf.CellFormat(35, 10, fmt.Sprintf("$%.2f", amount), "1", 1, "C", false, 0, "")
	}

	// Total Footer
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(155, 10, "Total", "1", 0, "R", false, 0, "")
	pdf.CellFormat(35, 10, fmt.Sprintf("$%.2f", invoice.TotalAmount), "1", 1, "C", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
