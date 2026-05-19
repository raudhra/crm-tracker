package database

import (
	"fmt"
	"log"
	"os"

	"crm-tracker/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=crm port=5432 sslmode=disable TimeZone=UTC"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v\n", err)
	}

	fmt.Println("Connected to Database")

	// Auto Migrate the models
	err = db.AutoMigrate(&models.User{}, &models.Customer{}, &models.Deal{}, &models.Task{})
	if err != nil {
		log.Fatalf("Failed to auto migrate database models: %v\n", err)
	}

	DB = db
}
