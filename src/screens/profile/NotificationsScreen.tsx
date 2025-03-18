import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

// Time options for meditation reminders
const reminderTimes = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', 
  '12:00 PM', '6:00 PM', '9:00 PM', '10:00 PM',
];

const NotificationsScreen = ({ navigation }: Props) => {
  // Initial notification settings (in a real app, this would come from storage/context)
  const [settings, setSettings] = useState({
    meditationReminders: true,
    journalReminders: true,
    progressUpdates: true,
    newContentAlerts: false,
    reminderTime: '8:00 AM',
    reminderDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });
  
  // Toggle switch settings
  const handleSwitchToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };
  
  // Select reminder time
  const handleSelectTime = (time: string) => {
    setSettings(prev => ({
      ...prev,
      reminderTime: time,
    }));
  };
  
  // Toggle day selection
  const handleDayToggle = (day: string) => {
    const days = [...settings.reminderDays];
    
    if (days.includes(day)) {
      // Remove day if already selected
      const newDays = days.filter(d => d !== day);
      setSettings(prev => ({
        ...prev,
        reminderDays: newDays,
      }));
    } else {
      // Add day if not selected
      setSettings(prev => ({
        ...prev,
        reminderDays: [...prev.reminderDays, day],
      }));
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.sectionContent}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationItemInfo}>
                <View style={styles.notificationItemIcon}>
                  <Ionicons name="timer-outline" size={22} color="#4A62FF" />
                </View>
                <View>
                  <Text style={styles.notificationItemLabel}>Meditation Reminders</Text>
                  <Text style={styles.notificationItemDescription}>
                    Daily reminders to meditate
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.meditationReminders}
                onValueChange={() => handleSwitchToggle('meditationReminders')}
                trackColor={{ false: '#e0e0e0', true: '#c8d6ff' }}
                thumbColor={settings.meditationReminders ? '#4A62FF' : '#f4f3f4'}
                ios_backgroundColor="#e0e0e0"
              />
            </View>
            
            <View style={styles.notificationItem}>
              <View style={styles.notificationItemInfo}>
                <View style={styles.notificationItemIcon}>
                  <Ionicons name="book-outline" size={22} color="#4A62FF" />
                </View>
                <View>
                  <Text style={styles.notificationItemLabel}>Journal Reminders</Text>
                  <Text style={styles.notificationItemDescription}>
                    Reminders to record your thoughts
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.journalReminders}
                onValueChange={() => handleSwitchToggle('journalReminders')}
                trackColor={{ false: '#e0e0e0', true: '#c8d6ff' }}
                thumbColor={settings.journalReminders ? '#4A62FF' : '#f4f3f4'}
                ios_backgroundColor="#e0e0e0"
              />
            </View>
            
            <View style={styles.notificationItem}>
              <View style={styles.notificationItemInfo}>
                <View style={styles.notificationItemIcon}>
                  <Ionicons name="stats-chart-outline" size={22} color="#4A62FF" />
                </View>
                <View>
                  <Text style={styles.notificationItemLabel}>Progress Updates</Text>
                  <Text style={styles.notificationItemDescription}>
                    Weekly summaries of your progress
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.progressUpdates}
                onValueChange={() => handleSwitchToggle('progressUpdates')}
                trackColor={{ false: '#e0e0e0', true: '#c8d6ff' }}
                thumbColor={settings.progressUpdates ? '#4A62FF' : '#f4f3f4'}
                ios_backgroundColor="#e0e0e0"
              />
            </View>
            
            <View style={styles.notificationItem}>
              <View style={styles.notificationItemInfo}>
                <View style={styles.notificationItemIcon}>
                  <Ionicons name="newspaper-outline" size={22} color="#4A62FF" />
                </View>
                <View>
                  <Text style={styles.notificationItemLabel}>New Content Alerts</Text>
                  <Text style={styles.notificationItemDescription}>
                    Notifications about new meditations
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.newContentAlerts}
                onValueChange={() => handleSwitchToggle('newContentAlerts')}
                trackColor={{ false: '#e0e0e0', true: '#c8d6ff' }}
                thumbColor={settings.newContentAlerts ? '#4A62FF' : '#f4f3f4'}
                ios_backgroundColor="#e0e0e0"
              />
            </View>
          </View>
        </View>
        
        {settings.meditationReminders && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Schedule</Text>
            
            <View style={styles.sectionContent}>
              <View style={styles.scheduleSection}>
                <Text style={styles.scheduleSectionTitle}>Time</Text>
                <View style={styles.timeOptions}>
                  {reminderTimes.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        settings.reminderTime === time && styles.timeOptionSelected,
                      ]}
                      onPress={() => handleSelectTime(time)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        settings.reminderTime === time && styles.timeOptionTextSelected,
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.scheduleSection}>
                <Text style={styles.scheduleSectionTitle}>Days</Text>
                <View style={styles.dayOptions}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayOption,
                        settings.reminderDays.includes(day) && styles.dayOptionSelected,
                      ]}
                      onPress={() => handleDayToggle(day)}
                    >
                      <Text style={[
                        styles.dayOptionText,
                        settings.reminderDays.includes(day) && styles.dayOptionTextSelected,
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
        
        <TouchableOpacity style={styles.testButton}>
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          Note: You will need to enable notifications in your device settings for these preferences to take effect.
        </Text>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationItemLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  notificationItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  scheduleSection: {
    marginBottom: 15,
  },
  scheduleSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  timeOptionSelected: {
    backgroundColor: '#4A62FF',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  timeOptionTextSelected: {
    color: 'white',
  },
  dayOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayOptionSelected: {
    backgroundColor: '#4A62FF',
  },
  dayOptionText: {
    fontSize: 14,
    color: '#666',
  },
  dayOptionTextSelected: {
    color: 'white',
  },
  testButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default NotificationsScreen;