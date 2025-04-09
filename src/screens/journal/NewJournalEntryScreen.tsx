import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
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
import { journalService } from '../../api/journalService'; // Import the service
import { PerformanceJournal, PerformanceFocusArea } from '../../types'; // Import the types
import { useTheme } from '../../context/ThemeContext'; // Import theme context

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

// Common coping strategies
const copingStrategies = [
  'Deep breathing', 'Meditation', 'Visualization', 'Progressive muscle relaxation',
  'Positive self-talk', 'Journaling', 'Physical exercise', 'Talking to a friend',
  'Mindfulness', 'Grounding techniques'
];

// Common techniques
const techniques = [
  'Box breathing', 'Body scan', 'Thought challenging', 'Mindful observation',
  'Power posing', 'Visualization', 'Affirmations', 'Fear exposure', 
  'Performance rehearsal', 'Self-compassion'
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

const NewJournalEntryScreen = ({ route, navigation }: Props) => {
  const { existingJournalId } = route.params || {};
  const [isEditMode, setIsEditMode] = useState(!!existingJournalId);
  const { currentTheme, isDark } = useTheme(); // Get theme context
  const { colors } = currentTheme;
  // Basic info
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingJournal, setLoadingJournal] = useState(!!existingJournalId);
  
  // Emotion section
  const [selectedMood, setSelectedMood] = useState('');
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
  
  // Advanced fields
  const [selectedFocusArea, setSelectedFocusArea] = useState(null);
  const [selectedCopingStrategies, setSelectedCopingStrategies] = useState<string[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);
  
  // Event related fields
  const [showEventFields, setShowEventFields] = useState(false);
  const [eventName, setEventName] = useState('');
  
  // UI state
  const [currentSection, setCurrentSection] = useState('basic'); // 'basic', 'emotions', 'thoughts', 'advanced'
  
  // Load existing journal if in edit mode
  useEffect(() => {
    if (existingJournalId) {
      loadExistingJournal();
    }
  }, [existingJournalId]);
  
  // Load existing journal from the API
  const loadExistingJournal = async () => {
    setLoadingJournal(true);
    try {
      const journal = await journalService.getJournalById(existingJournalId);
      console.log('Loaded journal for editing:', journal);
      
      // Populate form fields with existing data
      setTitle(journal.title || '');
      if (journal.date) setDate(new Date(journal.date));
      setSituation(journal.situation || '');
      setThoughts(journal.thoughts || '');
      setPhysicalSensations(journal.physicalSensations || '');
      setActions(journal.actions || '');
      setOutcome(journal.outcome || '');
      setReflection(journal.reflection || '');
      setAnxietyLevel(journal.anxietyLevel || 5);
      setConfidenceLevel(journal.confidenceLevel || 5);
      setSelectedFocusArea(journal.performanceFocusArea);
      setIsPrivate(journal.isPrivate !== false); // Default to private
      
      // Handle arrays
      if (journal.emotions && journal.emotions.length > 0) {
        setSelectedMood(journal.emotions[0].toLowerCase());
      }
      
      if (journal.techniquesUsed && journal.techniquesUsed.length > 0) {
        setSelectedTechniques(journal.techniquesUsed);
      }
      
      if (journal.copingStrategies && journal.copingStrategies.length > 0) {
        setSelectedCopingStrategies(journal.copingStrategies);
      }
      
      // Handle event
      if (journal.event) {
        setShowEventFields(true);
        setEventName(journal.event);
      }
      
    } catch (error) {
      console.error('Error loading journal for editing:', error);
      Alert.alert('Error', 'Failed to load journal entry for editing');
    } finally {
      setLoadingJournal(false);
    }
  };
  
  // Format displayed date
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  
  // Add a prompt to content fields
  const addPrompt = (prompt: string) => {
    // Determine which field to add the prompt to based on the current section
    if (currentSection === 'emotions') {
      setPhysicalSensations((current: string) => current + (current ? '\n\n' : '') + prompt + '\n');
    } else if (currentSection === 'thoughts') {
      setThoughts((current: string) => current + (current ? '\n\n' : '') + prompt + '\n');
    } else {
      setSituation((current: string) => current + (current ? '\n\n' : '') + prompt + '\n');
    }
    setShowPrompts(false);
  };
  
  // Toggle selection of a coping strategy
  const toggleCopingStrategy = (strategy: string) => {
    if (selectedCopingStrategies.includes(strategy)) {
      setSelectedCopingStrategies((prev: string[]) => prev.filter((s: string) => s !== strategy));
    } else {
      setSelectedCopingStrategies((prev: string[]) => [...prev, strategy]);
    }
  };
  
  // Toggle selection of a technique
  const toggleTechnique = (technique: string) => {
    if (selectedTechniques.includes(technique)) {
      setSelectedTechniques((prev: string[]) => prev.filter((t: string) => t !== technique));
    } else {
      setSelectedTechniques((prev: string[]) => [...prev, technique]);
    }
  };
  
  // Save the journal entry
  const saveEntry = async () => {
    if (!title.trim() || isLoading) {
      return;
    }
    
    setIsLoading(true);
    
    const journalData: Partial<PerformanceJournal> = {
      title: title.trim() || 'Untitled Journal',
      date: new Date().toISOString(),
      anxietyLevel,
      confidenceLevel,
      performanceFocusArea: selectedFocusArea, // Always provide a valid value
      emotions: selectedMood ? [selectedMood] : [],
      techniquesUsed: selectedTechniques,
      isPrivate,
      event: showEventFields ? eventName.trim() : undefined,
      situation: situation.trim() || undefined,
      thoughts: thoughts.trim() || undefined,
      physicalSensations: physicalSensations.trim() || undefined,
      actions: actions.trim() || undefined,
      outcome: outcome.trim() || undefined,
      reflection: reflection.trim() || undefined,
      copingStrategies: selectedCopingStrategies,
    };

    try {
      if (isEditMode) {
        // Update existing journal entry
        await journalService.updateJournal(existingJournalId, journalData);
        // Return directly to detail page with refreshed data
        navigation.navigate('JournalDetail', { journalId: existingJournalId, refresh: Date.now() });
      } else {
        // Create new journal entry
        await journalService.createJournal(journalData as Omit<PerformanceJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
        Alert.alert(
          "Success",
          "Journal entry saved successfully!",
          [{ text: "OK", onPress: () => navigation.navigate('JournalList') }]
        );
      }
    } catch (error: any) {
      console.error("Failed to save journal entry:", error);
      Alert.alert("Error", "Could not save journal entry.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.header, { backgroundColor: colors.background.paper, borderBottomColor: colors.neutral.lighter }]}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color={isLoading ? colors.text.disabled : colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{isEditMode ? 'Edit Journal Entry' : 'New Journal Entry'}</Text>
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
        
        <View style={[styles.tabBar, { backgroundColor: colors.background.paper, borderBottomColor: colors.neutral.lighter }]}>
          <TouchableOpacity 
            style={[styles.tab, currentSection === 'basic' && styles.activeTab]}
            onPress={() => setCurrentSection('basic')}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={18} 
              color={currentSection === 'basic' ? colors.primary.main : colors.text.secondary} 
            />
            <Text style={[styles.tabText, { color: currentSection === 'basic' ? colors.primary.main : colors.text.secondary }]}>
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
              color={currentSection === 'emotions' ? colors.primary.main : colors.text.secondary} 
            />
            <Text style={[styles.tabText, { color: currentSection === 'emotions' ? colors.primary.main : colors.text.secondary }]}>
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
              color={currentSection === 'thoughts' ? colors.primary.main : colors.text.secondary} 
            />
            <Text style={[styles.tabText, { color: currentSection === 'thoughts' ? colors.primary.main : colors.text.secondary }]}>
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
              color={currentSection === 'advanced' ? colors.primary.main : colors.text.secondary} 
            />
            <Text style={[styles.tabText, { color: currentSection === 'advanced' ? colors.primary.main : colors.text.secondary }]}>
              Advanced
            </Text>
          </TouchableOpacity>
        </View>
        
        {loadingJournal ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading journal entry...</Text>
          </View>
        ) : (
          <ScrollView style={styles.formContainer}>
          {currentSection === 'basic' && (
            <View style={styles.sectionContainer}>
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Date</Text>
                <Text style={[styles.dateText, { color: colors.text.primary }]}>{formattedDate}</Text>
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Title *</Text>
                <TextInput
                  style={[styles.titleInput, { 
                    backgroundColor: colors.background.paper, 
                    borderColor: colors.neutral.lighter,
                    color: colors.text.primary
                  }]}
                  placeholder="Give your entry a title..."
                  placeholderTextColor={colors.text.disabled}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  editable={!isLoading}
                />
              </View>
              
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Situation</Text>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: colors.background.paper, 
                    borderColor: colors.neutral.lighter,
                    color: colors.text.primary 
                  }]}
                  placeholder="Describe the performance situation you experienced or are anticipating..."
                  placeholderTextColor={colors.text.disabled}
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
                  <Text style={[styles.fieldLabel, { color: colors.text.primary }]}>Event Information</Text>
                  <TouchableOpacity
                    onPress={() => setShowPrompts(!showPrompts)}
                    style={styles.helpButton}
                  >
                    <Ionicons name="help-circle-outline" size={20} color={colors.primary.main} />
                  </TouchableOpacity>
                </View>
                {showPrompts && (
                  <View style={[styles.promptsContainer, { 
                    backgroundColor: colors.background.paper, 
                    borderColor: colors.neutral.lighter 
                  }]}>
                    {journalPrompts.map((prompt, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[styles.promptItem, { borderBottomColor: colors.neutral.lighter }]}
                        onPress={() => !isLoading && addPrompt(prompt)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.promptText, { color: colors.text.secondary }]}>{prompt}</Text>
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
                        selectedMood === mood.id && { backgroundColor: mood.color + '20' }
                      ]}
                      onPress={() => !isLoading && setSelectedMood(mood.id)}
                      disabled={isLoading}
                    >
                      <View style={[
                        styles.moodIcon,
                        { backgroundColor: selectedMood === mood.id ? mood.color + '30' : '#f0f0f0' }
                      ]}>
                        <Ionicons 
                          name={mood.icon as any} 
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
                <View style={styles.focusAreaContainer}>
                  {focusAreaOptions.map(area => (
                    <TouchableOpacity
                      key={area.id}
                      style={[
                        styles.focusAreaOption,
                        selectedFocusArea === area.id && styles.focusAreaSelected
                      ]}
                      onPress={() => setSelectedFocusArea(area.id)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.focusAreaOptionText,
                        selectedFocusArea === area.id && styles.focusAreaSelectedText
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
                <View style={styles.tagsContainer}>
                  {copingStrategies.map(strategy => (
                    <TouchableOpacity
                      key={strategy}
                      style={[
                        styles.tagOption,
                        selectedCopingStrategies.includes(strategy) && styles.tagSelected
                      ]}
                      onPress={() => toggleCopingStrategy(strategy)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.tagOptionText,
                        selectedCopingStrategies.includes(strategy) && styles.tagSelectedText
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
                <View style={styles.tagsContainer}>
                  {techniques.map(technique => (
                    <TouchableOpacity
                      key={technique}
                      style={[
                        styles.tagOption,
                        selectedTechniques.includes(technique) && styles.tagSelected
                      ]}
                      onPress={() => toggleTechnique(technique)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.tagOptionText,
                        selectedTechniques.includes(technique) && styles.tagSelectedText
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#4A62FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#c0c0c0',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: '#e0e0e0',
  },
  
  // Tab Navigation
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A62FF',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
  },
  activeTabText: {
    color: '#4A62FF',
    fontWeight: '500',
  },
  
  // Content Areas
  formContainer: {
    flex: 1,
    padding: 15,
  },
  sectionContainer: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  fieldHelp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  fieldSubLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  helpButton: {
    padding: 4,
  },
  
  // Date Selector
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Input fields
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
  },
  
  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  
  // Mood Selection
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  moodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Sliders
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#888',
    width: 30,
    textAlign: 'center',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#888',
    width: 30,
    textAlign: 'center',
  },
  
  // Focus Area Selection
  focusAreaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusAreaOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  focusAreaSelected: {
    backgroundColor: '#4A62FF',
    borderColor: '#4A62FF',
  },
  focusAreaOptionText: {
    fontSize: 14,
    color: '#666',
  },
  focusAreaSelectedText: {
    color: 'white',
    fontWeight: '500',
  },
  
  // Tags (Coping Strategies & Techniques)
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: '#4A62FF20',
    borderColor: '#4A62FF',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#666',
  },
  tagSelectedText: {
    color: '#4A62FF',
  },
  
  // Prompts
  promptsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    padding: 8,
  },
  promptItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  promptText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default NewJournalEntryScreen;