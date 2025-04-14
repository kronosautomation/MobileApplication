import apiClient, { getApiPath } from '../api/apiClient';

/**
 * A utility to help debug API path issues by testing endpoints
 * and logging if they're accessible
 * 
 * @param path The path to test
 * @returns True if the endpoint is accessible, false otherwise
 */
export async function testEndpoint(resource: string): Promise<boolean> {
  const endpointPath = getApiPath(resource);
  console.log(`🔍 Testing endpoint: ${endpointPath}`);
  
  try {
    // Make a HEAD request to test the endpoint (minimal data transfer)
    await apiClient.getAxiosInstance().head(endpointPath);
    console.log(`✅ SUCCESS - Endpoint works: ${endpointPath}`);
    return true;
  } catch (error) {
    if (error.response) {
      // If we get a 401, that means the endpoint exists but requires auth
      if (error.response.status === 401) {
        console.log(`✅ SUCCESS - Endpoint exists but requires auth: ${endpointPath}`);
        return true;
      }
      
      // If we get a 404, the endpoint doesn't exist
      if (error.response.status === 404) {
        console.log(`❌ FAIL - Endpoint not found: ${endpointPath}`);
      } else {
        console.log(`❓ UNKNOWN - Endpoint returned status ${error.response.status}: ${endpointPath}`);
      }
    } else {
      console.log(`❌ FAIL - Network error for endpoint: ${endpointPath}`);
    }
    return false;
  }
}

/**
 * Tests all endpoints for achievements to find working paths
 */
export async function testAchievementEndpoints(): Promise<void> {
  console.log('🔍 Testing all achievement endpoints...');
  
  const endpoints = [
    'achievements/user',
    'achievements/1', // Example ID for testing
    'achievements/user/new',
    'achievements/user/streak'
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const endpoint of endpoints) {
    const isWorking = await testEndpoint(endpoint);
    results[endpoint] = isWorking;
  }
  
  console.log('🔍 Achievement endpoint test results:');
  console.table(results);
}
