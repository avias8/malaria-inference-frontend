// Game.js

// Game.js

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

  const [useRandomImage, setUseRandomImage] = useState(true);

  // Combined game results
  const [gameResults, setGameResults] = useState([]);

  // For model results when uploading an image
  const [modelResults, setModelResults] = useState([]);
  const [predictionCount, setPredictionCount] = useState(0);

  // Ref to access methods in FileUpload component
  const fileUploadRef = useRef();

  // Memoize handleImageSubmit to prevent re-creation on every render
  const handleImageSubmit = useCallback((formData, imagePath) => {
    setImageData(formData);
    setCurrentImagePath(imagePath);
    setPredictionCount(0);
    setModelResults([]);
  }, []);

  // Function to select a new image after every guess (only for random images)
  const selectNewImage = () => {
    setImageData(null);
    if (fileUploadRef.current && useRandomImage) {
      fileUploadRef.current.randomImage();
    }
  };

  // Function to check API status
  const checkApiStatus = useCallback(async () => {
    try {
      const response = await fetch(
        'https://keras-flask-inference-537799078747.us-central1.run.app/predict',
        {
          method: 'OPTIONS',
          mode: 'cors',
        }
      );
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
    if (fileUploadRef.current && useRandomImage) {
      fileUploadRef.current.randomImage();
    }
    // Check API status immediately and then every 30 seconds
    checkApiStatus();
    const interval = setInterval(() => {
      checkApiStatus();
    }, 30000); // 30 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [checkApiStatus, useRandomImage]);

  // Reset image data when switching modes
  useEffect(() => {
    setImageData(null);
    setCurrentImagePath(null);
    setModelResults([]);
    setPredictionCount(0);

    if (useRandomImage && fileUploadRef.current) {
      fileUploadRef.current.randomImage();
    }
  }, [useRandomImage]);

  // Handle the game logic when the user makes a guess
  const handleGameSubmit = async (guess) => {
    if (!imageData) {
      alert('No image selected!');
      return;
    }

    setLoading(true);

    try {
      // Send the image to the prediction API
      const apiResponse = await fetch(
        'https://keras-flask-inference-537799078747.us-central1.run.app/predict',
        {
          method: 'POST',
          body: imageData,
        }
      );

      const data = await apiResponse.json();

      // Update the total guesses count
      setTotalGuesses((prev) => prev + 1);

      // Determine the correct label based on the image path
      let correctLabel = 'Unknown';
      if (currentImagePath) {
        if (currentImagePath.includes('parasitized')) {
          correctLabel = 'Parasitized';
        } else if (currentImagePath.includes('uninfected')) {
          correctLabel = 'Uninfected';
        }
      }

      // Determine if the user's guess was correct (only if we have the correct label)
      let isUserCorrect = false;
      if (correctLabel !== 'Unknown') {
        isUserCorrect = guess === correctLabel;
        // Update user score
        if (isUserCorrect) {
          setUserScore((prev) => prev + 1);
        }
      }

      // Determine if the model's prediction was correct (only if we have the correct label)
      let isModelCorrect = false;
      if (correctLabel !== 'Unknown') {
        isModelCorrect = data.prediction === correctLabel;
        // Update model score
        if (isModelCorrect) {
          setModelScore((prev) => prev + 1);
        }
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
      setErrorMessage(
        'An error occurred while processing your guess. Please try again.'
      );
    } finally {
      setLoading(false);
      if (useRandomImage) {
        selectNewImage();
      }
    }
  };

  // Effect to make predictions when an image is uploaded and useRandomImage is false
  useEffect(() => {
    if (!useRandomImage && imageData && predictionCount < 5 && !loading) {
      const makePrediction = async () => {
        setLoading(true);
        try {
          // Send the image to the prediction API
          const apiResponse = await fetch(
            'https://keras-flask-inference-537799078747.us-central1.run.app/predict',
            {
              method: 'POST',
              body: imageData,
            }
          );

          const data = await apiResponse.json();

          // Update prediction count
          setPredictionCount((prev) => prev + 1);

          // Add result to modelResults
          setModelResults((prevResults) => [...prevResults, data]);
        } catch (error) {
          console.error('Error submitting image:', error);
          setErrorMessage(
            'An error occurred while processing the image. Please try again.'
          );
        } finally {
          setLoading(false);
        }
      };

      makePrediction();
    }
  }, [useRandomImage, imageData, predictionCount, loading]);

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
      <FileUpload
        ref={fileUploadRef}
        onImageSubmit={handleImageSubmit}
        useRandomImage={useRandomImage}
        setUseRandomImage={setUseRandomImage}
      />

      {/* Show guess buttons only if an image is selected and useRandomImage is true */}
      {imageData && useRandomImage && (
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

      {/* Display results for uploaded image */}
      {imageData && !useRandomImage && (
        <div className="model-results">
          <h3>Model Predictions</h3>
          <p>
            Predictions made: {predictionCount} / 5
          </p>
          <div className="results-container">
            {modelResults.map((result, index) => (
              <div key={index} className="result-entry">
                <span className="label">Prediction {index + 1}:</span>
                <span className="guess">{result.prediction}</span>
                <span
                  className="confidence"
                  style={{
                    color:
                      result.confidence > 80
                        ? 'green'
                        : result.confidence > 50
                        ? 'orange'
                        : 'red',
                  }}
                >
                  Confidence: {result.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display message when no image is uploaded */}
      {!imageData && !useRandomImage && (
        <p>Please upload an image to see the model's predictions.</p>
      )}

      {/* Display the combined results history for random images */}
      {useRandomImage && (
        <>
          <div className="results-history">
            <h3>Guess History</h3>
            <div className="results-container">
              {gameResults
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <div key={entry.key} className="result-entry">
                    {/* User's result */}
                    <span
                      className={`emoji ${
                        !entry.userCorrect ? 'shake' : ''
                      }`}
                      aria-label={
                        entry.userCorrect ? 'Correct' : 'Incorrect'
                      }
                    >
                      {entry.userCorrect ? '✅' : '😲'}
                    </span>
                    <span className="label">You</span>
                    <span className="guess">({entry.userGuess})</span>

                    <span className="vs">vs</span>

                    {/* Model's result */}
                    <span
                      className={`emoji ${
                        !entry.modelCorrect ? 'shake' : ''
                      }`}
                      aria-label={
                        entry.modelCorrect ? 'Correct' : 'Incorrect'
                      }
                    >
                      {entry.modelCorrect ? '✅' : '😲'}
                    </span>
                    <span className="label">Model</span>
                    <span className="guess">
                      ({entry.modelPrediction})
                    </span>

                    <span className="confidence">
                      Confidence: {entry.confidence}
                    </span>
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
        </>
      )}

      {/* Display error message */}
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default Game;