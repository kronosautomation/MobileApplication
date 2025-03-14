import apiClient from './apiClient';
import { PerformanceJournal } from '../types';

class JournalService {
  // Get user's journal entries
  async getJournals(startDate?: Date, endDate?: Date): Promise<PerformanceJournal[]> {
    try {
      let url = '/performance-journal';
      const params = [];
      
      if (startDate) {
        params.push(`startDate=${startDate.toISOString()}`);
      }
      
      if (endDate) {
        params.push(`endDate=${endDate.toISOString()}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiClient.get<PerformanceJournal[]>(url);
      return response;
    } catch (error) {
      // Handle 402 Payment Required separately
      if (error.response?.status === 402) {
        throw new Error('Premium subscription required to access the journal feature');
      }
      
      throw this.handleError(error, 'Failed to fetch journal entries');
    }
  }

  // Get a single journal entry by ID
  async getJournalById(id: string): Promise<PerformanceJournal> {
    try {
      const response = await apiClient.get<PerformanceJournal>(`/performance-journal/${id}`);
      return response;
    } catch (error) {
      // Handle 402 Payment Required separately
      if (error.response?.status === 402) {
        throw new Error('Premium subscription required to access the journal feature');
      }
      
      throw this.handleError(error, 'Failed to fetch journal entry');
    }
  }

  // Create a new journal entry
  async createJournal(journal: Omit<PerformanceJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PerformanceJournal> {
    try {
      const response = await apiClient.post<PerformanceJournal>('/performance-journal', journal);
      return response;
    } catch (error) {
      // Handle 402 Payment Required separately
      if (error.response?.status === 402) {
        if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error('Premium subscription required to use the journal feature');
      }
      
      throw this.handleError(error, 'Failed to create journal entry');
    }
  }

  // Update an existing journal entry
  async updateJournal(id: string, journal: Partial<PerformanceJournal>): Promise<PerformanceJournal> {
    try {
      const response = await apiClient.put<PerformanceJournal>(`/performance-journal/${id}`, {
        ...journal,
        id, // Ensure the ID is included
      });
      return response;
    } catch (error) {
      // Handle 402 Payment Required separately
      if (error.response?.status === 402) {
        throw new Error('Premium subscription required to update the journal entry');
      }
      
      throw this.handleError(error, 'Failed to update journal entry');
    }
  }

  // Delete a journal entry
  async deleteJournal(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/performance-journal/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete journal entry');
    }
  }

  // Helper method to handle errors
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(defaultMessage);
  }
}

export const journalService = new JournalService();
export default journalService;
