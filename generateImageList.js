const fs = require('fs');
const path = require('path');

// Function to get image files from a directory
const getImagesFromDirectory = (dirPath) => {
    return fs.readdirSync(dirPath).filter(file => {
        return ['.png', '.jpg', '.jpeg'].includes(path.extname(file).toLowerCase());
    });
};

// Base directory containing the images
const baseDir = path.join(__dirname, 'public');

// Define categories
const categories = ['parasitized', 'uninfected'];

// Create an object to hold the image paths
const imageList = {};

// Loop through each category to populate the image list
categories.forEach(category => {
    const dirPath = path.join(baseDir, 'test', category);
    if (fs.existsSync(dirPath)) {
        const images = getImagesFromDirectory(dirPath);
        imageList[category] = images; // Use the filenames directly
    } else {
        console.warn(`Category not found: ${category}`);
    }
});

// Write the image list to a JSON file directly in the public directory
fs.writeFileSync(path.join(baseDir, 'image_list.json'), JSON.stringify(imageList, null, 2), 'utf-8');

console.log('image_list.json has been generated successfully in the public directory!');
