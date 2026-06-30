package main

import (
	"flag"
	"log"
	"math/rand"
	"time"

	"crm-tracker/internal/database"
	"crm-tracker/internal/models"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

const (
	DemoEmail    = "sheen.mehra@clientflow-demo.com"
	DemoName     = "Sheen Mehra"
	DemoPassword = "misterindia"
)

func main() {
	resetPtr := flag.Bool("reset", false, "Wipe existing demo user data before seeding")
	flag.Parse()

	// 1. Bootstrapping
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	db := database.Connect()
	log.Println("Connected to database for seeding.")

	// 2. Handle Reset Flag
	if *resetPtr {
		log.Println("Reset flag provided. Attempting to wipe existing demo data...")
		var existingUser models.User
		if err := db.Where("email = ?", DemoEmail).First(&existingUser).Error; err == nil {
			log.Printf("Found existing demo user (ID: %d). Wiping data...\n", existingUser.ID)
			
			// Delete related records (order matters somewhat for foreign keys, though currently we rely on user_id)
			db.Where("user_id = ?", existingUser.ID).Delete(&models.Message{})
			db.Where("user_id = ?", existingUser.ID).Delete(&models.Event{})
			db.Where("user_id = ?", existingUser.ID).Delete(&models.Invoice{})
			db.Where("user_id = ?", existingUser.ID).Delete(&models.Task{})
			db.Where("user_id = ?", existingUser.ID).Delete(&models.Deal{})
			db.Where("user_id = ?", existingUser.ID).Delete(&models.Customer{})
			db.Delete(&existingUser)
			log.Println("Successfully wiped old demo data.")
		} else {
			log.Println("No existing demo user found. Proceeding...")
		}
	} else {
		// Ensure we don't duplicate the user if reset isn't passed
		var count int64
		db.Model(&models.User{}).Where("email = ?", DemoEmail).Count(&count)
		if count > 0 {
			log.Fatalf("Demo user already exists. Run with --reset to wipe and re-seed.")
		}
	}

	// 3. User Creation
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(DemoPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	user := models.User{
		Name:     DemoName,
		Email:    DemoEmail,
		Password: string(hashedPassword),
		JobTitle: "Head of Sales",
		Company:  "ClientFlow Inc.",
	}
	if err := db.Create(&user).Error; err != nil {
		log.Fatal("Failed to create demo user:", err)
	}
	log.Printf("Created Demo User: %s (ID: %d)\n", user.Name, user.ID)

	// 4. Data Generation setup
	gofakeit.Seed(time.Now().UnixNano())
	now := time.Now()
	
	// Helper to generate a random time within the past N days
	randomPastDate := func(days int) time.Time {
		return now.AddDate(0, 0, -gofakeit.Number(1, days))
	}
	// Helper to generate a random time within the next N days
	randomFutureDate := func(days int) time.Time {
		return now.AddDate(0, 0, gofakeit.Number(1, days))
	}

	// 5. Generate Customers
	numCustomers := gofakeit.Number(40, 60)
	var customers []models.Customer
	customerStatuses := []string{"Active", "Pending", "Inactive"}
	
	for i := 0; i < numCustomers; i++ {
		createdAt := randomPastDate(365) // Spread over past year
		c := models.Customer{
			UserID:      user.ID,
			Name:        gofakeit.Name(),
			Email:       gofakeit.Email(),
			Phone:       gofakeit.Phone(),
			Company:     gofakeit.Company(),
			Status:      customerStatuses[rand.Intn(len(customerStatuses))],
			LastContact: randomPastDate(60),
			CreatedAt:   createdAt,
			UpdatedAt:   createdAt,
		}
		customers = append(customers, c)
	}
	db.Create(&customers)
	log.Printf("Seeded %d Customers\n", numCustomers)

	// 6. Generate Deals
	numDeals := gofakeit.Number(60, 80)
	var deals []models.Deal
	dealStages := []string{"lead", "contacted", "proposal", "negotiation", "won", "lost"}
	
	for i := 0; i < numDeals; i++ {
		customer := customers[rand.Intn(len(customers))]
		createdAt := randomPastDate(180)
		
		// 50% chance of future close date, 50% past
		var closeDate time.Time
		if rand.Intn(2) == 0 {
			closeDate = randomPastDate(90)
		} else {
			closeDate = randomFutureDate(90)
		}

		deal := models.Deal{
			UserID:            user.ID,
			Title:             gofakeit.JobTitle() + " Software License",
			CustomerID:        customer.ID,
			Value:             float64(gofakeit.Number(500, 50000)),
			Stage:             dealStages[rand.Intn(len(dealStages))],
			ExpectedCloseDate: closeDate,
			Notes:             gofakeit.Sentence(10),
			CreatedAt:         createdAt,
			UpdatedAt:         createdAt,
		}
		deals = append(deals, deal)
	}
	db.Create(&deals)
	log.Printf("Seeded %d Deals\n", numDeals)

	// 7. Generate Tasks
	numTasks := gofakeit.Number(50, 70)
	var tasks []models.Task
	taskStatuses := []string{"todo", "in_progress", "done"}
	taskPriorities := []string{"low", "med", "high"}
	
	for i := 0; i < numTasks; i++ {
		createdAt := randomPastDate(90)
		dueDate := now.AddDate(0, 0, gofakeit.Number(-10, 30)) // Some overdue, some future

		task := models.Task{
			UserID:      user.ID,
			Title:       gofakeit.Sentence(4),
			Description: gofakeit.Sentence(15),
			Status:      taskStatuses[rand.Intn(len(taskStatuses))],
			Priority:    taskPriorities[rand.Intn(len(taskPriorities))],
			DueDate:     dueDate,
			CreatedAt:   createdAt,
			UpdatedAt:   createdAt,
		}

		// Randomly link to customer or deal
		if rand.Float32() > 0.3 {
			if rand.Intn(2) == 0 {
				customerID := customers[rand.Intn(len(customers))].ID
				task.CustomerID = &customerID
			} else {
				dealID := deals[rand.Intn(len(deals))].ID
				task.DealID = &dealID
			}
		}
		tasks = append(tasks, task)
	}
	db.Create(&tasks)
	log.Printf("Seeded %d Tasks\n", numTasks)

	// 8. Generate Invoices
	numInvoices := gofakeit.Number(30, 40)
	var invoices []models.Invoice
	invoiceStatuses := []string{"draft", "sent", "paid", "overdue"}
	
	for i := 0; i < numInvoices; i++ {
		customer := customers[rand.Intn(len(customers))]
		issueDate := randomPastDate(120)
		dueDate := issueDate.AddDate(0, 1, 0) // Due 1 month later
		
		// Create 1-3 line items
		numItems := gofakeit.Number(1, 3)
		var items []models.LineItem
		var totalAmount float64
		for j := 0; j < numItems; j++ {
			qty := gofakeit.Number(1, 10)
			price := float64(gofakeit.Number(100, 5000))
			items = append(items, models.LineItem{
				Description: gofakeit.ProductCategory() + " Services",
				Quantity:    qty,
				UnitPrice:   price,
			})
			totalAmount += float64(qty) * price
		}

		invoice := models.Invoice{
			UserID:        user.ID,
			InvoiceNumber: gofakeit.UUID()[0:8], // Short pseudo-uuid
			CustomerID:    customer.ID,
			IssueDate:     issueDate,
			DueDate:       dueDate,
			Status:        invoiceStatuses[rand.Intn(len(invoiceStatuses))],
			LineItems:     items,
			TotalAmount:   totalAmount,
			CreatedAt:     issueDate,
			UpdatedAt:     issueDate,
		}
		invoices = append(invoices, invoice)
	}
	db.Create(&invoices)
	log.Printf("Seeded %d Invoices\n", numInvoices)

	// 9. Generate Calendar Events
	numEvents := gofakeit.Number(15, 20)
	var events []models.Event
	eventTypes := []string{"meeting", "custom"}
	
	for i := 0; i < numEvents; i++ {
		startTime := now.AddDate(0, 0, gofakeit.Number(-10, 45)) // Past and next month
		endTime := startTime.Add(time.Hour)

		event := models.Event{
			UserID:      user.ID,
			Title:       "Meeting with " + gofakeit.Name(),
			Description: gofakeit.Sentence(8),
			StartTime:   startTime,
			EndTime:     endTime,
			Type:        eventTypes[rand.Intn(len(eventTypes))],
			CreatedAt:   now,
			UpdatedAt:   now,
		}
		events = append(events, event)
	}
	db.Create(&events)
	log.Printf("Seeded %d Events\n", numEvents)

	// 10. Generate Messages
	numMessages := gofakeit.Number(100, 150)
	var messages []models.Message
	channels := []string{"note", "email", "call", "meeting"}
	
	// Select 15-20 active customers to have message threads
	activeThreadCustomers := customers
	gofakeit.ShuffleAnySlice(activeThreadCustomers)
	if len(activeThreadCustomers) > 20 {
		activeThreadCustomers = activeThreadCustomers[:20]
	}

	for i := 0; i < numMessages; i++ {
		customer := activeThreadCustomers[rand.Intn(len(activeThreadCustomers))]
		createdAt := randomPastDate(90) // Spread over last 3 months

		// Sender is either the user or the customer
		senderName := user.Name
		if rand.Intn(2) == 0 {
			senderName = customer.Name
		}

		msg := models.Message{
			UserID:      user.ID,
			CustomerID:  customer.ID,
			SenderName:  senderName,
			Content:     gofakeit.Sentence(gofakeit.Number(5, 25)),
			Channel:     channels[rand.Intn(len(channels))],
			CreatedAt:   createdAt,
			UpdatedAt:   createdAt,
		}
		messages = append(messages, msg)
	}
	db.Create(&messages)
	log.Printf("Seeded %d Messages\n", numMessages)

	log.Println("Seed completed successfully! Enjoy your demo account.")
}
