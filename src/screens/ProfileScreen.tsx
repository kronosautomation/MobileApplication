import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/stacks/ProfileStack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth';
import { User } from '../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

const ProfileScreen = ({ navigation }: Props) => {
  const { user, logout, isLoading, refreshUserData } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Optionally refresh user data when the screen mounts or focuses
    refreshUserData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserData();
    } catch (error) {
      Alert.alert('Error', 'Could not refresh profile data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation to Auth stack is handled by RootNavigator
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const renderProfileContent = () => {
    if (isLoading && !user) {
      return <ActivityIndicator size="large" color="#4A62FF" style={styles.loader} />;
    }

    if (!user) {
      return <Text style={styles.errorText}>Could not load profile data.</Text>;
    }

    const getInitials = (firstName: string, lastName: string) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{getInitials(user.firstName, user.lastName)}</Text>
              </View>
            )}
          </View>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>
              {user.name || `${user.firstName} ${user.lastName}`}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.meditationStats?.totalMinutes || 0}</Text>
            <Text style={styles.statLabel}>Minutes Meditated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.meditationStats?.completedSessions || 0}</Text>
            <Text style={styles.statLabel}>Sessions Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.meditationStats?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="person-circle-outline" size={24} color="#4A62FF" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Account')}>
            <Ionicons name="settings-outline" size={24} color="#4A62FF" />
            <Text style={styles.menuItemText}>Account Settings</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#4A62FF" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoading}>
          <Text style={styles.logoutButtonText}>Logout</Text>
          {isLoading && <ActivityIndicator color="#fff" size="small" style={{ marginLeft: 10 }} />}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderProfileContent()}
      {isRefreshing && <ActivityIndicator style={styles.refreshLoader} size="small" color="#4A62FF"/>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
    fontSize: 16,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  initialsAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: '80%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshLoader: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
  }
});

export default ProfileScreen;