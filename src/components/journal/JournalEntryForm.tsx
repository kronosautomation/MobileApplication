import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text, TextInput, Button } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import { PerformanceJournal, PerformanceFocusArea } from '../../types';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface JournalEntryFormProps {
  initialValues?: Partial<PerformanceJournal>;
  onSubmit: (journalEntry: Partial<PerformanceJournal>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Common emotions for selection
const EMOTIONS = [
  'Anxious', 'Nervous', 'Worried', 'Stressed', 'Frustrated',
  'Excited', 'Confident', 'Optimistic', 'Calm', 'Focused', 
  'Distracted', 'Overwhelmed', 'Afraid', 'Embarrassed', 'Disappointed'
];

// Common triggers for selection
const TRIGGERS = [
  'Time pressure', 'Being evaluated', 'Large audience', 'Lack of preparation',
  'Past failure', 'High expectations', 'Unfamiliar environment', 'Important person present',
  'Competition', 'Health concerns', 'Physical discomfort', 'Negative thoughts'
];

// Common coping strategies for selection
const COPING_STRATEGIES = [
  'Deep breathing', 'Meditation', 'Positive self-talk', 'Visualization',
  'Progressive muscle relaxation', 'Preparation and practice', 'Journaling',
  'Exercise', 'Music', 'Support from others', 'Acceptance', 'Focus on process'
];

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;
  
  // Form state
  const [title, setTitle] = useState(initialValues?.title || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [anxietyLevel, setAnxietyLevel] = useState(initialValues?.anxietyLevel || 5);
  const [focusArea, setFocusArea] = useState<PerformanceFocusArea>(
    initialValues?.performanceFocusArea !== undefined
      ? initialValues.performanceFocusArea
      : PerformanceFocusArea.PublicSpeaking
  );
  const [event, setEvent] = useState(initialValues?.event || '');
  const [eventDate, setEventDate] = useState(
    initialValues?.eventDate ? new Date(initialValues.eventDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [emotions, setEmotions] = useState<string[]>(initialValues?.emotions || []);
  const [triggers, setTriggers] = useState<string[]>(initialValues?.triggers || []);
  const [strategies, setStrategies] = useState<string[]>(initialValues?.copingStrategies || []);
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate !== undefined ? initialValues.isPrivate : true);
  
  // Validation state
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  
  // Reset form errors when inputs change
  useEffect(() => {
    if (title) setTitleError('');
    if (content) setContentError('');
  }, [title, content]);
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };
  
  // Toggle item selection in an array
  const toggleSelection = (item: string, array: string[], setArray: (items: string[]) => void) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };
  
  // Get label for focus area
  const getFocusAreaLabel = (area: PerformanceFocusArea): string => {
    switch (area) {
      case PerformanceFocusArea.PublicSpeaking:
        return 'Public Speaking';
      case PerformanceFocusArea.Sports:
        return 'Sports';
      case PerformanceFocusArea.SexualPerformance:
        return 'Sexual Performance';
      case PerformanceFocusArea.WorkPresentation:
        return 'Work Presentation';
      case PerformanceFocusArea.SocialAnxiety:
        return 'Social Anxiety';
      case PerformanceFocusArea.TestTaking:
        return 'Test Taking';
      case PerformanceFocusArea.JobInterview:
        return 'Job Interview';
      case PerformanceFocusArea.Other:
        return 'Other';
      default:
        return 'Public Speaking';
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    }
    
    if (!content.trim()) {
      setContentError('Content is required');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const journalEntry: Partial<PerformanceJournal> = {
      title,
      content,
      anxietyLevel,
      performanceFocusArea: focusArea,
      event,
      eventDate: eventDate.toISOString(),
      emotions,
      triggers,
      copingStrategies: strategies,
      isPrivate,
      ...(initialValues?.id ? { id: initialValues.id } : {})
    };
    
    await onSubmit(journalEntry);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Give your journal entry a title"
          error={titleError}
          maxLength={100}
        />
        
        {/* Anxiety Level Slider */}
        <View style={styles.sliderContainer}>
          <Text variant="body" style={styles.label}>
            Anxiety Level: {anxietyLevel}
          </Text>
          <View style={styles.sliderRow}>
            <Text variant="body2" color="secondary">Low</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={anxietyLevel}
              onValueChange={setAnxietyLevel}
              minimumTrackTintColor={colors.primary.main}
              maximumTrackTintColor={colors.neutral.lighter}
              thumbTintColor={colors.primary.main}
            />
            <Text variant="body2" color="secondary">High</Text>
          </View>
        </View>
        
        {/* Focus Area Dropdown */}
        <View style={styles.fieldContainer}>
          <Text variant="body" style={styles.label}>
            Performance Focus Area
          </Text>
          <View style={styles.dropdownContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.focusAreaScroll}
            >
              {Object.values(PerformanceFocusArea)
                .filter(value => typeof value === 'number')
                .map((area: number) => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.focusAreaItem,
                      focusArea === area && styles.focusAreaSelected,
                      { borderColor: colors.primary.main }
                    ]}
                    onPress={() => setFocusArea(area as PerformanceFocusArea)}
                  >
                    <Text
                      variant="body2"
                      color={focusArea === area ? 'primary' : 'secondary'}
                    >
                      {getFocusAreaLabel(area as PerformanceFocusArea)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
        
        {/* Event Details */}
        <TextInput
          label="Event (Optional)"
          value={event}
          onChangeText={setEvent}
          placeholder="What event are you preparing for or reflecting on?"
        />
        
        {/* Event Date */}
        <View style={styles.fieldContainer}>
          <Text variant="body" style={styles.label}>
            Event Date (Optional)
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text variant="body">{format(eventDate, 'MMM dd, yyyy')}</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
        
        {/* Journal Content */}
        <TextInput
          label="Journal Entry"
          value={content}
          onChangeText={setContent}
          placeholder="Describe your thoughts, feelings, and experiences..."
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          style={styles.contentInput}
          error={contentError}
        />
        
        {/* Emotions */}
        <View style={styles.fieldContainer}>
          <Text variant="body" style={styles.label}>
            Emotions (Optional)
          </Text>
          <View style={styles.chipContainer}>
            {EMOTIONS.map(emotion => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.chip,
                  emotions.includes(emotion) ? 
                    { backgroundColor: colors.primary.main } : 
                    { backgroundColor: colors.background.paper, borderColor: colors.neutral.lighter }
                ]}
                onPress={() => toggleSelection(emotion, emotions, setEmotions)}
              >
                <Text
                  variant="body2"
                  color={emotions.includes(emotion) ? 'light' : 'secondary'}
                >
                  {emotion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Triggers */}
        <View style={styles.fieldContainer}>
          <Text variant="body" style={styles.label}>
            Triggers (Optional)
          </Text>
          <View style={styles.chipContainer}>
            {TRIGGERS.map(trigger => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.chip,
                  triggers.includes(trigger) ? 
                    { backgroundColor: colors.warning.main } : 
                    { backgroundColor: colors.background.paper, borderColor: colors.neutral.lighter }
                ]}
                onPress={() => toggleSelection(trigger, triggers, setTriggers)}
              >
                <Text
                  variant="body2"
                  color={triggers.includes(trigger) ? 'light' : 'secondary'}
                >
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Coping Strategies */}
        <View style={styles.fieldContainer}>
          <Text variant="body" style={styles.label}>
            Coping Strategies (Optional)
          </Text>
          <View style={styles.chipContainer}>
            {COPING_STRATEGIES.map(strategy => (
              <TouchableOpacity
                key={strategy}
                style={[
                  styles.chip,
                  strategies.includes(strategy) ? 
                    { backgroundColor: colors.success.main } : 
                    { backgroundColor: colors.background.paper, borderColor: colors.neutral.lighter }
                ]}
                onPress={() => toggleSelection(strategy, strategies, setStrategies)}
              >
                <Text
                  variant="body2"
                  color={strategies.includes(strategy) ? 'light' : 'secondary'}
                >
                  {strategy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Privacy Toggle */}
        <View style={styles.privacyContainer}>
          <Text variant="body">Make this entry private</Text>
          <TouchableOpacity 
            style={styles.toggleContainer} 
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <View 
              style={[
                styles.toggleTrack, 
                { backgroundColor: isPrivate ? colors.primary.main : colors.neutral.light }
              ]}
            >
              <View 
                style={[
                  styles.toggleThumb, 
                  { 
                    backgroundColor: colors.background.paper,
                    transform: [{ translateX: isPrivate ? 20 : 0 }]
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Form Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
          />
          <Button
            title={initialValues?.id ? "Update" : "Save"}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  focusAreaScroll: {
    paddingRight: 16,
  },
  focusAreaItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  focusAreaSelected: {
    backgroundColor: 'rgba(74, 98, 255, 0.1)',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D6E0',
    borderRadius: 8,
  },
  contentInput: {
    height: 150,
    paddingTop: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  toggleContainer: {
    paddingVertical: 4,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 5,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default JournalEntryForm;
