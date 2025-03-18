import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EmailSettings'>;

const EmailSettingsScreen = ({ navigation }: Props) => {
  const { getEmailSettings, updateEmailSettings } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    isConfigured: false,
  });

  // Load current email settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getEmailSettings();
        if (settings) {
          setEmailSettings(settings);
        }
      } catch (error) {
        console.error('Error loading email settings:', error);
        Alert.alert('Error', 'Failed to load email settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [getEmailSettings]);

  // Save email settings
  const handleSave = async () => {
    // Validate inputs
    if (!emailSettings.smtpServer.trim()) {
      Alert.alert('Error', 'SMTP Server is required');
      return;
    }

    if (!emailSettings.smtpUsername.trim()) {
      Alert.alert('Error', 'SMTP Username is required');
      return;
    }

    if (!emailSettings.smtpPassword.trim()) {
      Alert.alert('Error', 'SMTP Password is required');
      return;
    }

    if (!emailSettings.fromEmail.trim() || !emailSettings.fromEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid From Email address');
      return;
    }

    setIsSaving(true);

    try {
      await updateEmailSettings(emailSettings);
      Alert.alert('Success', 'Email settings updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving email settings:', error);
      Alert.alert('Error', 'Failed to save email settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Test email settings
  const handleTest = async () => {
    Alert.alert(
      'Send Test Email',
      'This will send a test email to verify your SMTP settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Test',
          onPress: async () => {
            Alert.alert('Success', 'This is a simulated test. In a real app, a test email would be sent.');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A62FF" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Email Settings</Text>
            <Text style={styles.subtitle}>Configure email server for password reset functionality</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>SMTP Server</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., smtp.gmail.com"
                value={emailSettings.smtpServer}
                onChangeText={(text) => setEmailSettings({ ...emailSettings, smtpServer: text })}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SMTP Port</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 587"
                value={emailSettings.smtpPort.toString()}
                onChangeText={(text) => {
                  const port = parseInt(text, 10);
                  if (!isNaN(port) || text === '') {
                    setEmailSettings({ ...emailSettings, smtpPort: text === '' ? 0 : port });
                  }
                }}
                keyboardType="number-pad"
              />
              <Text style={styles.hint}>Common ports: 25, 465, 587, 2525</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SMTP Username</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., your.email@gmail.com"
                value={emailSettings.smtpUsername}
                onChangeText={(text) => setEmailSettings({ ...emailSettings, smtpUsername: text })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>SMTP Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password or app password"
                value={emailSettings.smtpPassword}
                onChangeText={(text) => setEmailSettings({ ...emailSettings, smtpPassword: text })}
                secureTextEntry
              />
              <Text style={styles.hint}>
                For Gmail, you may need to use an App Password instead of your regular password
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>From Email</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., no-reply@mindfulmastery.com"
                value={emailSettings.fromEmail}
                onChangeText={(text) => setEmailSettings({ ...emailSettings, fromEmail: text })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTest}
            >
              <Text style={styles.testButtonText}>Test Email Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Settings</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={22} color="#4A62FF" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              These settings allow the app to send password reset emails. Make sure to use a valid SMTP server
              with proper authentication. For security, consider using an app-specific password if your email
              service supports it.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#e8efff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  saveButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8efff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default EmailSettingsScreen;