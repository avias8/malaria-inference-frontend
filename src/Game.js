import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import FileUpload from './FileUpload';
import './Game.css';

const Game = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const [userScore, setUserScore] = useState(0);
  const [modelScore, setModelScore] = useState(0);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // 'online', 'offline', or 'checking'

  // Combined game results
  const [gameResults, setGameResults] = useState([]);

  // Ref to access methods in FileUpload component
  const fileUploadRef = useRef();

  // Memoize handleImageSubmit to prevent re-creation on every render
  const handleImageSubmit = useCallback((formData, imagePath) => {
    setImageData(formData);
    setCurrentImagePath(imagePath);
  }, []);

  // Function to select a new image after every guess
  const selectNewImage = () => {
    setImageData(null);
    if (fileUploadRef.current) {
      fileUploadRef.current.randomImage();
    }
  };

  // Function to check API status
  const checkApiStatus = useCallback(async () => {
    try {
      const response = await fetch('https://keras-flask-inference-537799078747.us-central1.run.app/predict', {
        method: 'OPTIONS',
        mode: 'cors',
      });
      if (response.ok || response.status === 204) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus('offline');
    }
  }, []);
  

  // Initially select an image when the component mounts and check API status
  useEffect(() => {
    if (fileUploadRef.current) {
      fileUploadRef.current.randomImage();
    }
    // Check API status immediately and then every 30 seconds
    checkApiStatus();
    const interval = setInterval(() => {
      checkApiStatus();
    }, 30000); // 30 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [checkApiStatus]);

  // Handle the game logic when the user makes a guess
  const handleGameSubmit = async (guess) => {
    if (!imageData) {
      alert('No image selected!');
      return;
    }

    setLoading(true);

    try {
      // Send the image to the prediction API
      const apiResponse = await fetch('https://keras-flask-inference-537799078747.us-central1.run.app/predict', {
        method: 'POST',
        body: imageData,
      });

      const data = await apiResponse.json();

      // Update the total guesses count
      setTotalGuesses((prev) => prev + 1);

      // Determine the correct label based on the image path
      const correctLabel = currentImagePath.includes('parasitized') ? 'Parasitized' : 'Uninfected';

      // Determine if the user's guess was correct
      const isUserCorrect = guess === correctLabel;

      // Update user score
      if (isUserCorrect) {
        setUserScore((prev) => prev + 1);
      }

      // Determine if the model's prediction was correct
      const isModelCorrect = data.prediction === correctLabel;

      // Update model score
      if (isModelCorrect) {
        setModelScore((prev) => prev + 1);
      }

      // Create a new result entry
      const newResult = {
        key: totalGuesses, // Unique key
        userCorrect: isUserCorrect,
        modelCorrect: isModelCorrect,
        correctLabel: correctLabel, // The actual label
        userGuess: guess,
        modelPrediction: data.prediction,
        confidence: data.confidence,
      };

      // Update the gameResults array
      setGameResults((prevResults) => [...prevResults, newResult]);
    } catch (error) {
      console.error('Error submitting image:', error);
      setErrorMessage('An error occurred while processing your guess. Please try again.');
    } finally {
      setLoading(false);
      selectNewImage();
    }
  };

  return (
    <div className="game">
      
    {/* Status Orb */}
    <a
      href="https://console.cloud.google.com/run/detail/us-central1/keras-flask-inference/metrics?project=massive-petal-438523-s7"
      target="_blank"
      rel="noopener noreferrer"
      className={`status-orb ${apiStatus}`}
      title="API Status"
    ></a>

      <h1>Malaria Cell Classification Game</h1>

      {/* Render the FileUpload component */}
      <FileUpload ref={fileUploadRef} onImageSubmit={handleImageSubmit} />

      {/* Show buttons only if an image is selected */}
      {imageData && (
        <div className="guess-buttons">
          <h3>Make Your Guess</h3>
          <button
            onClick={() => handleGameSubmit('Parasitized')}
            disabled={loading || apiStatus !== 'online'}
            tabIndex={0}
            aria-label="Guess Infected"
          >
            Infected
          </button>

          <button
            onClick={() => handleGameSubmit('Uninfected')}
            disabled={loading || apiStatus !== 'online'}
            tabIndex={1}
            aria-label="Guess Uninfected"
          >
            Uninfected
          </button>
        </div>
      )}

      {/* Show loading spinner */}
      {loading && (
        <div className="loading">
          <ClipLoader color="#1976d2" loading={loading} size={50} />
        </div>
      )}

      {/* Display the combined results history */}
      <div className="results-history">
        <h3>Guess History</h3>
        <div className="results-container">
          {gameResults.slice(-5).reverse().map((entry) => (
            <div key={entry.key} className="result-entry">
              {/* User's result */}
              <span
                className={`emoji ${!entry.userCorrect ? 'shake' : ''}`}
                aria-label={entry.userCorrect ? 'Correct' : 'Incorrect'}
              >
                {entry.userCorrect ? '✅' : '😲'}
              </span>
              <span className="label">You</span>
              <span className="guess">({entry.userGuess})</span>

              <span className="vs">vs</span>

              {/* Model's result */}
              <span
                className={`emoji ${!entry.modelCorrect ? 'shake' : ''}`}
                aria-label={entry.modelCorrect ? 'Correct' : 'Incorrect'}
              >
                {entry.modelCorrect ? '✅' : '😲'}
              </span>
              <span className="label">Model</span>
              <span className="guess">({entry.modelPrediction})</span>

              <span className="confidence">Confidence: {entry.confidence}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Display the scoreboard */}
      <div className="scoreboard">
        <h3>Scoreboard</h3>
        <p>Total Guesses: {totalGuesses}</p>
        <p>Your Correct Guesses: {userScore}</p>
        <p>Model's Correct Predictions: {modelScore}</p>
      </div>

      {/* Display error message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Game;
