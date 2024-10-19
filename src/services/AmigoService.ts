// src/services/AmigoService.ts
import axios from 'axios';
import { Amigo } from '../types/AmigoTypes';
import { get, post, put, del } from './api'; // Assuming these functions use axios
import axiosInstance from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'; // Adjust accordingly

// Define the response interface for fetchAmigos
interface AmigosResponse {
  amigos: Amigo[];
}

// Fetch all amigos
export const fetchAmigos = async (): Promise<Amigo[]> => {
  try {
    // Make the request using axiosInstance
    const response = await axiosInstance.get('/api/v1/amigos', {
      withCredentials: true, // Ensure credentials are included
    });

    // Check if the expected data structure is returned
    if (response.data && Array.isArray(response.data)) {
      return response.data; // Return the response data directly if it is an array
    } else if (response.data && response.data.amigos && Array.isArray(response.data.amigos)) {
      // If the data structure is different, adjust as needed
      return response.data.amigos;
    } else {
      console.error('Unexpected response structure:', response.data);
      throw new Error('Failed to fetch amigos: Invalid response structure');
    }
  } catch (error) {
    console.error('Error fetching amigos:', error);
    throw error; // Rethrow the error for higher-level handling
  }
};

// Fetch a single amigo by ID
export const fetchAmigoById = async (id: number) => {
  try {
    return await get(`/api/v1/amigos/${id}`);
  } catch (error) {
    console.error(`Error fetching amigo with ID ${id}:`, error);
    throw error;
  }
};

// Fetch amigo details by amigo ID
export const fetchAmigoDetails = async (amigoId: number) => {
  try {
    const response = await axiosInstance.get(`/api/v1/amigos/${amigoId}/amigo_detail`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Amigo Details: ', error);
    throw error; // re-throw to handle in the component if needed
  }
};

// Fetch amigo locations by amigo ID
export const fetchAmigoLocations = async (amigoId: number) => {
  try {
    const response = await axiosInstance.get(`/api/v1/amigos/${amigoId}/amigo_locations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Amigo Address information: ', error);
    throw error; // re-throw to handle in the component if needed
  }
};

// Create a new amigo
export const createAmigo = async (amigoData: any) => {
  try {
    return await post('/api/v1/amigos', amigoData);
  } catch (error) {
    console.error('Error creating amigo:', error);
    throw error;
  }
};

// Update an amigo by ID
export const updateAmigo = async (id: number, amigoData: any) => {
  try {
    return await put(`/api/v1/amigos/${id}`, amigoData);
  } catch (error) {
    console.error(`Error updating amigo with ID ${id}:`, error);
    throw error;
  }
};

// Delete an amigo by ID
export const deleteAmigo = async (id: number) => {
  try {
    return await del(`/api/v1/amigos/${id}`);
  } catch (error) {
    console.error(`Error deleting amigo with ID ${id}:`, error);
    throw error;
  }
};