package auth

import (
	"errors"
	"os"
	"time"

	"crm-tracker/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileInput struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	JobTitle string `json:"job_title"`
	Company  string `json:"company"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func (s *Service) Register(input RegisterInput) (*AuthResponse, error) {
	// Check if user already exists
	existing, _ := s.repo.FindByEmail(input.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, errors.New("failed to create user")
	}

	// Generate JWT
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &AuthResponse{Token: token, User: user}, nil
}

func (s *Service) Login(input LoginInput) (*AuthResponse, error) {
	user, err := s.repo.FindByEmail(input.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate JWT
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	return &AuthResponse{Token: token, User: user}, nil
}

func (s *Service) GetProfile(userID uint) (*models.User, error) {
	return s.repo.FindByID(userID)
}

func (s *Service) UpdateProfile(userID uint, input UpdateProfileInput) (*models.User, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if input.Name != "" {
		user.Name = input.Name
	}
	if input.Phone != "" {
		user.Phone = input.Phone
	}
	if input.JobTitle != "" {
		user.JobTitle = input.JobTitle
	}
	if input.Company != "" {
		user.Company = input.Company
	}

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, errors.New("failed to update profile")
	}

	return user, nil
}

func (s *Service) GenerateToken(userID uint) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_jwt_secret_for_local_dev"
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
