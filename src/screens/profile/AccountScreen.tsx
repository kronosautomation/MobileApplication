import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Account'>;

const AccountScreen = ({ navigation }: Props) => {
  // Mock initial user data (in a real app, this would come from context)
  const [userData, setUserData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 123-4567',
    profilePicture: null, // In a real app, this would be a uri
  });
  
  // Input field values
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState(userData.phone);
  
  // Track if form has been modified
  const isModified = name !== userData.name || email !== userData.email || phone !== userData.phone;
  
  // Handle save profile
  const handleSaveProfile = () => {
    // Basic validation
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // In a real app, you would send this data to your API/backend
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
  };
  
  // Handle change profile picture
  const handleChangeProfilePicture = () => {
    // In a real app, this would open the camera or photo library
    Alert.alert('Change Profile Picture', 'This feature is not implemented in this demo.');
  };
  
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
          <TouchableOpacity 
            style={[styles.saveButton, !isModified && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={!isModified}
          >
            <Text style={[styles.saveButtonText, !isModified && styles.saveButtonTextDisabled]}>
              Save Changes
            </Text>
          </TouchableOpacity>
          
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