# NexPrep AI
### AI Interview & Skill Assessment Platform

**Prepare Smarter. Interview Better.**

NexPrep AI is an AI-powered platform designed to help candidates prepare for technical interviews, assess their knowledge, and identify areas for improvement.

## About the Project

NexPrep AI aims to make technical interview preparation more interactive, accessible, and effective.

Instead of depending only on traditional question-and-answer practice, the platform brings together technical assessments, AI-powered interview practice, resume management, and skill analysis in one place.

The application is being developed using React, Java Spring Boot, PostgreSQL, and Google Gemini AI.

## Features

### Developed Modules

- **User Authentication:** User registration and login with JWT-based security.
- **Email Verification:** Email verification functionality during account registration.
- **Test Center:** Technical assessment functionality with AI-generated questions.
- **AI Mock Interview:** Interview session management and AI-based answer evaluation.
- **Resume Management:** Upload and manage PDF and DOCX resumes.
- **Skill Analysis:** Analyze skill-related performance and identify improvement areas.
- **Interview History:** Access previous interview attempts and results.
- **Subscription Management:** Free and premium access with subscription-related restrictions.
- **Backend Security:** Spring Security and JWT-based authentication.
- **REST APIs:** Backend APIs for authentication, interviews, assessments, resumes, and related modules.

*Note: These modules are present in the current codebase. Complete end-to-end testing and integration verification are still in progress.*

### Planned Enhancements

- Resume-based interview question generation.
- Adaptive interview difficulty based on candidate responses.
- Project-specific questions and intelligent follow-up questions.
- Real-time voice interaction with the AI interviewer.
- Camera and microphone integration for a more realistic interview experience.
- Detailed interview reports covering technical knowledge, communication, and improvement areas.

## Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- JWT Authentication
- Maven

### Database
- PostgreSQL

### AI Integration
- Google Gemini API

### Development Tools
- IntelliJ IDEA
- Visual Studio Code
- Postman
- Git
- GitHub

## Project Structure

```text
NexPrep-AI/
│
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Java 21
- Node.js and npm
- PostgreSQL

The backend includes a Maven wrapper, so a separate Maven installation may not be required.

### 1. Clone the Repository

```bash
git clone https://github.com/Vigneshvarma-hub/AI-Interview-Platform.git

cd AI-Interview-Platform
```

### 2. Backend Setup

Make sure PostgreSQL is running and configure the required database, email, JWT, and Gemini API credentials in your local backend configuration.

Do not upload real credentials, passwords, or API keys to GitHub.

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application on Windows:

```bash
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Build and Verification

The backend package build was successfully completed with tests skipped:

```bash
.\mvnw.cmd package -DskipTests
```

### Current Verification Status

- Backend source integration: Completed.
- IntelliJ IDEA and Visual Studio Code: Configured to use the same backend folder.
- Backend compilation and packaging: Successful with tests skipped.
- Spring Boot application context test: Database/configuration troubleshooting still required.
- Full frontend-backend end-to-end verification: Pending.

**Important:** A successful build with tests skipped does not mean all application features have passed testing.

## Project Development

The latest backend source updates were integrated into the main project folder.

The backend folder is shared between IntelliJ IDEA and Visual Studio Code, avoiding separate copies of the backend source code.

The latest backend changes were committed and pushed to GitHub. The local `main` branch and GitHub `origin/main` were verified to point to the same commit.

Local configuration containing credentials is intentionally kept out of the GitHub commit.

## Future Improvements

- Complete database configuration and application context testing.
- Perform end-to-end testing of frontend and backend modules.
- Improve AI interviewer response speed and interaction.
- Add detailed candidate performance analytics.
- Improve API documentation and testing.
- Deploy the application to a cloud platform.
- Improve the overall user experience and interface.

## GitHub Repository

[AI Interview & Skill Assessment Platform](https://github.com/Vigneshvarma-hub/AI-Interview-Platform)

## Brand

**NexPrep AI**

*Prepare Smarter. Interview Better.*

## Author

**Vignesh Varma**
