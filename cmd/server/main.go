package main

import (
	"log"
	"os"

	"crm-tracker/internal/auth"
	"crm-tracker/internal/customers"
	"crm-tracker/internal/database"
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
