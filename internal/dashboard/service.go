package dashboard

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// DashboardSummary is the single response object containing all dashboard data.
type DashboardSummary struct {
	Stats           StatCardData      `json:"stats"`
	RevenueChart    []RevenuePoint    `json:"revenue_chart"`
	RecentCustomers []RecentCustomer  `json:"recent_customers"`
	TasksOverview   []TaskStatusCount `json:"tasks_overview"`
	DealsByStage    []DealStageData   `json:"deals_by_stage"`
	UpcomingTasks   []UpcomingTask    `json:"upcoming_tasks"`
}

func (s *Service) GetSummary(userID uint) (*DashboardSummary, error) {
	stats, err := s.repo.GetStatCards(userID)
	if err != nil {
		return nil, err
	}

	revenueChart, _ := s.repo.GetRevenueTimeSeries(userID)
	recentCustomers, _ := s.repo.GetRecentCustomers(userID, 5)
	tasksOverview, _ := s.repo.GetTasksOverview(userID)
	dealsByStage, _ := s.repo.GetDealsByStage(userID)
	upcomingTasks, _ := s.repo.GetUpcomingTasks(userID, 5)

	// Return empty slices instead of nil for cleaner JSON
	if revenueChart == nil {
		revenueChart = []RevenuePoint{}
	}
	if recentCustomers == nil {
		recentCustomers = []RecentCustomer{}
	}
	if tasksOverview == nil {
		tasksOverview = []TaskStatusCount{}
	}
	if dealsByStage == nil {
		dealsByStage = []DealStageData{}
	}
	if upcomingTasks == nil {
		upcomingTasks = []UpcomingTask{}
	}

	return &DashboardSummary{
		Stats:           stats,
		RevenueChart:    revenueChart,
		RecentCustomers: recentCustomers,
		TasksOverview:   tasksOverview,
		DealsByStage:    dealsByStage,
		UpcomingTasks:   upcomingTasks,
	}, nil
}
