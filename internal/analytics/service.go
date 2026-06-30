package analytics

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetRevenueMonthly(userID uint) ([]MonthlyRevenue, error) {
	return s.repo.GetRevenueMonthly(userID)
}

func (s *Service) GetPipelineByStage(userID uint) ([]PipelineStage, error) {
	return s.repo.GetPipelineByStage(userID)
}

func (s *Service) GetNewCustomersMonthly(userID uint) ([]MonthlyCustomers, error) {
	return s.repo.GetNewCustomersMonthly(userID)
}

func (s *Service) GetTaskStats(userID uint) (TaskStats, error) {
	return s.repo.GetTaskStats(userID)
}

func (s *Service) GetKeyMetrics(userID uint) (KeyMetrics, error) {
	return s.repo.GetKeyMetrics(userID)
}
