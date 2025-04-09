import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth';
import userProfileService from '../../api/userProfileService';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Account'>;

const AccountScreen = ({ navigation }: Props) => {
  const { user, isLoading: authLoading, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: null,
  });
  
  // Input field values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Track if form has been modified
  const isModified = name !== userData.name || email !== userData.email || phone !== userData.phone;
  
  // Load user data when component mounts and when user changes
  useEffect(() => {
    const loadUserData = async () => {
      console.log('AccountScreen - Loading user data');
      
      if (user) {
        // Format the name from firstName and lastName
        const fullName = [user.firstName || '', user.lastName || ''].filter(Boolean).join(' ');
        
        // Update user data state
        setUserData({
          name: fullName,
          email: user.email || '',
          // Phone isn't in the User type, so keep whatever value it had
          phone: userData.phone,
          profilePicture: user.profileImageUrl || null,
        });
        
        // Update input fields
        setName(fullName);
        setEmail(user.email || '');
      } else {
        // Try to fetch user profile directly
        try {
          const profileData = await userProfileService.getUserProfile();
          if (profileData) {
            // Format the name from firstName and lastName
            const fullName = [profileData.firstName || '', profileData.lastName || ''].filter(Boolean).join(' ');
            
            // Update user data state
            setUserData({
              name: fullName,
              email: profileData.email || '',
              phone: userData.phone,
              profilePicture: profileData.profileImageUrl || null,
            });
            
            // Update input fields
            setName(fullName);
            setEmail(profileData.email || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    loadUserData();
  }, [user]);
  
  // Handle save profile
  const handleSaveProfile = async () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Split the name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare update data
      const updatedProfile = {
        firstName,
        lastName,
        email,
        // Other fields are kept unchanged
      };
      
      console.log('Updating profile with:', updatedProfile);
      
      // Call service to update profile
      await userProfileService.updateProfile(updatedProfile);
      
      // Refresh user data
      await refreshUserData();
      
      // Update local state
      setUserData({
        ...userData,
        name,
        email,
        phone,
      });
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle change profile picture with improved error handling
  const handleChangeProfilePicture = async () => {
    try {
      // Request permission to access the photo library
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (libraryPermission.status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Please allow access to your photo library to change your profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => {
                // On iOS this will open the settings app
                // On Android, you might need to implement a custom solution
                Linking.openSettings().catch(() => {
                  Alert.alert('Unable to open settings', 'Please open settings manually to enable permissions.');
                });
              } 
            }
          ]
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false, // Avoid loading unnecessary EXIF data
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Update UI with selected image temporarily
        const uri = result.assets[0].uri;
        
        // Validate image size before uploading (optional)
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists && fileInfo.size > 5 * 1024 * 1024) { // 5MB limit
            Alert.alert('Image too large', 'Please select an image smaller than 5MB.');
            return;
          }
        } catch (error) {
          console.error('Error checking file size:', error);
          // Continue even if we can't check file size
        }
        
        // Set loading state
        setIsLoading(true);
        
        try {
          // Upload image to server
          const uploadedUrl = await userProfileService.uploadProfileImage(uri);
          
          // Update user data with new profile image URL
          setUserData({
            ...userData,
            profilePicture: uploadedUrl,
          });
          
          // Refresh user data to update the auth context
          await refreshUserData();
          
          Alert.alert('Success', 'Profile image updated successfully');
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          Alert.alert(
            'Upload Failed', 
            'Failed to upload profile image. Please check your internet connection and try again.'
          );
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'An unexpected error occurred while selecting an image.');
    }
  };
  
  // Show loading spinner when data is being fetched/updated
  if (authLoading && !user) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4A62FF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {userData.profilePicture ? (
              <Image 
                source={{ uri: userData.profilePicture }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.changePictureButton}
              onPress={handleChangeProfilePicture}
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        
        <View style={styles.actionsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4A62FF" />
              <Text style={styles.loadingText}>Saving changes...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.saveButton, !isModified && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={!isModified || isLoading}
            >
              <Text style={[styles.saveButtonText, !isModified && styles.saveButtonTextDisabled]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.passwordButton}
            onPress={() => {
              // In a real app, this would navigate to a change password screen
              Alert.alert('Change Password', 'This feature is not implemented in this demo.');
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#4A62FF" style={styles.passwordButtonIcon} />
            <Text style={styles.passwordButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.deleteAccountButton}
          onPress={() => {
            // In a real app, this would show a confirmation dialog and then delete the account
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' }
              ]
            );
          }}
        >
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A62FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionsSection: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButtonTextDisabled: {
    color: '#f0f0f0',
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  passwordButtonIcon: {
    marginRight: 8,
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  deleteAccountButton: {
    alignItems: 'center',
    padding: 15,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    color: '#d9534f',
  },
});

export default AccountScreen;