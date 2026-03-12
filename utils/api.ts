import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to access host machine's localhost.
// Use localhost for iOS simulator or web.
// Change this to your Render URL deploying in the future.
const DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const PROD_URL = 'https://furniture-3q80.onrender.com/api'; // Render URL

export const API_URL = process.env.NODE_ENV === 'production' ? PROD_URL : PROD_URL;

export const endpoints = {
  login: `${API_URL}/auth/login`,
  signup: `${API_URL}/auth/signup`,
  products: `${API_URL}/products/`,
};
