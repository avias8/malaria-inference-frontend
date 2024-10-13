import React, { useState } from 'react';
import FileUpload from './FileUpload';  // Assuming FileUpload is in the same folder

const Game = () => {
    const [userGuess, setUserGuess] = useState(null);  // To track the user's guess
    const [result, setResult] = useState(null);        // To track the model's prediction
    const [loading, setLoading] = useState(false);     // To track loading state
    const [imageData, setImageData] = useState(null);  // To store formData with the selected image
    const [currentImagePath, setCurrentImagePath] = useState(null);  // To store the path of the current image
    const [userScore, setUserScore] = useState(0);     // To track user's correct guesses
    const [modelScore, setModelScore] = useState(0);   // To track model's correct predictions
    const [totalGuesses, setTotalGuesses] = useState(0); // Track total guesses

    // Function to select a new image after every guess
    const selectNewImage = () => {
        setImageData(null);  // Clear current image
        setResult(null);  // Clear the result
        document.getElementById('select-image-button').click();  // Trigger new random image selection
    };

    // Function to handle image submission and track the current image path
    const handleImageSubmit = (formData, imagePath) => {
        setImageData(formData);  // Store the form data for image submission
        setCurrentImagePath(imagePath);  // Store the path of the current image
    };

    // Wrapper function to handle the game logic
    const handleGameSubmit = async (guess) => {
        if (!imageData) {
            alert('No image selected!');
            return;
        }

        setLoading(true);
        setUserGuess(guess);  // Record the user's guess when they make a choice
        setResult(null);      // Reset previous results

        try {
            // Send the FormData (image) to the API
            const apiResponse = await fetch('https://keras-flask-inference-537799078747.us-central1.run.app/predict', {
                method: 'POST',
                body: imageData  // Submit the image
            });

            const data = await apiResponse.json();
            setResult(data);  // Store the model's prediction result

            // Update the total guesses count
            setTotalGuesses(prev => prev + 1);

            // Get the correct label based on the image path (assumes filenames contain "parasitized" or "uninfected")
            const correctLabel = currentImagePath.includes('parasitized') ? 'Parasitized' : 'Uninfected';

            // Check if the user's guess is correct
            if (guess === correctLabel) {
                setUserScore(prev => prev + 1);  // User's correct guess
            }

            // Check if the model's prediction is correct
            if (data.prediction === correctLabel) {
                setModelScore(prev => prev + 1);  // Model's correct prediction
            }

        } catch (error) {
            console.error('Error submitting image:', error);
            setResult({ error: 'Failed to get a response from the server' });
        } finally {
            setLoading(false);
            selectNewImage();  // Automatically select a new image after every guess
        }
    };

    return (
        <div>
            <h1>Malaria Cell Classification Game</h1>
            
            {/* Render the FileUpload component and store image data when an image is selected */}
            <FileUpload onImageSubmit={handleImageSubmit} />

            {/* Show buttons only if an image is selected */}
            {imageData && (
                <div>
                    <h3>Make Your Guess</h3>
                    <button onClick={() => handleGameSubmit('Parasitized')} disabled={loading}>
                        Infected
                    </button>
                    <button onClick={() => handleGameSubmit('Uninfected')} disabled={loading}>
                        Uninfected
                    </button>
                </div>
            )}

            {/* Show loading message */}
            {loading && <p>Processing...</p>}

            {/* Display the user's guess and the model's result once available */}
            {result && (
                <div>
                    <h2>Results</h2>
                    <p>Your Guess: {userGuess}</p>
                    {result.error ? (
                        <p>{result.error}</p>
                    ) : (
                        <p>
                            Model Prediction: {result.prediction} <br />
                            Confidence: {result.confidence}
                        </p>
                    )}
                </div>
            )}

            {/* Display the scoreboard */}
            <div>
                <h3>Scoreboard</h3>
                <p>Total Guesses: {totalGuesses}</p>
                <p>Your Correct Guesses: {userScore}</p>
                <p>Model's Correct Predictions: {modelScore}</p>
            </div>
        </div>
    );
};

export default Game;
