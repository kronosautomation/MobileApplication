import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../../navigation/stacks/JournalStack';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../../api/journalService';
import { PerformanceJournal, PerformanceFocusArea } from '../../types';
import DatePickerWrapper from '../../components/common/DatePickerWrapper';
import { styles } from './styles/NewJournalEntryScreen.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'NewJournalEntry'>;

// Available moods/emotions
const moods = [
  { id: 'peaceful', label: 'Peaceful', icon: 'leaf-outline', color: '#4CAF50' },
  { id: 'happy', label: 'Happy', icon: 'sunny-outline', color: '#FFC107' },
  { id: 'grateful', label: 'Grateful', icon: 'heart-outline', color: '#E91E63' },
  { id: 'determined', label: 'Determined', icon: 'fitness-outline', color: '#FF5722' },
  { id: 'reflective', label: 'Reflective', icon: 'water-outline', color: '#2196F3' },
  { id: 'anxious', label: 'Anxious', icon: 'flash-outline', color: '#9C27B0' },
  { id: 'nervous', label: 'Nervous', icon: 'pulse-outline', color: '#FF9800' },
  { id: 'focused', label: 'Focused', icon: 'eye-outline', color: '#607D8B' },
];

// Prompts to help with journaling
const journalPrompts = [
  'What emotions came up during this situation?',
  'How did your body respond to this situation?',
  'What thoughts went through your mind?',
  'What triggered your anxiety?',
  'What would you do differently next time?',
];

// Focus area options mapped to the enum
const focusAreaOptions = [
  { id: PerformanceFocusArea.PublicSpeaking, label: 'Public Speaking' },
  { id: PerformanceFocusArea.Sports, label: 'Sports Performance' },
  { id: PerformanceFocusArea.WorkPresentation, label: 'Work Presentation' },
  { id: PerformanceFocusArea.JobInterview, label: 'Job Interview' },
  { id: PerformanceFocusArea.SocialAnxiety, label: 'Social Situations' },
  { id: PerformanceFocusArea.TestTaking, label: 'Test Taking' },
  { id: PerformanceFocusArea.SexualPerformance, label: 'Sexual Performance' },
  { id: PerformanceFocusArea.Other, label: 'Other' },
];

// Define available options locally if not fetched from elsewhere
const availableCopingStrategies: string[] = [
  "Deep Breathing", "Mindfulness", "Grounding", "Positive Self-Talk", "Distraction", "Problem Solving", "Seeking Support"
];
const availableTechniques: string[] = [
  "Visualization", "Progressive Muscle Relaxation", "Thought Stopping", "Reframing", "Exposure Therapy"
];

const NewJournalEntryScreen = ({ navigation }: Props) => {
  // Basic info
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Emotion section
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showPrompts, setShowPrompts] = useState(false);
  
  // Cognitive behavioral therapy model fields
  const [situation, setSituation] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [physicalSensations, setPhysicalSensations] = useState('');
  const [actions, setActions] = useState('');
  const [outcome, setOutcome] = useState('');
  const [reflection, setReflection] = useState('');
  
  // Ratings
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  
  // State initialization for focus area - default to 'Other' instead of null
  const [selectedFocusArea, setSelectedFocusArea] = useState<PerformanceFocusArea>(PerformanceFocusArea.Other);
  const [selectedCopingStrategies, setSelectedCopingStrategies] = useState<string[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);
  
  // Event related fields
  const [showEventFields, setShowEventFields] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  
  // UI state
  const [currentSection, setCurrentSection] = useState('basic'); // 'basic', 'emotions', 'thoughts', 'advanced'
  
  // Format displayed date
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  
  const formattedEventDate = eventDate?.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) || '';
  
  // Add a prompt to content fields
  const addPrompt = (prompt: string) => {
    // Determine which field to add the prompt to based on the current section
    if (currentSection === 'emotions') {
      setPhysicalSensations(current => current + (current ? '\n\n' : '') + prompt + '\n');
    } else if (currentSection === 'thoughts') {
      setThoughts(current => current + (current ? '\n\n' : '') + prompt + '\n');
    } else {
      setSituation(current => current + (current ? '\n\n' : '') + prompt + '\n');
    }
    setShowPrompts(false);
  };
  
  // Toggle selection of a coping strategy
  const toggleCopingStrategy = (strategy: string) => {
    if (selectedCopingStrategies.includes(strategy)) {
      setSelectedCopingStrategies(prev => prev.filter(s => s !== strategy));
    } else {
      setSelectedCopingStrategies(prev => [...prev, strategy]);
    }
  };
  
  // Toggle selection of a technique
  const toggleTechnique = (technique: string) => {
    if (selectedTechniques.includes(technique)) {
      setSelectedTechniques(prev => prev.filter(t => t !== technique));
    } else {
      setSelectedTechniques(prev => [...prev, technique]);
    }
  };
  
  // Save the journal entry
  const saveEntry = async () => {
    if (!title.trim() || isLoading) {
      return;
    }
    
    setIsLoading(true);
    
    const newEntryData: Partial<PerformanceJournal> = {
      title: title.trim() || 'Untitled Journal',
      date: date.toISOString(),
      anxietyLevel,
      confidenceLevel,
      performanceFocusArea: selectedFocusArea, // Always provide a value, never null or undefined // Always send a valid focus area
      emotions: selectedMoods,
      techniquesUsed: selectedTechniques,
      copingStrategies: selectedCopingStrategies,
      isPrivate,
      
      // Event information (if enabled)
      event: showEventFields ? eventName.trim() : undefined,
      eventDate: showEventFields ? eventDate?.toISOString() : undefined,
      
      // CBT model fields
      situation: situation.trim() || undefined,
      thoughts: thoughts.trim() || undefined,
      physicalSensations: physicalSensations.trim() || undefined,
      actions: actions.trim() || undefined,
      outcome: outcome.trim() || undefined,
      reflection: reflection.trim() || undefined,
    };

    console.log('Saving journal entry with data:', JSON.stringify(newEntryData, null, 2));

    try {
      await journalService.createJournal(newEntryData as Omit<PerformanceJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      Alert.alert(
        "Success",
        "Journal entry saved successfully!",
        [{ text: "OK", onPress: () => navigation.navigate('JournalList') }]
      );
    } catch (error: any) {
      console.error("Failed to save journal entry:", error);
      Alert.alert(
        "Error Saving Entry",
        error.message || "An unexpected error occurred while saving your journal entry. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color={isLoading ? '#ccc' : '#666'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Journal Entry</Text>
          <TouchableOpacity 
            style={[styles.saveButton, (!title.trim() || isLoading) && styles.saveButtonDisabled]}
            onPress={saveEntry}
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.saveButtonText, !title.trim() && styles.saveButtonTextDisabled]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, currentSection === 'basic' && styles.activeTab]}
            onPress={() => setCurrentSection('basic')}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={18} 
              color={currentSection === 'basic' ? '#4A62FF' : '#888'} 
            />
            <Text style={[styles.tabText, currentSection === 'basic' && styles.activeTabText]}>
              Basic
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentSection === 'emotions' && styles.activeTab]}
            onPress={() => setCurrentSection('emotions')}
          >
            <Ionicons 
              name="heart-outline" 
              size={18} 
              color={currentSection === 'emotions' ? '#4A62FF' : '#888'} 
            />
            <Text style={[styles.tabText, currentSection === 'emotions' && styles.activeTabText]}>
              Emotions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentSection === 'thoughts' && styles.activeTab]}
            onPress={() => setCurrentSection('thoughts')}
          >
            <Ionicons 
              name="bulb-outline" 
              size={18} 
              color={currentSection === 'thoughts' ? '#4A62FF' : '#888'} 
            />
            <Text style={[styles.tabText, currentSection === 'thoughts' && styles.activeTabText]}>
              Thoughts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentSection === 'advanced' && styles.activeTab]}
            onPress={() => setCurrentSection('advanced')}
          >
            <Ionicons 
              name="options-outline" 
              size={18} 
              color={currentSection === 'advanced' ? '#4A62FF' : '#888'} 
            />
            <Text style={[styles.tabText, currentSection === 'advanced' && styles.activeTabText]}>
              Advanced
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContainer}>
          {currentSection === 'basic' && (
            <View style={styles.sectionContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Date</Text>
                <DatePickerWrapper
                  value={date}
                  onChange={setDate}
                  maximumDate={new Date()}
                  iconColor="#4A62FF"
                  style={styles.dateSelector}
                  disabled={isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Give your entry a title..."
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Situation</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe the performance situation you experienced or are anticipating..."
                  placeholderTextColor="#999"
                  value={situation}
                  onChangeText={setSituation}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.fieldLabel}>Event Information</Text>
                  <TouchableOpacity
                    onPress={() => setShowPrompts(!showPrompts)}
                    style={styles.helpButton}
                  >
                    <Ionicons name="help-circle-outline" size={20} color="#4A62FF" />
                  </TouchableOpacity>
                </View>
                {showPrompts && (
                  <View style={styles.promptsContainer}>
                    {journalPrompts.map((prompt, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.promptItem}
                        onPress={() => !isLoading && addPrompt(prompt)}
                        disabled={isLoading}
                      >
                        <Text style={styles.promptText}>{prompt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Track a specific event</Text>
                  <Switch 
                    value={showEventFields} 
                    onValueChange={setShowEventFields}
                    trackColor={{ false: '#e0e0e0', true: '#4A62FF30' }}
                    thumbColor={showEventFields ? '#4A62FF' : '#f4f3f4'}
                    disabled={isLoading}
                  />
                </View>
                
                {showEventFields && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Event Name (e.g., 'Presentation at Work')"
                      placeholderTextColor="#999"
                      value={eventName}
                      onChangeText={setEventName}
                      editable={!isLoading}
                    />
                    <DatePickerWrapper
                      value={eventDate || new Date()}
                      onChange={(date) => setEventDate(date)}
                      iconColor="#4A62FF"
                      style={styles.dateSelector}
                      disabled={isLoading}
                    />
                  </>
                )}
              </View>
            </View>
          )}
          
          {currentSection === 'emotions' && (
            <View style={styles.sectionContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>How are you feeling?</Text>
                <View style={styles.moodGrid}>
                  {moods.map(mood => (
                    <TouchableOpacity 
                      key={mood.id}
                      style={[
                        styles.moodItem,
                        selectedMoods.includes(mood.id) && { backgroundColor: mood.color + '20' }
                      ]}
                      onPress={() => !isLoading && setSelectedMoods(prev =>
                        prev.includes(mood.id) ? prev.filter(m => m !== mood.id) : [...prev, mood.id]
                      )}
                      disabled={isLoading}
                    >
                      <View style={[
                        styles.moodIcon,
                        { backgroundColor: selectedMoods.includes(mood.id) ? mood.color + '30' : '#f0f0f0' }
                      ]}>
                        <Ionicons 
                          name={mood.icon as any} 
                          size={24} 
                          color={selectedMoods.includes(mood.id) ? mood.color : '#666'} 
                        />
                      </View>
                      <Text style={[
                        styles.moodLabel,
                        selectedMoods.includes(mood.id) && { color: mood.color }
                      ]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Physical Sensations</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe any physical sensations you experienced (racing heart, sweaty palms, tension, etc.)"
                  placeholderTextColor="#999"
                  value={physicalSensations}
                  onChangeText={setPhysicalSensations}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Anxiety Level ({anxietyLevel}/10)</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderMinLabel}>Low</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={anxietyLevel}
                    onValueChange={setAnxietyLevel}
                    minimumTrackTintColor="#4A62FF"
                    maximumTrackTintColor="#e0e0e0"
                    thumbTintColor="#4A62FF"
                    disabled={isLoading}
                  />
                  <Text style={styles.sliderMaxLabel}>High</Text>
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confidence Level ({confidenceLevel}/10)</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderMinLabel}>Low</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={confidenceLevel}
                    onValueChange={setConfidenceLevel}
                    minimumTrackTintColor="#4A62FF"
                    maximumTrackTintColor="#e0e0e0"
                    thumbTintColor="#4A62FF"
                    disabled={isLoading}
                  />
                  <Text style={styles.sliderMaxLabel}>High</Text>
                </View>
              </View>
            </View>
          )}
          
          {currentSection === 'thoughts' && (
            <View style={styles.sectionContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Thoughts</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="What thoughts went through your mind?"
                  placeholderTextColor="#999"
                  value={thoughts}
                  onChangeText={setThoughts}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Actions</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="What did you do in response to the situation?"
                  placeholderTextColor="#999"
                  value={actions}
                  onChangeText={setActions}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Outcome</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="What was the outcome of the situation? (You can update this later)"
                  placeholderTextColor="#999"
                  value={outcome}
                  onChangeText={setOutcome}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Reflection</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Reflect on what you learned from this experience (You can update this later)"
                  placeholderTextColor="#999"
                  value={reflection}
                  onChangeText={setReflection}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
            </View>
          )}
          
          {currentSection === 'advanced' && (
            <View style={styles.sectionContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Performance Focus Area</Text>
                <View style={styles.tagContainer}>
                  {focusAreaOptions.map((area) => (
                    <TouchableOpacity
                      key={area.id}
                      style={[
                        styles.tagItem, 
                        selectedFocusArea === area.id && styles.tagItemSelected
                      ]}
                      onPress={() => setSelectedFocusArea(area.id)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.tagText,
                        selectedFocusArea === area.id && styles.tagTextSelected
                      ]}>
                        {area.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Coping Strategies</Text>
                <Text style={styles.fieldHelp}>
                  Select the strategies you used or plan to use:
                </Text>
                <View style={styles.tagContainer}>
                  {availableCopingStrategies.map((strategy) => (
                    <TouchableOpacity
                      key={strategy}
                      style={[
                        styles.tagItem, 
                        selectedCopingStrategies.includes(strategy) && styles.tagItemSelected
                      ]}
                      onPress={() => toggleCopingStrategy(strategy)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.tagText,
                        selectedCopingStrategies.includes(strategy) && styles.tagTextSelected
                      ]}>
                        {strategy}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Techniques Used</Text>
                <Text style={styles.fieldHelp}>
                  Select the techniques you applied or plan to apply:
                </Text>
                <View style={styles.tagContainer}>
                  {availableTechniques.map((technique) => (
                    <TouchableOpacity
                      key={technique}
                      style={[
                        styles.tagItem, 
                        selectedTechniques.includes(technique) && styles.tagItemSelected
                      ]}
                      onPress={() => toggleTechnique(technique)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.tagText,
                        selectedTechniques.includes(technique) && styles.tagTextSelected
                      ]}>
                        {technique}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Privacy</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Keep this entry private</Text>
                  <Switch 
                    value={isPrivate} 
                    onValueChange={setIsPrivate}
                    trackColor={{ false: '#e0e0e0', true: '#4A62FF30' }}
                    thumbColor={isPrivate ? '#4A62FF' : '#f4f3f4'}
                    disabled={isLoading}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewJournalEntryScreen;
