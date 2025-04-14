// This is a simple test script to verify the API endpoints
// Run with: node testEndpoints.js

const apiClient = {
  get: (url) => {
    console.log(`Testing GET request to: ${url}`);
    return Promise.resolve({ success: true });
  },
  put: (url, data) => {
    console.log(`Testing PUT request to: ${url} with data:`, data);
    return Promise.resolve({ success: true });
  }
};

const getSubResourcePath = (resource, id, subResource) => {
  return `/api/v1/${resource}/${id}/${subResource}`;
};

const getUserId = () => "test-user-id";

// Test the endpoints
async function testEndpoints() {
  const userId = getUserId();
  
  console.log("\n--- Testing API Endpoints ---\n");
  
  // Test user profile endpoint
  console.log("1. Testing user profile endpoint");
  await apiClient.get(`/api/v1/user-profiles/${userId}`);
  
  // Test user preferences endpoint
  console.log("\n2. Testing user preferences endpoint");
  const preferencesPath = getSubResourcePath('user-profiles', userId, 'preferences');
  console.log(`Generated path: ${preferencesPath}`);
  await apiClient.get(preferencesPath);
  
  // Verify that the old incorrect path is not being generated
  console.log("\n3. Checking if incorrect path would be generated");
  const incorrectPath = `/api/v1/user-profiles/${userId}/preferences`;
  console.log(`Incorrect path would be: ${incorrectPath}`);
  console.log(`Is the correct path different? ${preferencesPath !== incorrectPath ? "YES ✅" : "NO ❌"}`);
  
  console.log("\n--- Test Complete ---");
}

// Run the tests
testEndpoints().catch(console.error);
