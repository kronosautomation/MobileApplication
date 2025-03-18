import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { fileService, FileType } from '../../services/storage';
import meditationService from '../../services/meditationService';
import { GuidedMeditation } from '../../types';

interface DownloadManagerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Component for managing downloaded content
 */
const DownloadManager: React.FC<DownloadManagerProps> = ({ visible, onClose }) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  
  const [downloadedMeditations, setDownloadedMeditations] = useState<GuidedMeditation[]>([]);
  const [storageUsage, setStorageUsage] = useState({
    totalSize: 0,
    usedPercentage: 0,
    limit: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Load downloaded meditations and storage usage
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get downloaded meditations
      const meditations = await meditationService.getDownloadedMeditations();
      setDownloadedMeditations(meditations);
      
      // Get storage usage
      const usage = fileService.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error loading download manager data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Remove a downloaded meditation
  const handleRemoveDownload = async (meditation: GuidedMeditation) => {
    try {
      await meditationService.removeMeditationDownload(meditation);
      // Refresh the data
      loadData();
    } catch (error) {
      console.error(`Error removing download for meditation ${meditation.id}:`, error);
    }
  };
  
  // Clear all downloads
  const handleClearAllDownloads = async () => {
    try {
      // Remove all downloaded meditations from DB
      for (const meditation of downloadedMeditations) {
        await meditationService.removeMeditationDownload(meditation);
      }
      
      // Refresh data
      loadData();
    } catch (error) {
      console.error('Error clearing all downloads:', error);
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background.default }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close download manager"
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Downloaded Content
          </Text>
        </View>
        
        {/* Storage usage */}
        <View style={[styles.storageContainer, { backgroundColor: colors.background.paper }]}>
          <Text style={[styles.storageTitle, { color: colors.text.primary }]}>
            Storage Usage
          </Text>
          
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.primary.main, width: `${storageUsage.usedPercentage}%` }
              ]}
            />
          </View>
          
          <Text style={[styles.storageText, { color: colors.text.secondary }]}>
            {formatFileSize(storageUsage.totalSize)} used of {formatFileSize(storageUsage.limit)}
            {' '}({storageUsage.usedPercentage.toFixed(1)}%)
          </Text>
        </View>
        
        {/* Downloaded meditations list */}
        {downloadedMeditations.length > 0 ? (
          <>
            <FlatList
              data={downloadedMeditations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[styles.listItem, { backgroundColor: colors.background.paper }]}
                  accessible={true}
                  accessibilityLabel={`${item.title} by ${item.narrator}, ${item.durationInSeconds / 60} minutes, downloaded`}
                >
                  <View style={styles.listItemContent}>
                    <Text style={[styles.listItemTitle, { color: colors.text.primary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.listItemSubtitle, { color: colors.text.secondary }]}>
                      {item.narrator} • {Math.floor(item.durationInSeconds / 60)} min
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveDownload(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete downloaded meditation ${item.title}`}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error.main} />
                  </TouchableOpacity>
                </View>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.clearAllButton, { backgroundColor: colors.error.main }]}
                  onPress={handleClearAllDownloads}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all downloads"
                >
                  <Text style={[styles.clearAllText, { color: colors.error.contrast }]}>
                    Clear All Downloads
                  </Text>
                </TouchableOpacity>
              }
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cloud-download-outline"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No downloaded content
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
              Download meditations for offline use from the meditation details screen
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 40, // For status bar
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 16,
  },
  storageContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  storageTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  storageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginHorizontal: 32,
  },
  clearAllButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  clearAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});

export default DownloadManager;
