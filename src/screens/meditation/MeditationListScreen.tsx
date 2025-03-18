import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useMeditations } from '../../hooks';
import { Ionicons } from '@expo/vector-icons';
import { GuidedMeditation, MeditationStackParamList } from '../../types';
import { ErrorDisplay, useAppError } from '../../components/common';

type MeditationListScreenNavigationProp = NativeStackNavigationProp<
  MeditationStackParamList,
  'MeditationList'
>;

const MeditationListScreen: React.FC = () => {
  const navigation = useNavigation<MeditationListScreenNavigationProp>();
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;
  const { showError } = useAppError();
  
  // Use the custom hook for meditation data
  const {
    meditations,
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    refreshMeditations
  } = useMeditations();
  
  // Track refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMeditations();
      showError('Meditations updated', 'success');
    } catch (err) {
      // Error is already handled in the hook
    } finally {
      setRefreshing(false);
    }
  }, [refreshMeditations, showError]);
  
  const handleMeditationPress = useCallback((meditation: GuidedMeditation) => {
    navigation.navigate('MeditationDetail', { meditationId: meditation.id });
  }, [navigation]);
  
  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  // Memoized meditation item component
  const MeditationItem = memo(({ item, onPress, formatDuration, colors }: { 
    item: GuidedMeditation, 
    onPress: (item: GuidedMeditation) => void,
    formatDuration: (seconds: number) => string,
    colors: any
  }) => {
    return (
      <TouchableOpacity
        style={[styles.meditationCard, { backgroundColor: colors.background.paper }]}
        onPress={() => onPress(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} meditation by ${item.narrator}, ${formatDuration(item.durationInSeconds)}, ${item.difficultyLevel === 0 ? 'Beginner' : item.difficultyLevel === 1 ? 'Intermediate' : 'Advanced'} level${item.minimumSubscriptionTier > 0 ? ', Premium content' : ''}`}
        accessibilityHint="Opens detailed view of this meditation"
      >
        <View style={styles.meditationInfo}>
          <Text style={[styles.meditationTitle, { color: colors.text.primary }]}>
            {item.title}
          </Text>
          
          <Text style={[styles.meditationNarrator, { color: colors.text.secondary }]}>
            by {item.narrator}
          </Text>
          
          <View style={styles.meditationMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                {formatDuration(item.durationInSeconds)}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="fitness-outline" size={16} color={colors.text.secondary} />
              <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                {item.difficultyLevel === 0 
                  ? 'Beginner' 
                  : item.difficultyLevel === 1 
                    ? 'Intermediate' 
                    : 'Advanced'}
              </Text>
            </View>
          </View>
          
          {item.minimumSubscriptionTier > 0 && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.primary.main }]}>
              <Text style={[styles.premiumText, { color: colors.primary.contrast }]}>
                PREMIUM
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.item.id === nextProps.item.id;
  });
  
  // Render a meditation item with memoization
  const renderMeditationItem = useCallback(({ item }: { item: GuidedMeditation }) => (
    <MeditationItem 
      item={item} 
      onPress={handleMeditationPress} 
      formatDuration={formatDuration}
      colors={colors}
    />
  ), [colors, handleMeditationPress]);
  
  // Memoized category item component
  const CategoryItem = memo(({ 
    item, 
    isSelected, 
    onSelect, 
    colors 
  }: { 
    item: string, 
    isSelected: boolean,
    onSelect: (category: string) => void,
    colors: any
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        isSelected
          ? { backgroundColor: colors.primary.main } 
          : { backgroundColor: colors.background.paper, borderColor: colors.neutral.lighter, borderWidth: 1 }
      ]}
      onPress={() => onSelect(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${item} category`}
      accessibilityState={{ selected: isSelected }}
      accessibilityHint="Filters meditation list to show only this category"
    >
      <Text
        style={[
          styles.categoryText,
          { color: isSelected ? colors.primary.contrast : colors.text.secondary }
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ));

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    if (category !== 'All') {
      showError(`Showing ${category} meditations`, 'info');
    }
  }, [showError, setSelectedCategory]);
  
  // Render category filter buttons with memoization
  const renderCategoryItem = useCallback(({ item }: { item: string }) => (
    <CategoryItem 
      item={item} 
      isSelected={selectedCategory === item}
      onSelect={handleCategorySelect}
      colors={colors}
    />
  ), [selectedCategory, colors, handleCategorySelect]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={styles.header} accessibilityRole="header">
        <Text 
          style={[styles.headerTitle, { color: colors.text.primary }]}
          accessibilityRole="header"
        >
          Meditations
        </Text>
        
        <TouchableOpacity 
          style={styles.searchButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Search meditations"
          accessibilityHint="Opens search interface"
        >
          <Ionicons name="search-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          accessible={true}
          accessibilityLabel="Meditation categories"
          accessibilityHint="Horizontal list of meditation categories"
        />
      </View>
      
      {/* Error state */}
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={refreshMeditations}
          variant="inline"
        />
      )}
      
      {/* Meditation List */}
      {loading && !refreshing ? (
        <View 
          style={styles.loadingContainer}
          accessible={true}
          accessibilityLabel="Loading meditations"
          accessibilityState={{ busy: true }}
        >
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={meditations}
          renderItem={renderMeditationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.meditationsList}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityLabel={`Meditation list${selectedCategory && selectedCategory !== 'All' ? ` filtered by ${selectedCategory}` : ''}`}
          accessibilityHint="Scroll to browse available meditations"
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 116, // Height of each item + marginBottom
            offset: 116 * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
              title="Pull to refresh"
              titleColor={colors.text.secondary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 4,
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationsList: {
    padding: 16,
    paddingBottom: 80,
  },
  meditationCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  meditationInfo: {
    padding: 16,
  },
  meditationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meditationNarrator: {
    fontSize: 14,
    marginBottom: 12,
  },
  meditationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MeditationListScreen;