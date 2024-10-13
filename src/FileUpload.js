import React, { useState, useEffect } from 'react';

const FileUpload = ({ onImageSubmit }) => {
    const [imagePath, setImagePath] = useState(null);
    const [imageName, setImageName] = useState(null);  // To store the image name
    const [imageList, setImageList] = useState({ parasitized: [], uninfected: [] });

    useEffect(() => {
        // Fetch the image list JSON file
        const fetchImageList = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/imageList.json`);
                const data = await response.json();
                setImageList(data);
            } catch (error) {
                console.error('Error fetching the image list:', error);
            }
        };

        fetchImageList();
    }, []);

    // Function to randomly select an image from a category
    const randomImage = () => {
        const categories = ['parasitized', 'uninfected'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const images = imageList[category];

        if (images.length > 0) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            const imagePath = `/${randomImage}`; // Path directly from the public folder
            const imageName = randomImage.split('/').pop();  // Extract the image name from the path

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
        } else {
            console.error("[DEBUG] No images found in the directory for category:", category);
        }
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
