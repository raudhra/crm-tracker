package analytics

import (
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

type MonthlyRevenue struct {
	Month string  `json:"month"`
	Total float64 `json:"total"`
}

func (r *Repository) GetRevenueMonthly(userID uint) ([]MonthlyRevenue, error) {
	var results []MonthlyRevenue
	// PostgreSQL specific DATE_TRUNC
	err := r.db.Table("invoices").
		Select("TO_CHAR(issue_date, 'YYYY-MM') as month, SUM(total_amount) as total").
		Where("user_id = ? AND status = 'paid'", userID).
		Group("month").
		Order("month ASC").
		Scan(&results).Error
	return results, err
}

type PipelineStage struct {
	Stage string  `json:"stage"`
	Count int     `json:"count"`
	Value float64 `json:"value"`
}

func (r *Repository) GetPipelineByStage(userID uint) ([]PipelineStage, error) {
	var results []PipelineStage
	err := r.db.Table("deals").
		Select("stage, COUNT(*) as count, SUM(value) as value").
		Where("user_id = ?", userID).
		Group("stage").
		Scan(&results).Error
	return results, err
}

type MonthlyCustomers struct {
	Month string `json:"month"`
	Count int    `json:"count"`
}

func (r *Repository) GetNewCustomersMonthly(userID uint) ([]MonthlyCustomers, error) {
	var results []MonthlyCustomers
	err := r.db.Table("customers").
		Select("TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("month").
		Order("month ASC").
		Scan(&results).Error
	return results, err
}

type TaskStats struct {
	Total     int `json:"total"`
	Completed int `json:"completed"`
}

func (r *Repository) GetTaskStats(userID uint) (TaskStats, error) {
	var stats TaskStats
	err := r.db.Table("tasks").
		Select("COUNT(*) as total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed").
		Where("user_id = ?", userID).
		Scan(&stats).Error
	return stats, err
}

type KeyMetrics struct {
	TotalRevenue    float64 `json:"total_revenue"`
	TotalDeals      int     `json:"total_deals"`
	WonDeals        int     `json:"won_deals"`
	ActiveCustomers int     `json:"active_customers"`
	OpenTasks       int     `json:"open_tasks"`
}

func (r *Repository) GetKeyMetrics(userID uint) (KeyMetrics, error) {
	var metrics KeyMetrics
	
	// Total Revenue (Paid invoices)
	r.db.Table("invoices").Select("COALESCE(SUM(total_amount), 0)").Where("user_id = ? AND status = 'paid'", userID).Scan(&metrics.TotalRevenue)
	
	// Deals
	r.db.Table("deals").Select("COUNT(*)").Where("user_id = ?", userID).Scan(&metrics.TotalDeals)
	r.db.Table("deals").Select("COUNT(*)").Where("user_id = ? AND stage = 'won'", userID).Scan(&metrics.WonDeals)
	
	// Active Customers
	r.db.Table("customers").Select("COUNT(*)").Where("user_id = ? AND status = 'Active'", userID).Scan(&metrics.ActiveCustomers)
	
	// Open Tasks
	r.db.Table("tasks").Select("COUNT(*)").Where("user_id = ? AND status != 'done'", userID).Scan(&metrics.OpenTasks)

	return metrics, nil
}
