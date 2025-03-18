import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

// Settings sections and items
const settingsSections = [
  {
    title: 'App Settings',
    items: [
      { id: 'darkMode', label: 'Dark Mode', type: 'switch', icon: 'moon-outline' },
      { id: 'sounds', label: 'Sound Effects', type: 'switch', icon: 'volume-high-outline' },
      { id: 'haptics', label: 'Haptic Feedback', type: 'switch', icon: 'phone-portrait-outline' },
    ],
  },
  {
    title: 'Meditation',
    items: [
      { id: 'backgroundSounds', label: 'Background Sounds', type: 'select', icon: 'musical-notes-outline' },
      { id: 'endBell', label: 'End of Session Bell', type: 'switch', icon: 'notifications-outline' },
      { id: 'keepAwake', label: 'Keep Screen Awake', type: 'switch', icon: 'phone-portrait-outline' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'emailSettings', label: 'Email Settings', type: 'navigation', icon: 'mail-outline', screen: 'EmailSettings' },
      { id: 'syncData', label: 'Sync Data to Cloud', type: 'switch', icon: 'cloud-upload-outline' },
      { id: 'analytics', label: 'Share Analytics', type: 'switch', icon: 'analytics-outline' },
      { id: 'exportData', label: 'Export Your Data', type: 'action', icon: 'download-outline' },
      { id: 'deleteData', label: 'Delete All Data', type: 'action', icon: 'trash-outline', destructive: true },
    ],
  },
];

const SettingsScreen = ({ navigation }: Props) => {
  // Initial settings state (in a real app, this would come from storage/context)
  const [settings, setSettings] = useState({
    darkMode: false,
    sounds: true,
    haptics: true,
    backgroundSounds: 'Nature',
    endBell: true,
    keepAwake: true,
    syncData: true,
    analytics: false,
  });
  
  // Handle switch toggle
  const handleSwitchToggle = (id: string) => {
    setSettings({
      ...settings,
      [id]: !settings[id as keyof typeof settings],
    });
  };
  
  // Handle action button press
  const handleActionPress = (id: string) => {
    // In a real app, these would trigger actual actions
    if (id === 'exportData') {
      console.log('Export data action');
    } else if (id === 'deleteData') {
      console.log('Delete data action');
    }
  };
  
  // Handle navigation
  const handleNavigation = (screen: keyof ProfileStackParamList) => {
    navigation.navigate(screen);
  };
  
  // Handle selection option
  const handleSelect = (id: string) => {
    // In a real app, this would open a selection modal
    console.log('Open selection for:', id);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View 
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.settingItemLast,
                  ]}
                >
                  <View style={styles.settingItemIcon}>
                    <Ionicons 
                      name={item.icon} 
                      size={22} 
                      color={item.destructive ? '#d9534f' : '#4A62FF'} 
                    />
                  </View>
                  
                  <Text style={[
                    styles.settingItemLabel,
                    item.destructive && styles.destructiveText,
                  ]}>
                    {item.label}
                  </Text>
                  
                  {item.type === 'switch' && (
                    <Switch
                      value={!!settings[item.id as keyof typeof settings]}
                      onValueChange={() => handleSwitchToggle(item.id)}
                      trackColor={{ false: '#e0e0e0', true: '#c8d6ff' }}
                      thumbColor={!!settings[item.id as keyof typeof settings] ? '#4A62FF' : '#f4f3f4'}
                      ios_backgroundColor="#e0e0e0"
                    />
                  )}
                  
                  {item.type === 'select' && (
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => handleSelect(item.id)}
                    >
                      <Text style={styles.selectButtonText}>
                        {settings[item.id as keyof typeof settings] as string}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                  )}
                  
                  {item.type === 'action' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleActionPress(item.id)}
                    >
                      <Text style={[
                        styles.actionButtonText,
                        item.destructive && styles.destructiveText,
                      ]}>
                        Select
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {item.type === 'navigation' && (
                    <TouchableOpacity
                      style={styles.navigationButton}
                      onPress={() => handleNavigation(item.screen as keyof ProfileStackParamList)}
                    >
                      <Ionicons name="chevron-forward" size={22} color="#ccc" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
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
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingItemLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  destructiveText: {
    color: '#d9534f',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#4A62FF',
    marginRight: 5,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  navigationButton: {
    padding: 5,
  },
});

export default SettingsScreen;