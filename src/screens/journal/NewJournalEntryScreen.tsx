import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../../navigation/stacks/JournalStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<JournalStackParamList, 'NewJournalEntry'>;

// Available moods
const moods = [
  { id: 'peaceful', label: 'Peaceful', icon: 'leaf-outline', color: '#4CAF50' },
  { id: 'happy', label: 'Happy', icon: 'sunny-outline', color: '#FFC107' },
  { id: 'grateful', label: 'Grateful', icon: 'heart-outline', color: '#E91E63' },
  { id: 'determined', label: 'Determined', icon: 'fitness-outline', color: '#FF5722' },
  { id: 'reflective', label: 'Reflective', icon: 'water-outline', color: '#2196F3' },
];

// Prompts to help with journaling
const journalPrompts = [
  'What are you grateful for today?',
  'What emotions came up during your meditation?',
  'How did you practice mindfulness today?',
  'What challenged you today and how did you respond?',
  'What brought you joy today?',
];

const NewJournalEntryScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  
  // Format current date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Add a prompt to the content
  const addPrompt = (prompt: string) => {
    setContent(current => current + (current ? '\n\n' : '') + prompt + '\n');
    setShowPrompts(false);
  };
  
  // Save the journal entry
  const saveEntry = () => {
    if (!title.trim()) {
      // In a real app, show a validation error
      return;
    }
    
    // In a real app, you would save the entry to storage
    console.log('Saving entry:', { title, content, mood: selectedMood, date: formattedDate });
    
    // Navigate back to the journal list
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Journal Entry</Text>
          <TouchableOpacity 
            style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
            onPress={saveEntry}
            disabled={!title.trim()}
          >
            <Text style={[styles.saveButtonText, !title.trim() && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          
          <TextInput
            style={styles.titleInput}
            placeholder="Entry Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          
          <View style={styles.moodSelector}>
            <Text style={styles.moodTitle}>How are you feeling?</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodList}
            >
              {moods.map(mood => (
                <TouchableOpacity 
                  key={mood.id}
                  style={[
                    styles.moodItem,
                    selectedMood === mood.id && { backgroundColor: mood.color + '20' }
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                >
                  <View style={[
                    styles.moodIcon,
                    { backgroundColor: selectedMood === mood.id ? mood.color + '30' : '#f0f0f0' }
                  ]}>
                    <Ionicons 
                      name={mood.icon} 
                      size={24} 
                      color={selectedMood === mood.id ? mood.color : '#666'} 
                    />
                  </View>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === mood.id && { color: mood.color }
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle}>Journal Entry</Text>
              <TouchableOpacity
                style={styles.promptButton}
                onPress={() => setShowPrompts(!showPrompts)}
              >
                <Ionicons name="help-circle-outline" size={24} color="#4A62FF" />
                <Text style={styles.promptButtonText}>Prompts</Text>
              </TouchableOpacity>
            </View>
            
            {showPrompts && (
              <View style={styles.promptsContainer}>
                {journalPrompts.map((prompt, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.promptItem}
                    onPress={() => addPrompt(prompt)}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TextInput
              style={styles.contentInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#999"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4A62FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: '#f0f0f0',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  moodSelector: {
    marginBottom: 20,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  moodList: {
    paddingBottom: 10,
  },
  moodItem: {
    alignItems: 'center',
    marginRight: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  moodIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptButtonText: {
    fontSize: 14,
    color: '#4A62FF',
    marginLeft: 5,
  },
  promptsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promptItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  promptText: {
    fontSize: 14,
    color: '#333',
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default NewJournalEntryScreen;