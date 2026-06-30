package main

import (
	"log"
	"os"

	"crm-tracker/internal/analytics"
	"crm-tracker/internal/auth"
	"crm-tracker/internal/calendar"
	"crm-tracker/internal/customers"
	"crm-tracker/internal/database"
	"crm-tracker/internal/deals"
	"crm-tracker/internal/invoices"
	"crm-tracker/internal/messages"
	"crm-tracker/internal/middleware"
	"crm-tracker/internal/tasks"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Connect to database
	db := database.Connect()

	// Initialize auth layer
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	// Initialize customer layer
	customerRepo := customers.NewRepository(db)
	customerService := customers.NewService(customerRepo)
	customerHandler := customers.NewHandler(customerService)

	// Initialize tasks layer
	taskRepo := tasks.NewRepository(db)
	taskService := tasks.NewService(taskRepo)
	taskHandler := tasks.NewHandler(taskService)

	// Initialize deals layer
	dealRepo := deals.NewRepository(db)
	dealService := deals.NewService(dealRepo)
	dealHandler := deals.NewHandler(dealService)

	// Initialize invoices layer
	invoiceRepo := invoices.NewRepository(db)
	invoiceService := invoices.NewService(invoiceRepo, customerRepo)
	invoiceHandler := invoices.NewHandler(invoiceService)

	// Initialize analytics layer
	analyticsRepo := analytics.NewRepository(db)
	analyticsService := analytics.NewService(analyticsRepo)
	analyticsHandler := analytics.NewHandler(analyticsService)

	// Initialize calendar layer
	calendarRepo := calendar.NewRepository(db)
	calendarService := calendar.NewService(calendarRepo)
	calendarHandler := calendar.NewHandler(calendarService)

	// Initialize messages layer
	messageRepo := messages.NewRepository(db)
	messageService := messages.NewService(messageRepo, authRepo)
	messageHandler := messages.NewHandler(messageService)

	// Setup Gin router
	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public routes
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}

	// Protected routes
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/auth/me", authHandler.GetProfile)
		protected.PUT("/auth/profile", authHandler.UpdateProfile)

		protected.GET("/customers", customerHandler.GetAll)
		protected.POST("/customers", customerHandler.Create)
		protected.GET("/customers/:id", customerHandler.GetByID)
		protected.PUT("/customers/:id", customerHandler.Update)
		protected.DELETE("/customers/:id", customerHandler.Delete)

		protected.GET("/tasks", taskHandler.GetAll)
		protected.POST("/tasks", taskHandler.Create)
		protected.GET("/tasks/:id", taskHandler.GetByID)
		protected.PUT("/tasks/:id", taskHandler.Update)
		protected.DELETE("/tasks/:id", taskHandler.Delete)

		protected.GET("/deals", dealHandler.GetAll)
		protected.POST("/deals", dealHandler.Create)
		protected.GET("/deals/:id", dealHandler.GetByID)
		protected.PUT("/deals/:id", dealHandler.Update)
		protected.PATCH("/deals/:id/stage", dealHandler.UpdateStage)
		protected.DELETE("/deals/:id", dealHandler.Delete)

		protected.GET("/invoices", invoiceHandler.GetAll)
		protected.POST("/invoices", invoiceHandler.Create)
		protected.GET("/invoices/:id", invoiceHandler.GetByID)
		protected.PUT("/invoices/:id", invoiceHandler.Update)
		protected.DELETE("/invoices/:id", invoiceHandler.Delete)
		protected.GET("/invoices/:id/pdf", invoiceHandler.GeneratePDF)

		protected.GET("/analytics/revenue", analyticsHandler.GetRevenueMonthly)
		protected.GET("/analytics/pipeline", analyticsHandler.GetPipelineByStage)
		protected.GET("/analytics/customers", analyticsHandler.GetNewCustomersMonthly)
		protected.GET("/analytics/tasks", analyticsHandler.GetTaskStats)
		protected.GET("/analytics/metrics", analyticsHandler.GetKeyMetrics)

		protected.GET("/calendar/events", calendarHandler.GetEvents)
		protected.POST("/calendar/events", calendarHandler.CreateEvent)

		protected.GET("/messages", messageHandler.GetMessages)
		protected.POST("/messages", messageHandler.CreateMessage)

		protected.GET("/dashboard/stats", customerHandler.GetDashboardStats)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
