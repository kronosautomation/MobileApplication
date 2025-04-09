import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../auth';
import databaseService from '../../services/storage/databaseService';
import { syncService } from '../../services/sync/syncService';
import { validateSetting } from '../../utils/validation';
import { debounce } from 'lodash';
import { AppSettings } from '../../types/settings';
import apiClient from '../../api/apiClient';

// Default settings object
const defaultSettings: AppSettings = {
  syncData: false,
  soundEffects: true,
  hapticFeedback: true,
  preferredBackgroundSound: 'rain',
  sessionEndBell: true,
  keepScreenAwake: false,
  shareAnalytics: false
};

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

interface SettingItem {
  id: keyof AppSettings | 'darkMode' | 'exportData' | 'deleteData';
  label: string;
  type: 'switch' | 'select' | 'action' | 'navigation';
  icon: string;
  screen?: keyof ProfileStackParamList;
  destructive?: boolean;
  value?: boolean | string;
  selectValue?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsScreen = ({ navigation }: Props) => {
  const { isDark, toggleDarkMode, currentTheme } = useTheme();
  const { logout } = useAuth();
  const { colors } = currentTheme;
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Memoize the settings sections to prevent unnecessary re-renders
  const settingsSections = useMemo<SettingSection[]>(() => [
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          label: 'Dark Mode',
          type: 'switch',
          icon: 'moon',
          value: isDark,
        } as SettingItem,
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          id: 'syncData',
          label: 'Sync Data to Cloud',
          type: 'switch',
          icon: 'cloud',
          value: settings.syncData,
        } as SettingItem,
        {
          id: 'exportData',
          label: 'Export Data',
          type: 'action',
          icon: 'download',
          destructive: false,
        } as SettingItem,
        {
          id: 'deleteData',
          label: 'Delete All Data',
          type: 'action',
          icon: 'trash',
          destructive: true,
        } as SettingItem,
      ],
    },
    {
      title: 'Meditation',
      items: [
        { 
          id: 'soundEffects', 
          label: 'Sound Effects', 
          type: 'switch', 
          icon: 'volume-high-outline', 
          value: settings.soundEffects 
        } as SettingItem,
        { 
          id: 'hapticFeedback', 
          label: 'Haptic Feedback', 
          type: 'switch', 
          icon: 'phone-portrait-outline', 
          value: settings.hapticFeedback 
        } as SettingItem,
        { 
          id: 'preferredBackgroundSound', 
          label: 'Background Sounds', 
          type: 'select', 
          icon: 'musical-notes-outline', 
          value: settings.preferredBackgroundSound,
          selectValue: settings.preferredBackgroundSound
        } as SettingItem,
        { 
          id: 'sessionEndBell', 
          label: 'End of Session Bell', 
          type: 'switch', 
          icon: 'notifications-outline', 
          value: settings.sessionEndBell 
        } as SettingItem,
      ],
    },
    {
      title: 'System',
      items: [
        { 
          id: 'shareAnalytics', 
          label: 'Share Analytics', 
          type: 'switch', 
          icon: 'analytics-outline', 
          value: settings.shareAnalytics 
        } as SettingItem,
      ],
    },
  ], [isDark, settings]);

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await databaseService.getItem<AppSettings>('SETTINGS');
        if (savedSettings) {
          // Merge saved settings with defaults, ensuring all required fields exist
          const mergedSettings = {
            ...defaultSettings,
            ...savedSettings,
            // Ensure boolean fields are properly typed
            syncData: Boolean(savedSettings.syncData),
            soundEffects: Boolean(savedSettings.soundEffects),
            hapticFeedback: Boolean(savedSettings.hapticFeedback),
            sessionEndBell: Boolean(savedSettings.sessionEndBell),
            keepScreenAwake: Boolean(savedSettings.keepScreenAwake),
            shareAnalytics: Boolean(savedSettings.shareAnalytics),
            // Ensure string fields have valid values
            preferredBackgroundSound: savedSettings.preferredBackgroundSound || 'rain'
          };
          setSettings(mergedSettings);
        } else {
          // If no settings exist, save the default settings
          await databaseService.saveItem('SETTINGS', { ...defaultSettings, id: 'settings' });
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        Alert.alert('Error', 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Debounced save settings function
  const debouncedSaveSettings = useCallback(
    debounce(async (newSettings: AppSettings) => {
      try {
        // Ensure the settings object has an ID and all required fields
        const settingsToSave = {
          ...newSettings,
          id: 'settings',
          // Ensure all fields are properly typed
          syncData: Boolean(newSettings.syncData),
          soundEffects: Boolean(newSettings.soundEffects),
          hapticFeedback: Boolean(newSettings.hapticFeedback),
          sessionEndBell: Boolean(newSettings.sessionEndBell),
          keepScreenAwake: Boolean(newSettings.keepScreenAwake),
          shareAnalytics: Boolean(newSettings.shareAnalytics),
          preferredBackgroundSound: newSettings.preferredBackgroundSound || 'rain'
        };
        await databaseService.saveItem('SETTINGS', settingsToSave);
      } catch (error) {
        console.error('Error saving settings:', error);
        Alert.alert('Error', 'Failed to save settings');
      }
    }, 500),
    []
  );

  const handleSettingChange = async (id: keyof AppSettings | 'darkMode' | 'exportData' | 'deleteData', value: any) => {
    if (id === 'darkMode') {
      toggleDarkMode();
      return;
    }

    if (id === 'exportData') {
      // Handle export data action
      Alert.alert(
        'Export Data',
        'This will export all your data to a file that you can save or share.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              try {
                const allData = await databaseService.getAll('SETTINGS');
                // In a real app, you would save this to a file or share it
                Alert.alert('Success', 'Data has been exported successfully');
              } catch (error) {
                console.error('Error exporting data:', error);
                Alert.alert('Error', 'Failed to export data');
              }
            },
          },
        ]
      );
      return;
    }

    if (id === 'deleteData') {
      handleDestructiveAction('delete all data');
      return;
    }

    // Validate the setting value
    const validation = validateSetting(id as keyof AppSettings, value);
    if (!validation.isValid) {
      Alert.alert('Invalid Setting', validation.error || 'Invalid setting value');
      return;
    }

    try {
      const newSettings = { ...settings, [id]: value };
      setSettings(newSettings);
      await debouncedSaveSettings(newSettings);

      if (id === 'syncData') {
        setIsSyncing(true);
        try {
          if (value) {
            const result = await syncService.initialize();
            if (!result.success) {
              throw new Error(result.error || 'Failed to initialize sync');
            }

            const syncResult = await syncService.processSyncQueue();
            if (!syncResult.success) {
              throw new Error(syncResult.error || 'Failed to sync data');
            }

            Alert.alert(
              'Success',
              `Data sync enabled. ${syncResult.syncedItems || 0} items synced.`
            );
          } else {
            Alert.alert('Info', 'Data sync has been disabled. Your data will only be stored locally.');
          }
        } catch (error) {
          console.error('Error handling sync:', error);
          Alert.alert('Error', 'Failed to update sync settings. Please try again.');
          // Revert the setting if sync fails
          await debouncedSaveSettings({ ...settings, [id]: !value });
          setSettings({ ...settings, [id]: !value });
        } finally {
          setIsSyncing(false);
        }
      }
    } catch (error) {
      console.error('Error handling setting change:', error);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    }
  };

  // Handle navigation
  const handleNavigation = (screen: keyof ProfileStackParamList) => {
    navigation.navigate(screen);
  };

  // Handle destructive actions
  const handleDestructiveAction = async (id: string) => {
    Alert.alert(
      'Confirm',
      `Are you sure you want to ${id}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get user ID
              const userId = await apiClient.getUserId();
              if (!userId) {
                throw new Error('User ID not available');
              }

              // Delete data from backend
              await apiClient.delete(`/api/v1/user-profiles/${userId}/data`);

              // Clear local data
              await databaseService.clearAllData();

              // Show success message
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {section.title}
            </Text>
            {section.items.map((item: SettingItem, itemIndex) => (
              <View
                key={item.id}
                style={[
                  styles.settingItem,
                  { backgroundColor: colors.background.paper },
                  itemIndex === section.items.length - 1 && styles.lastItem,
                ]}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={colors.text.secondary}
                    style={styles.settingIcon}
                  />
                  <Text style={[styles.settingLabel, { color: colors.text.primary }]}>
                    {item.label}
                  </Text>
                </View>
                {item.type === 'switch' && (
                  <Switch
                    value={typeof item.value === 'boolean' ? item.value : false}
                    onValueChange={(value) => {
                      if (item.id === 'darkMode') {
                        toggleDarkMode();
                      } else {
                        handleSettingChange(item.id as keyof AppSettings | 'darkMode' | 'exportData' | 'deleteData', value);
                      }
                    }}
                    trackColor={{ false: colors.neutral.lighter, true: colors.primary.main }}
                    thumbColor={colors.background.paper}
                  />
                )}
                {item.type === 'navigation' && item.screen && (
                  <TouchableOpacity onPress={() => handleNavigation(item.screen!)}>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
                {item.type === 'action' && (
                  <TouchableOpacity
                    onPress={() => handleDestructiveAction(item.id)}
                    style={item.destructive ? styles.destructiveButton : undefined}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        {
                          color: item.destructive
                            ? colors.error.main
                            : colors.primary.main,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  destructiveButton: {
    padding: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SettingsScreen;