import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  
  // Tags (Coping Strategies & Techniques)
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  tagItemSelected: {
    backgroundColor: '#4A62FF20',
    borderColor: '#4A62FF',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextSelected: {
    color: '#4A62FF',
    fontWeight: '500',
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
});