package calendar

import (
	"errors"
	"strconv"
	"time"

	"crm-tracker/internal/models"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateEventInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	StartTime   string `json:"start_time" binding:"required"`
	EndTime     string `json:"end_time"`
	Type        string `json:"type"`
	LinkedID    *uint  `json:"linked_id"`
}

type CalendarEvent struct {
	ID          string    `json:"id"` // Format: type_id (e.g. manual_1, task_5)
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Type        string    `json:"type"`
}

func (s *Service) Create(userID uint, input CreateEventInput) (*models.Event, error) {
	start, err := time.Parse(time.RFC3339, input.StartTime)
	if err != nil {
		return nil, errors.New("invalid start time")
	}

	var end time.Time
	if input.EndTime != "" {
		end, err = time.Parse(time.RFC3339, input.EndTime)
		if err != nil {
			return nil, errors.New("invalid end time")
		}
	} else {
		end = start.Add(time.Hour) // default 1 hour
	}

	eventType := input.Type
	if eventType == "" {
		eventType = "custom"
	}

	event := &models.Event{
		UserID:      userID,
		Title:       input.Title,
		Description: input.Description,
		StartTime:   start,
		EndTime:     end,
		Type:        eventType,
		LinkedID:    input.LinkedID,
	}

	if err := s.repo.Create(event); err != nil {
		return nil, errors.New("failed to create event")
	}

	return event, nil
}

func (s *Service) GetCombinedEvents(userID uint) ([]CalendarEvent, error) {
	var combined []CalendarEvent

	// 1. Fetch manual events
	manualEvents, err := s.repo.FindManualEvents(userID)
	if err == nil {
		for _, e := range manualEvents {
			combined = append(combined, CalendarEvent{
				ID:          "manual_" + strconv.FormatUint(uint64(e.ID), 10),
				Title:       e.Title,
				Description: e.Description,
				StartTime:   e.StartTime,
				EndTime:     e.EndTime,
				Type:        e.Type,
			})
		}
	}

	// 2. Fetch tasks with due dates
	tasks, err := s.repo.FindTasksWithDueDates(userID)
	if err == nil {
		for _, t := range tasks {
			if !t.DueDate.IsZero() {
				combined = append(combined, CalendarEvent{
					ID:          "task_" + strconv.FormatUint(uint64(t.ID), 10),
					Title:       "Task Due: " + t.Title,
					Description: t.Description,
					StartTime:   t.DueDate,
					EndTime:     t.DueDate,
					Type:        "task_due",
				})
			}
		}
	}

	// 3. Fetch deals with expected close dates
	deals, err := s.repo.FindDealsWithCloseDates(userID)
	if err == nil {
		for _, d := range deals {
			if !d.ExpectedCloseDate.IsZero() {
				combined = append(combined, CalendarEvent{
					ID:          "deal_" + strconv.FormatUint(uint64(d.ID), 10),
					Title:       "Deal Close: " + d.Title,
					Description: d.Notes,
					StartTime:   d.ExpectedCloseDate,
					EndTime:     d.ExpectedCloseDate,
					Type:        "deal_close",
				})
			}
		}
	}

	return combined, nil
}
