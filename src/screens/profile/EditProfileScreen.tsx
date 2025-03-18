import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TextInput, Button, Text } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isLoading: authLoading } = useAuth();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update form fields if user data changes
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setProfileImage(user.profileImageUrl || null);
    }
  }, [user]);

  const handleSelectImage = () => {
    // In a real app, this would use image picker
    Alert.alert('Image Upload', 'This would open the image picker in a real app.');
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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
          {profileImage ? (
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
