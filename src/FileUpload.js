import React, { useState, useEffect } from 'react';

const FileUpload = ({ onImageSubmit }) => {
    const [imagePath, setImagePath] = useState(null);
    const [imageName, setImageName] = useState(null);  // To store the image name
    const [images, setImages] = useState({ parasitized: [], uninfected: [] }); // To store images from JSON

    // Fetch the image list from the JSON file
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/image_list.json`)
            .then(response => response.json())
            .then(data => {
                setImages(data);
            })
            .catch(error => console.error('Error fetching image list:', error));
    }, []);

    // Function to randomly select an image from a category
    const randomImage = () => {
        const categories = Object.keys(images); // Get categories from the fetched data
        const category = categories[Math.floor(Math.random() * categories.length)];

        const randomImage = images[category][Math.floor(Math.random() * images[category].length)];
        const imagePath = `${process.env.PUBLIC_URL}/test/${category}/${randomImage}`; // Use PUBLIC_URL to access the public folder
        const imageName = randomImage;  // Image file name

        setImagePath(imagePath);
        setImageName(imageName);

        // Fetch the image as a blob and prepare it as formData
        fetch(imagePath)
            .then(response => response.blob())
            .then(blob => {
                const formData = new FormData();
                formData.append('file', blob, imageName);
                onImageSubmit(formData, imagePath);
            })
            .catch(error => console.error('Error fetching the image:', error));
    };

    return (
        <div>
            <button id="select-image-button" onClick={randomImage}>Select Random Image</button>

            {imagePath && (
                <div>
                    <img src={imagePath} alt="Selected Cell" width="300" />
                    <p>Selected Image: {imageName}</p>  {/* Display the image name */}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
