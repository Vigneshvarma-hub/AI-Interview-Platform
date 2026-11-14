# AI Interview & Skill Assessment Platform

An AI-powered platform that helps candidates prepare for technical interviews, test their knowledge, and understand where they can improve.

## About the Project

I am building this platform to make technical interview preparation more interactive and accessible. Instead of depending only on traditional question-and-answer practice, the application brings together technical assessments, AI-powered interview practice, resume management, and skill analysis in one place.

The project is being developed using React, Java Spring Boot, PostgreSQL, and Google Gemini AI.

## Features

### Currently Developed

- **User Authentication:** User registration and login with JWT-based security.
- **Email Verification:** Email verification during account registration.
- **Test Center:** Take technical assessments with AI-generated questions.
- **AI Mock Interview:** Start interview sessions and receive AI-based answer evaluation.
- **Resume Management:** Upload and manage PDF and DOCX resumes.
- **Skill Analysis:** View skill-related performance and identify improvement areas.
- **Interview History:** Access previous interview attempts and results.
- **Subscription Management:** Free and premium access with subscription-related restrictions.

### Planned Enhancements

- Resume-based interview question generation.
- Adaptive interview difficulty based on candidate responses.
- Project-specific questions and intelligent follow-up questions.
- Voice-based interaction with the AI interviewer.
- Camera and microphone integration for a more realistic interview experience.
- Detailed interview reports covering technical knowledge, communication, and improvement areas.

## Technology Stack

**Frontend**
- React.js
- JavaScript
- HTML5 and CSS3
- Vite

**Backend**
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- REST APIs
- JWT Authentication

**Database**
- PostgreSQL

**AI Integration**
- Google Gemini API

**Tools**
- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git and GitHub

## Project Structure

```text
AI-Interview-Platform/
│
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── .gitignore
```

## Getting Started

### Prerequisites

- Java 21
- Node.js and npm
- PostgreSQL
- Maven

### Clone the Repository

```bash
git clone https://github.com/Vigneshvarma-hub/AI-Interview-Platform.git

cd AI-Interview-Platform
```

### Backend Setup

Configure the required database, email, and Gemini API credentials using environment variables.

```bash
cd backend
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite.

## Project Status

This project is currently under active development. I am continuously improving the existing modules and working on additional AI-powered interview capabilities.

## GitHub Repository

[AI Interview & Skill Assessment Platform](https://github.com/Vigneshvarma-hub/AI-Interview-Platform)

## Author

**Vignesh Varma**