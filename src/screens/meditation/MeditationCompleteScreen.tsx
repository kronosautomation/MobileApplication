import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MeditationStackParamList, MeditationSession } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api';
import { SafeAreaView } from 'react-native-safe-area-context';

type MeditationCompleteRouteProp = RouteProp<MeditationStackParamList, 'MeditationComplete'>;
type MeditationCompleteNavigationProp = NativeStackNavigationProp<MeditationStackParamList, 'MeditationComplete'>;

const MeditationCompleteScreen: React.FC = () => {
  const route = useRoute<MeditationCompleteRouteProp>();
  const navigation = useNavigation<MeditationCompleteNavigationProp>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  
  const { sessionId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [anxietyAfter, setAnxietyAfter] = useState<number | null>(null);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Available techniques that can be selected
  const availableTechniques = [
    'Deep breathing',
    'Body scan',
    'Visualization',
    'Progressive relaxation',
    'Mindful awareness',
    'Counting breaths',
    'Loving-kindness',
  ];
  
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // In a real app, you would fetch session details
        // For demo, create a mock session
        const mockSession: MeditationSession = {
          id: sessionId,
          userId: 'user123',
          meditationId: 'med456',
          startTime: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          endTime: new Date().toISOString(),
          durationInSeconds: 600,
          status: 'Completed',
          anxietyBefore: 7,
          techniquesUsed: [],
          createdAt: new Date(Date.now() - 600000).toISOString(),
        };
        
        setSession(mockSession);
        
        // If session had a pre-anxiety rating, we should ask for post
        if (mockSession.anxietyBefore) {
          requestAnxietyAfter();
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        Alert.alert('Error', 'Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [sessionId]);
  
  const requestAnxietyAfter = () => {
    Alert.prompt(
      'Rate Your Anxiety Now',
      'On a scale of 1-10, how would you rate your anxiety level after this meditation?',
      [
        {
          text: 'Skip',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: (value) => {
            const anxietyValue = parseInt(value || '0');
            if (anxietyValue >= 1 && anxietyValue <= 10) {
              setAnxietyAfter(anxietyValue);
            }
          },
        },
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };
  
  const toggleTechnique = (technique: string) => {
    if (selectedTechniques.includes(technique)) {
      setSelectedTechniques(selectedTechniques.filter(t => t !== technique));
    } else {
      setSelectedTechniques([...selectedTechniques, technique]);
    }
  };
  
  const handleComplete = async () => {
    if (!session) return;
    
    setSubmitting(true);
    try {
      // In a real app, this would submit to the API
      await api.completeMeditationSession(
        session.id,
        anxietyAfter || undefined,
        selectedTechniques.length > 0 ? selectedTechniques : undefined,
        notes || undefined,
        undefined // moodAfter
      );
      
      // Calculate some stats to show
      const anxietyReduction = session.anxietyBefore && anxietyAfter 
        ? session.anxietyBefore - anxietyAfter 
        : null;
      
      Alert.alert(
        'Session Complete',
        anxietyReduction && anxietyReduction > 0 
          ? `Great job! You reduced your anxiety by ${anxietyReduction} points.` 
          : 'Great job completing your meditation!',
        [
          {
            text: 'Done',
            onPress: () => navigation.navigate('MeditationList'),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing session:', error);
      Alert.alert('Error', 'Failed to save your session data');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading session data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={60} color={colors.success.main} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Meditation Complete
          </Text>
          
          {session?.anxietyBefore && anxietyAfter && (
            <View style={styles.anxietyChangeContainer}>
              <Text style={[styles.anxietyLabel, { color: colors.text.secondary }]}>
                Anxiety Level:
              </Text>
              <View style={styles.anxietyValues}>
                <Text style={[styles.anxietyText, { color: colors.error.main }]}>
                  {session.anxietyBefore}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.text.secondary} />
                <Text style={[styles.anxietyText, { color: colors.success.main }]}>
                  {anxietyAfter}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Techniques Used */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Techniques Used
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
            Select the techniques you used during this meditation
          </Text>
          
          <View style={styles.techniquesGrid}>
            {availableTechniques.map((technique) => (
              <TouchableOpacity
                key={technique}
                style={[
                  styles.techniqueButton,
                  selectedTechniques.includes(technique)
                    ? { backgroundColor: colors.primary.main }
                    : { backgroundColor: isDark ? colors.background.paper : colors.background.light, borderColor: colors.neutral.light, borderWidth: 1 }
                ]}
                onPress={() => toggleTechnique(technique)}
              >
                <Text
                  style={[
                    styles.techniqueText,
                    { color: selectedTechniques.includes(technique) ? colors.primary.contrastText : colors.text.secondary }
                  ]}
                >
                  {technique}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Notes
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
            Add any thoughts or reflections (optional)
          </Text>
          
          <TextInput
            style={[
              styles.notesInput,
              { 
                backgroundColor: isDark ? colors.background.paper : colors.background.light,
                color: colors.text.primary,
                borderColor: colors.neutral.light
              }
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How do you feel after this meditation?"
            placeholderTextColor={colors.text.disabled}
            multiline={true}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.background.default }]}>
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.primary.main }]}
          onPress={handleComplete}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.primary.contrastText} />
          ) : (
            <>
              <Text style={[styles.completeButtonText, { color: colors.primary.contrastText }]}>
                Save & Complete
              </Text>
              <Ionicons name="checkmark" size={20} color={colors.primary.contrastText} />
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('MeditationList')}
          disabled={submitting}
        >
          <Text style={[styles.skipButtonText, { color: colors.text.secondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  anxietyChangeContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  anxietyLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  anxietyValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anxietyText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  techniquesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  techniqueButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  techniqueText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 120,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});

export default MeditationCompleteScreen;