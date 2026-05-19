package main

import (
	"log"

	"crm-tracker/internal/auth"
	"crm-tracker/internal/customers"
	"crm-tracker/internal/database"
	"crm-tracker/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists (ignore error if it doesn't)
	_ = godotenv.Load()

	// Initialize Database Connection
	database.Connect()

	// Set up Gin Router
	r := gin.Default()

	// Enable CORS
	r.Use(cors.Default())

	// Initialize Auth Repository, Service, and Handler
	authRepo := auth.NewRepository(database.DB)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	// Initialize Customer Repository, Service, and Handler
	customerRepo := customers.NewRepository(database.DB)
	customerService := customers.NewService(customerRepo)
	customerHandler := customers.NewHandler(customerService)

	// API Routes
	api := r.Group("/api")
	{
		// Auth Routes (Public)
		authRoutes := api.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
		}

		// Customer Routes (Protected)
		customerRoutes := api.Group("/customers")
		customerRoutes.Use(middleware.AuthMiddleware())
		{
			customerRoutes.GET("", customerHandler.GetAll)
			customerRoutes.GET("/:id", customerHandler.GetByID)
			customerRoutes.POST("", customerHandler.Create)
			customerRoutes.PUT("/:id", customerHandler.Update)
			customerRoutes.DELETE("/:id", customerHandler.Delete)
		}
	}

	// Start Server
	log.Println("Server is running on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
