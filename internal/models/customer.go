package models

import (
	"errors"
	"time"

	"github.com/jinzhu/gorm"
)

type Customer struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"unique;not null" json:"name"`
	Status    string    `gorm:"not null" json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type User struct {
	Name     string `gorm:"unique;not null" json:"name"`
	Email    string `gorm:"unique;not null" json:"email"`
	Password string `gorm:"not null" json:"password"`
}

type Task struct {
	Title       string      `gorm:"not null" json:"title"`
	DueDate     string      `gorm:"not null" json:"duedate"`
	IsCompleted bool        `gorm:"not null" json:"iscompleted"`
	CustomerID  Customer.ID `json:"customerid"`
}

type Deal struct {
	Title      string      `gorm:"not null" json:"title"`
	Value      int         `gorm:"not null" json:"value"`
	Stage      string      `gorm:"not null" json:"iscompleted"`
	CustomerID Customer.ID `json:"customerid"`
}

var db *gorm.DB

func (m *Movie) ValidateMovie() error {
	if m.Title == "" {
		return errors.New("Title cannot be empty")
	}

	if m.Description == "" {
		return errors.New("Description cannot be empty")
	}

	if m.Genre == "" {
		return errors.New("Genre cannot be empty")
	}

	return nil
}

func init() {
	config.Connect()
	db = config.getDB()
	db.AutoMigrate(
		&Movie{},
		&User{},
		&Showtimes{},
		&Reservation{},
	)
}

func GetAllMovies() []Movie {
	var Movies []Movie
	db.Find(&Movies)
	return Movies
}

func GetMovie(ID uint) (*Movie, *gorm.DB) {
	var getMovie Movie
	db.First(&getMovie, ID)
	return &getMovie, db
}

func DeleteMovie(ID uint) Movie {
	var movie Movie
	db.First(&movie, ID)
	db.Delete(&movie)
	return movie
}

func (m *Movie) AddMovie() *Movie {
	db.Create(&m)
	return m
}

func UpdateMovie(ID uint, updatedMovie Movie) Movie {
	var movie Movie
	db.First(&movie, ID)
	db.Model(&movie).Updates(updatedMovie)
	return movie
}

func GetUserByEmail(Email string) *User {
	var user User
	db.Where("email=?", Email).First(&user)
	return &user
}

func (u *User) CreateUser() *User {
	db.Create(&u)
	return u
}

func GetAllShowtimes() []Showtimes {
	var Showtime []Showtimes
	db.Find(&Showtime)
	return Showtime
}

func GetShowtime(ID uint) (*Showtimes, *gorm.DB) {
	var getShowtime Showtimes
	db.First(&getShowtime, ID)
	return &getShowtime, db
}

func (s *Showtimes) AddShowtime() *Showtimes {
	s.AvailableSeats = s.TotalSeats
	db.Create(&s)
	return s
}

func UpdateShowtime(ID uint, updatedShowtime Showtimes) *Showtimes {
	var showtime Showtimes
	db.First(&showtime, ID)
	db.Model(&showtime).Updates(updatedShowtime)
	return &showtime
}

func DeleteShowtime(ID uint) *Showtimes {
	var showtime Showtimes
	db.First(&showtime, ID)
	db.Delete(&showtime)
	return &showtime
}

func CheckOverlap(movieID uint, startTime time.Time) bool {
	var count int64
	db.Model(&Showtimes{}).
		Joins("join movies on movies.id = showtimes.movie_id").
		Where("showtimes.movie_id = ? AND ? >= showtimes.start_time AND ? < showtimes.start_time + (movies.duration * interval '1 minute')", movieID, startTime, startTime).
		Count(&count)
	return count > 0
}

func GetAllReservation() []Reservation {
	var Reservations []Reservation
	db.Find(&Reservations)
	return Reservations
}

func GetUserReservation(userID uint) []Reservation {
	var getUserReservations []Reservation
	db.Where("user_id=?", userID).Find(&getUserReservations)
	return getUserReservations
}
func GetReservation(ID uint) (*Reservation, *gorm.DB) {
	var getReservation Reservation
	db.First(&getReservation, ID)
	return &getReservation, db
}

func (r *Reservation) CreateReservation() *Reservation {
	var showtime Showtimes
	db.First(&showtime, r.ShowtimeID)
	db.Model(&showtime).Update("available_seats", showtime.AvailableSeats-1)
	db.Create(&r)
	return r
}

func UpdateReservation(ID uint, updatedReservation Reservation) *Reservation {
	var reservation Reservation
	db.First(&reservation, ID)
	db.Model(&reservation).Updates(updatedReservation)
	return &reservation
}

func CancelReservation(ID uint) *Reservation {
	var reservation Reservation
	var showtime Showtimes
	db.First(&reservation, ID)
	db.First(&showtime, reservation.ShowtimeID)
	db.Delete(&reservation)
	db.Model(&showtime).Update("available_seats", showtime.AvailableSeats+1)
	return &reservation
}
