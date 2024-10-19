// FileUpload.js

import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useCallback,
  } from 'react';
  import './FileUpload.css';
  
  const FileUpload = forwardRef(
    ({ onImageSubmit, useRandomImage, setUseRandomImage }, ref) => {
      const [imagePath, setImagePath] = useState(null);
      const [imageName, setImageName] = useState(null); // To store the image name
      const [images, setImages] = useState(null); // To store images from JSON
  
      // Fetch the image list from the JSON file when the component mounts
      useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/image_list.json`)
          .then((response) => response.json())
          .then((data) => {
            setImages(data);
          })
          .catch((error) =>
            console.error('Error fetching image list:', error)
          );
      }, []);
  
      // Function to randomly select an image from a category
      const randomImage = useCallback(() => {
        if (!images) return; // Ensure images are loaded
  
        const categories = Object.keys(images); // Get categories from the fetched data
        const category =
          categories[Math.floor(Math.random() * categories.length)];
  
        const randomImageName =
          images[category][
            Math.floor(Math.random() * images[category].length)
          ];
        const imagePath = `${process.env.PUBLIC_URL}/test/${category}/${randomImageName}`; // Use PUBLIC_URL to access the public folder
        const imageName = randomImageName; // Image file name
  
        setImagePath(imagePath);
        setImageName(imageName);
  
        // Fetch the image as a blob and prepare it as formData
        fetch(imagePath)
          .then((response) => response.blob())
          .then((blob) => {
            const formData = new FormData();
            formData.append('file', blob, imageName);
            onImageSubmit(formData, imagePath);
          })
          .catch((error) =>
            console.error('Error fetching the image:', error)
          );
      }, [images, onImageSubmit]);
  
      // Function to handle file input change
      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const imageUrl = URL.createObjectURL(file);
          setImagePath(imageUrl);
          setImageName(file.name);
  
          const formData = new FormData();
          formData.append('file', file, file.name);
          onImageSubmit(formData, imageUrl);
        } else {
          alert('Please upload a valid image file.');
        }
      };
  
      // Expose randomImage function to parent via ref
      useImperativeHandle(ref, () => ({
        randomImage,
      }));
  
      // When useRandomImage changes, select a random image if true
      useEffect(() => {
        if (useRandomImage && images) {
          randomImage();
        } else {
          // Clear the image when switching to upload mode
          setImagePath(null);
          setImageName(null);
        }
      }, [useRandomImage, images, randomImage]);
  
      return (
        <div className="file-upload">
          {/* Toggle between random image and upload */}
          <div className="toggle-buttons">
            <button
              className={useRandomImage ? 'active' : ''}
              onClick={() => setUseRandomImage(true)}
              aria-label="Use Random Image"
              title="Select a random image from the dataset"
            >
              <i className="bi bi-shuffle icon"></i>
              Use Random Image
            </button>
            <button
              className={!useRandomImage ? 'active' : ''}
              onClick={() => setUseRandomImage(false)}
              aria-label="Upload Your Own Image"
              title="Upload your own image for prediction"
            >
              <i className="bi bi-upload icon"></i>
              Upload Your Own Image
            </button>
          </div>
  
          {useRandomImage ? (
            // Display the random image
            imagePath && (
              <div>
                <div className="image-container">
                  <img src={imagePath} alt="Selected Cell" />
                </div>
                <p>Selected Image: {imageName}</p>
              </div>
            )
          ) : (
            // Display the file input for uploading
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePath && (
                <div>
                  <div className="image-container">
                    <img src={imagePath} alt="Uploaded Cell" />
                  </div>
                  <p>Uploaded Image: {imageName}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  );
  
  export default FileUpload;