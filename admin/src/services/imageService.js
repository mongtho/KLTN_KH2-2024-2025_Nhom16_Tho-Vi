import axios from 'axios';

const API_KEY = 'e64a49ca517de7491f78d8edf586515a';
const UPLOAD_URL = 'https://api.imgbb.com/1/upload';

const imageService = {
  /**
   * Upload image to ImgBB
   * @param {File|Blob} imageFile - The image file to upload
   * @param {string} imageName - Optional name for the image
   * @param {number} expiration - Optional expiration time in seconds (60-15552000)
   * @returns {Promise<object>} - The upload result with image URLs
   */
  uploadImage: async (imageFile, imageName = null, expiration = 0) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (imageName) {
        formData.append('name', imageName);
      }
      
      // Set up request parameters
      const params = {
        key: API_KEY
      };
      
      if (expiration && expiration >= 60 && expiration <= 15552000) {
        params.expiration = expiration;
      }
      
      // Make the request
      const response = await axios.post(UPLOAD_URL, formData, {
        params,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error.response ? error.response.data : error;
    }
  },
  
  /**
   * Upload image as base64 string
   * @param {string} base64String - Base64 encoded image string (without data:image prefix)
   * @param {string} imageName - Optional name for the image
   * @param {number} expiration - Optional expiration time in seconds (60-15552000)
   * @returns {Promise<object>} - The upload result with image URLs
   */
  uploadBase64Image: async (base64String, imageName = null, expiration = 0) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', base64String);
      
      if (imageName) {
        formData.append('name', imageName);
      }
      
      // Set up request parameters
      const params = {
        key: API_KEY
      };
      
      if (expiration && expiration >= 60 && expiration <= 15552000) {
        params.expiration = expiration;
      }
      
      // Make the request
      const response = await axios.post(UPLOAD_URL, formData, {
        params,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading base64 image:', error);
      throw error.response ? error.response.data : error;
    }
  }
};

export default imageService; 