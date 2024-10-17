import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import './FileUpload.css';  // Import the new CSS file

/*
 * FileUpload Component
 * --------------------
 * - Responsible for handling image selection and uploading.
 * - Fetches a list of images from a JSON file located in the public folder.
 * - Randomly selects an image when the images are loaded.
 * - Fetches the selected image as a blob and prepares it as FormData.
 * - Passes the image data back to the parent component via the onImageSubmit callback.
 * - Exposes the randomImage function to the parent component using a forwarded ref.
 */

const FileUpload = forwardRef(({ onImageSubmit }, ref) => {
    const [imagePath, setImagePath] = useState(null);
    const [imageName, setImageName] = useState(null);  // To store the image name
    const [images, setImages] = useState(null); // To store images from JSON

    // Fetch the image list from the JSON file when the component mounts
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/image_list.json`)
            .then(response => response.json())
            .then(data => {
                setImages(data);
            })
            .catch(error => console.error('Error fetching image list:', error));
    }, []);

    // Function to randomly select an image from a category, memoized with useCallback
    const randomImage = useCallback(() => {
        if (!images) return;  // Ensure images are loaded

        const categories = Object.keys(images); // Get categories from the fetched data
        const category = categories[Math.floor(Math.random() * categories.length)];

        const randomImageName = images[category][Math.floor(Math.random() * images[category].length)];
        const imagePath = `${process.env.PUBLIC_URL}/test/${category}/${randomImageName}`; // Use PUBLIC_URL to access the public folder
        const imageName = randomImageName;  // Image file name

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
    }, [images, onImageSubmit]);

    // Call randomImage when images are loaded
    useEffect(() => {
        if (images) {
            randomImage();
        }
    }, [images, randomImage]);

    // Expose randomImage function to parent via ref
    useImperativeHandle(ref, () => ({
        randomImage
    }));

    return (
        <div className="file-upload">
            {imagePath && (
                <div>
                    <div className="image-container">
                        <img src={imagePath} alt="Selected Cell" />
                    </div>
                    <p>Selected Image: {imageName}</p>
                </div>
            )}
        </div>
    );
});

export default FileUpload;
