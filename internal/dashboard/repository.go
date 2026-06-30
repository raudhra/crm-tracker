package dashboard

import (
	"time"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// --- Stat Cards ---

type StatCardData struct {
	TotalCustomers   int64   `json:"total_customers"`
	Revenue          float64 `json:"revenue"`
	OpenDeals        int64   `json:"open_deals"`
	TasksTotal       int64   `json:"tasks_total"`
	TasksCompleted   int64   `json:"tasks_completed"`
	CompletionRate   int     `json:"completion_rate"` // percentage
}

func (r *Repository) GetStatCards(userID uint) (StatCardData, error) {
	var d StatCardData

	r.db.Table("customers").Where("user_id = ?", userID).Count(&d.TotalCustomers)
	r.db.Table("invoices").Select("COALESCE(SUM(total_amount), 0)").Where("user_id = ? AND status = 'paid'", userID).Scan(&d.Revenue)
	r.db.Table("deals").Where("user_id = ? AND stage NOT IN ('won','lost')", userID).Count(&d.OpenDeals)
	r.db.Table("tasks").Where("user_id = ?", userID).Count(&d.TasksTotal)
	r.db.Table("tasks").Where("user_id = ? AND status = 'done'", userID).Count(&d.TasksCompleted)

	if d.TasksTotal > 0 {
		d.CompletionRate = int(d.TasksCompleted * 100 / d.TasksTotal)
	}

	return d, nil
}

// --- Revenue Chart (monthly, from paid invoices) ---

type RevenuePoint struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
}

func (r *Repository) GetRevenueTimeSeries(userID uint) ([]RevenuePoint, error) {
	var results []RevenuePoint
	err := r.db.Table("invoices").
		Select("TO_CHAR(issue_date, 'Mon DD') as date, SUM(total_amount) as revenue").
		Where("user_id = ? AND status = 'paid'", userID).
		Group("date, issue_date").
		Order("issue_date ASC").
		Scan(&results).Error
	return results, err
}

// --- Recent Customers ---

type RecentCustomer struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func (r *Repository) GetRecentCustomers(userID uint, limit int) ([]RecentCustomer, error) {
	var results []RecentCustomer
	err := r.db.Table("customers").
		Select("id, name, email, status, created_at").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Scan(&results).Error
	return results, err
}

// --- Tasks Overview (for donut chart) ---

type TaskStatusCount struct {
	Name  string `json:"name"`
	Value int64  `json:"value"`
	Color string `json:"color"`
}

func (r *Repository) GetTasksOverview(userID uint) ([]TaskStatusCount, error) {
	type rawCount struct {
		Status string
		Count  int64
	}
	var rows []rawCount
	err := r.db.Table("tasks").
		Select("status, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("status").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	colorMap := map[string]string{
		"done":        "#22c55e",
		"in_progress": "#3b82f6",
		"todo":        "#eab308",
	}
	nameMap := map[string]string{
		"done":        "Completed",
		"in_progress": "In Progress",
		"todo":        "Pending",
	}

	var results []TaskStatusCount
	for _, row := range rows {
		color, ok := colorMap[row.Status]
		if !ok {
			color = "#9ca3af"
		}
		name, ok := nameMap[row.Status]
		if !ok {
			name = row.Status
		}
		results = append(results, TaskStatusCount{
			Name:  name,
			Value: row.Count,
			Color: color,
		})
	}
	return results, nil
}

// --- Deals by Stage ---

type DealStageData struct {
	Stage string  `json:"stage"`
	Count int64   `json:"count"`
	Value float64 `json:"value"`
	Color string  `json:"color"`
}

func (r *Repository) GetDealsByStage(userID uint) ([]DealStageData, error) {
	type rawStage struct {
		Stage string
		Count int64
		Value float64
	}
	var rows []rawStage
	err := r.db.Table("deals").
		Select("stage, COUNT(*) as count, COALESCE(SUM(value),0) as value").
		Where("user_id = ?", userID).
		Group("stage").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	colorMap := map[string]string{
		"lead":        "#6366f1",
		"contacted":   "#3b82f6",
		"proposal":    "#8b5cf6",
		"negotiation": "#f97316",
		"won":         "#22c55e",
		"lost":        "#ef4444",
	}

	var results []DealStageData
	// Preserve stage ordering
	stageOrder := []string{"lead", "contacted", "proposal", "negotiation", "won", "lost"}
	stageMap := make(map[string]rawStage)
	for _, r := range rows {
		stageMap[r.Stage] = r
	}

	for _, s := range stageOrder {
		row, ok := stageMap[s]
		if !ok {
			continue // skip stages with 0 deals
		}
		color := colorMap[s]
		if color == "" {
			color = "#9ca3af"
		}
		results = append(results, DealStageData{
			Stage: s,
			Count: row.Count,
			Value: row.Value,
			Color: color,
		})
	}
	return results, nil
}

// --- Upcoming Tasks ---

type UpcomingTask struct {
	ID       uint      `json:"id"`
	Title    string    `json:"title"`
	DueDate  time.Time `json:"due_date"`
	Status   string    `json:"status"`
	Priority string    `json:"priority"`
}

func (r *Repository) GetUpcomingTasks(userID uint, limit int) ([]UpcomingTask, error) {
	var results []UpcomingTask
	now := time.Now().Truncate(24 * time.Hour)
	err := r.db.Table("tasks").
		Select("id, title, due_date, status, priority").
		Where("user_id = ? AND status != 'done' AND due_date >= ?", userID, now).
		Order("due_date ASC").
		Limit(limit).
		Scan(&results).Error
	return results, err
}
