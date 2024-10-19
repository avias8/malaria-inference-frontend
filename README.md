
---

# Malaria Cell Classification Application

Welcome to the **Malaria Cell Classification Application** repository! This project comprises a **React** frontend and a **Flask** backend, containerized using **Docker** and deployed on **Google Cloud Container Instances**. The application leverages a pre-trained TensorFlow model to classify blood cell images as either **Parasitized** (infected) or **Uninfected**.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
  - [Running Locally](#running-locally)
  - [Using Docker](#using-docker)
- [Deployment](#deployment)
  - [Deploying to Google Cloud Container Instances](#deploying-to-google-cloud-container-instances)
- [API Reference](#api-reference)
- [Model Details](#model-details)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [About the Author](#about-the-author)
- [License](#license)

## Project Overview

The **Malaria Cell Classification Application** is designed to assist in the diagnosis of malaria by classifying blood cell images as either **Parasitized** (infected) or **Uninfected**. Users can upload images through the React frontend, which are then sent to the Flask backend for classification using a TensorFlow model. The results, along with confidence scores, are displayed back to the user.

## Architecture

![Architecture Diagram](docs/architecture_diagram.png)

1. **Frontend (React):**
   - Provides a user interface for uploading blood cell images.
   - Displays classification results and confidence scores.
   
2. **Backend (Flask):**
   - Receives image uploads from the frontend.
   - Processes images and runs them through the TensorFlow model.
   - Returns classification results and confidence scores to the frontend.
   
3. **Containerization (Docker):**
   - Packages the Flask backend along with all dependencies.
   - Ensures consistent environments across development and production.
   
4. **Deployment (Google Cloud):**
   - Deploys the Docker container to Google Cloud Container Instances for scalability and reliability.

## Technologies Used

- **Frontend:**
  - [React](https://reactjs.org/)
  - [React Icons](https://react-icons.github.io/react-icons/)
  
- **Backend:**
  - [Flask](https://flask.palletsprojects.com/)
  - [TensorFlow](https://www.tensorflow.org/)
  - [Flask-CORS](https://flask-cors.readthedocs.io/)
  - [Pillow](https://python-pillow.org/)
  - [NumPy](https://numpy.org/)
  
- **Containerization:**
  - [Docker](https://www.docker.com/)
  
- **Deployment:**
  - [Google Cloud Container Instances](https://cloud.google.com/container-instances)
  
- **Others:**
  - [ESLint](https://eslint.org/) for code linting
  - [Bootstrap](https://getbootstrap.com/) for styling (optional)

## Repository Structure

```
malaria-inference-frontend/
├── backend/
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── winning_model.keras
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── docker-compose.yml
└── README.md
```

- **backend/**: Contains the Flask application, Dockerfile, dependencies, and the pre-trained TensorFlow model.
- **frontend/**: Contains the React application files.
- **docker-compose.yml**: (Optional) Facilitates running both frontend and backend containers simultaneously.
- **README.md**: This file.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js & npm**: [Download and install](https://nodejs.org/)
- **Python 3.9**: [Download and install](https://www.python.org/downloads/)
- **Docker**: [Download and install](https://www.docker.com/get-started)
- **Google Cloud SDK**: [Download and install](https://cloud.google.com/sdk/docs/install) (for deployment)

### Backend Setup

1. **Navigate to the Backend Directory:**

   ```bash
   cd backend
   ```

2. **Create a Virtual Environment (Optional but Recommended):**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python Dependencies:**

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Run the Flask Application:**

   ```bash
   python app.py
   ```

   The backend will run on [http://localhost:5000](http://localhost:5000).

### Frontend Setup

1. **Navigate to the Frontend Directory:**

   ```bash
   cd frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Start the React Application:**

   ```bash
   npm start
   ```

   The application will run in development mode at [http://localhost:3000](http://localhost:3000).

## Running the Application

### Running Locally

1. **Start the Backend:**

   Ensure you're in the `backend` directory and run:

   ```bash
   python app.py
   ```

2. **Start the Frontend:**

   In a separate terminal, navigate to the `frontend` directory and run:

   ```bash
   npm start
   ```

3. **Access the Application:**

   Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

### Using Docker

Docker simplifies the process by containerizing the backend. Here's how to set it up:

1. **Build the Docker Image:**

   Navigate to the `backend` directory and build the Docker image:

   ```bash
   cd backend
   docker build -t malaria-inference-backend .
   ```

2. **Run the Docker Container:**

   ```bash
   docker run -d -p 5000:5000 --name malaria-backend malaria-inference-backend
   ```

   The backend will now be accessible at [http://localhost:5000](http://localhost:5000).

3. **Start the Frontend:**

   Ensure the frontend is running by navigating to the `frontend` directory and running:

   ```bash
   cd ../frontend
   npm start
   ```

4. **(Optional) Using Docker Compose:**

   If you have a `docker-compose.yml` set up, you can run both frontend and backend containers simultaneously.

   ```bash
   docker-compose up -d
   ```

   **Example `docker-compose.yml`:**

   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       restart: always
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       restart: always
       depends_on:
         - backend
   ```

## Deployment

Deploying the application to Google Cloud ensures scalability and reliability. Below are the steps to deploy the backend using Google Cloud Container Instances.

### Deploying to Google Cloud Container Instances

1. **Authenticate with Google Cloud:**

   Ensure you have the Google Cloud SDK installed and authenticated.

   ```bash
   gcloud auth login
   ```

2. **Set Your Google Cloud Project:**

   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Build and Push the Docker Image to Google Container Registry (GCR):**

   ```bash
   # Tag the Docker image
   docker tag malaria-inference-backend gcr.io/YOUR_PROJECT_ID/malaria-inference-backend

   # Push the Docker image to GCR
   docker push gcr.io/YOUR_PROJECT_ID/malaria-inference-backend
   ```

4. **Deploy to Google Cloud Container Instances:**

   ```bash
   gcloud run deploy malaria-inference-backend \
     --image gcr.io/YOUR_PROJECT_ID/malaria-inference-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 5000
   ```

   Replace `YOUR_PROJECT_ID` with your actual Google Cloud project ID. Choose the appropriate region as needed.

5. **Update Frontend API Endpoint:**

   After deployment, Google Cloud will provide a URL for your backend service. Update the frontend configuration to point to this URL instead of `http://localhost:5000`.

   **Example Update in Frontend:**

   ```javascript
   // frontend/src/config.js

   export const API_URL = 'https://YOUR_CLOUD_RUN_URL/predict';
   ```

6. **Access the Deployed Application:**

   The backend is now accessible via the provided Google Cloud URL. Ensure the frontend is configured correctly to communicate with the deployed backend.

## API Reference

### Endpoint: `/predict`

- **Method:** `POST`
- **Description:** Receives an image file, processes it using the TensorFlow model, and returns the classification result.
- **Request:**
  - **Headers:**
    - `Content-Type: multipart/form-data`
  - **Body:**
    - `file`: The image file to be classified.
    - **OR**
    - Raw binary data of the image.
- **Response:**
  - **Status:** `200 OK`
  - **Body:**
    ```json
    {
      "prediction": "Parasitized",
      "confidence": 92.5
    }
    ```
    - `prediction`: Classification result (`Parasitized` or `Uninfected`).
    - `confidence`: Confidence score as a percentage.
  
- **Error Responses:**
  - **Status:** `400 Bad Request`
    ```json
    {
      "error": "No file or data provided"
    }
    ```
  - **Status:** `500 Internal Server Error`
    ```json
    {
      "error": "Detailed error message"
    }
    ```

### Example Request Using `curl`:

```bash
curl -X POST http://localhost:5000/predict \
  -F 'file=@/path/to/your/image.jpg'
```

### Example Response:

```json
{
  "prediction": "Parasitized",
  "confidence": 92.5
}
```

## Model Details

- **Model File:** `winning_model.keras`
- **Framework:** TensorFlow
- **Description:** A pre-trained model designed to classify blood cell images as either parasitized (infected) or uninfected.
- **Training Data:** The model was trained on a dataset containing images of blood cells with and without malaria parasites.
- **Input Size:** 64x64 RGB images
- **Output:** Softmax probabilities for two classes:
  - `0`: Uninfected
  - `1`: Parasitized

## Troubleshooting

- **Backend Not Responding:**
  - Ensure the Docker container is running:
    ```bash
    docker ps
    ```
  - Check container logs for errors:
    ```bash
    docker logs malaria-backend
    ```

- **CORS Issues:**
  - Ensure that `flask-cors` is correctly configured in `app.py` to allow requests from the frontend.
  - Example configuration:
    ```python
    from flask_cors import CORS
    app = Flask(__name__)
    CORS(app)
    ```

- **Model Loading Errors:**
  - Verify that `winning_model.keras` is present in the `backend` directory and correctly copied into the Docker image.
  - Ensure the model file path in `app.py` matches its location inside the Docker container:
    ```python
    model = tf.keras.models.load_model("/app/winning_model.keras")
    ```

- **Docker Build Failures:**
  - Ensure that all dependencies in `requirements.txt` are correct and compatible with Python 3.9.
  - Check for network issues that might prevent Docker from fetching dependencies.
  - Verify the Dockerfile syntax and paths.

- **Frontend Not Communicating with Backend:**
  - Ensure that the frontend API endpoint is correctly set to the deployed backend URL.
  - Check network configurations and firewall settings.
  - Inspect browser console for any network-related errors.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

Please ensure your code follows the project's coding standards and includes relevant tests.

### Motivation

Malaria remains a significant global health issue, especially in developing regions. Early and accurate diagnosis is crucial for effective treatment and control. Inspired by this challenge, I developed this application to aid healthcare professionals in diagnosing malaria more efficiently using machine learning models.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Additional Notes

- **Environment Variables:**
  - The Flask application uses the `PORT` environment variable, which is set by Google Cloud. If running locally, it defaults to `8080`.
  
- **Security Considerations:**
  - Ensure that the backend is secured appropriately, especially if deploying to a production environment.
  - Consider implementing authentication and authorization mechanisms as needed.
  
- **Scalability:**
  - Deploying the backend on Google Cloud Container Instances allows for easy scalability based on demand.
  - Monitor resource usage and adjust container instances accordingly.

- **Model Updates:**
  - If you update or retrain the TensorFlow model, replace the `winning_model.keras` file in the `backend` directory and rebuild the Docker image to deploy the updated model.

- **Frontend Deployment:**
  - While this README focuses on the backend deployment, consider deploying the React frontend to platforms like **Netlify**, **Vercel**, or **Google Cloud App Engine** for better performance and scalability.

---

## About the Author

Hello! I'm **Avi**, a software engineer passionate about solving real-world challenges using technology and machine learning. This application is part of my capstone project for the MIT Applied Data Science and Machine Learning program, where I worked on detecting malaria from blood cell images using deep learning models.

### Background

- **Education:**
  - Mechanical Engineering Major, Computer Science Minor – University of British Columbia
  - XR/VR Software Development Course – CircuitStream (University of Toronto)
  - Currently enrolled in MIT’s Professional Education Data Science and Machine Learning Program
  
- **Experience:**
  - I work as a software engineer at CN Rail, primarily with C#, ASP.NET, MVC applications, and machine learning technologies. I’ve also developed and launched a VR game called **Crazy Golf VR** on the Meta App Lab, which now has over 11,000 installs.

- **Interests:**
  - Machine Learning, Deep Learning, XR/VR, Software Development, Healthcare Technology

### Motivation

Malaria is a serious health problem in many regions, and early, accurate diagnosis can save lives. This project aims to bring machine learning into healthcare by making it easier and faster to detect malaria in blood cells using image classification, potentially supporting healthcare workers in resource-constrained settings.

### Get in Touch

- **Email:** harshvardhanv98@gmail.com
- **LinkedIn:** [linkedin.com/in/avivarma](https://www.linkedin.com/in/avivarma/)
- **GitHub:** [github.com/avias8](https://github.com/avias8)

I’m always open to collaborations or discussions, especially in healthcare tech and machine learning. Feel free to reach out!

---
