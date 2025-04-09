import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth';
import { useTheme } from '../../context/ThemeContext';
import { TextInput, Button, Text } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import userProfileService from '../../api/userProfileService';
import { User } from '../../types';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  // Form state initialized with empty values to avoid undefined
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Debug logging to see what user data we have
  useEffect(() => {
    console.log('Current user data:', JSON.stringify(user, null, 2));
  }, [user]);

  // Check if user data is available and redirect if not
  useEffect(() => {
    // Only show the error if we're not currently loading and there's no user
    // Add a small delay to give refreshUserData a chance to complete
    const timer = setTimeout(() => {
      if (!user && !authLoading) {
        console.log('No user data available in EditProfileScreen after delay');
        Alert.alert('Error', 'Could not load your profile. Please try again later.');
        navigation.goBack();
      }
    }, 1500); // 1.5 second delay
    
    return () => clearTimeout(timer);
  }, [user, authLoading, navigation]);

  // Force refresh user data when component mounts
  useEffect(() => {
    console.log('EditProfileScreen mounted - refreshing user data');
    let isMounted = true;
    
    const loadUserData = async () => {
      try {
        // Try first to get profile from userProfileService
        try {
          const profileData = await userProfileService.getUserProfile();
          
          if (isMounted && profileData) {
            console.log('Profile data from userProfileService:', JSON.stringify(profileData, null, 2));
            
            // Update form fields with profile data
            setFirstName(profileData.firstName || '');
            setLastName(profileData.lastName || '');
            setUsername(profileData.username || profileData.email?.split('@')[0] || '');
            setEmail(profileData.email || '');
            setBio(profileData.bio || '');
            setTimeZone(profileData.timeZone || '');
            setProfileImage(profileData.profileImageUrl || null);
            return; // Exit if we successfully loaded data
          }
        } catch (profileError) {
          console.warn('Failed to load profile from userProfileService:', profileError);
          // Continue to fallback method
        }
        
        // Fallback to refreshUserData from auth context
        await updateUser({});
        
        if (isMounted && user) {
          console.log('User data refreshed successfully in EditProfileScreen');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load user data:', error);
          Alert.alert('Error', 'Could not load your profile data. Please try again.');
        }
      }
    };
    
    loadUserData();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  // Update form fields if user data changes
  useEffect(() => {
    console.log('User data changed in EditProfileScreen:', user ? 'User data present' : 'No user data');
    if (user) {
      // Only update fields that are empty or if user data has changed
      if (firstName === '' || (user.firstName && user.firstName !== firstName)) {
        setFirstName(user.firstName || '');
      }
      
      if (lastName === '' || (user.lastName && user.lastName !== lastName)) {
        setLastName(user.lastName || '');
      }
      
      if (username === '' || (user.username && user.username !== username)) {
        setUsername(user.username || user.email?.split('@')[0] || '');
      }
      
      if (email === '' || (user.email && user.email !== email)) {
        setEmail(user.email || '');
      }
      
      if (bio === '' || (user.bio && user.bio !== bio)) {
        setBio(user.bio || '');
      }
      
      if (timeZone === '' || (user.timeZone && user.timeZone !== timeZone)) {
        setTimeZone(user.timeZone || '');
      }
      
      if (!profileImage && user.profileImageUrl) {
        setProfileImage(user.profileImageUrl);
      }
    }
  }, [user, firstName, lastName, username, email, bio, timeZone, profileImage]);

  const handleSelectImage = async () => {
    try {
      // Request permission to access the photo library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        // Update UI with selected image
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        
        // Upload image to server
        setIsUploading(true);
        try {
          const uploadedUrl = await userProfileService.uploadProfileImage(uri);
          setProfileImage(uploadedUrl);
          
          // Refresh user data to update the profile image in the auth context
          await updateUser({});
          
          Alert.alert('Success', 'Profile image uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          Alert.alert('Error', 'Failed to upload profile image. The image will be uploaded when you save your profile.');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'First name and last name are required');
        return;
      }
      
      // Log current form state
      console.log('Submitting profile update with data:', {
        firstName, lastName, bio, timeZone, profileImage
      });
      
      // Build update object with only the fields the backend expects
      const updatedProfile: Partial<User> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio?.trim() || undefined,
        timeZone: timeZone?.trim() || undefined,
        profileImageUrl: profileImage || undefined
      };
      
      // Call service to update profile
      const result = await userProfileService.updateProfile(updatedProfile);
      console.log('Profile update result:', result);
      
      // Update user data in the auth context
      if (user) {
        await updateUser({
          ...user,
          ...updatedProfile
        });
      }
      
      // Show success message and navigate back
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      // Try to extract a more specific error message
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3">Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {isUploading ? (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.neutral.lighter }]}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text variant="caption" style={{ marginTop: 10 }}>Uploading...</Text>
            </View>
          ) : profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.neutral.lighter }]}>
              <Ionicons name="person" size={60} color={colors.neutral.light} />
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.imageEditButton, { backgroundColor: colors.primary.main }]}
            onPress={handleSelectImage}
            disabled={isUploading}
          >
            <Ionicons name="camera" size={20} color={colors.primary.contrast} />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            leftIcon="person-outline"
          />
          
          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            leftIcon="person-outline"
          />
          
          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            leftIcon="document-text-outline"
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            label="Time Zone"
            value={timeZone}
            onChangeText={setTimeZone}
            placeholder="E.g., America/New_York"
            leftIcon="time-outline"
          />
          
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            leftIcon="at-outline"
            editable={false}
            inputStyle={{ opacity: 0.7 }}
          />
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
            inputStyle={{ opacity: 0.7 }}
          />
        </View>

        {/* Helper Text */}
        <Text 
          variant="caption" 
          color="secondary" 
          style={styles.helperText}
        >
          Username and email cannot be changed. Contact support if you need to update these fields.
        </Text>

        {/* Submit Button */}
        <Button
          title="Save Changes"
          onPress={handleUpdateProfile}
          loading={isLoading}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEditButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginBottom: 16,
  },
  helperText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfileScreen;