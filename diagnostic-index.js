import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import DiagnosticApp from './DiagnosticApp';

console.log('===== DIAGNOSTIC MODE =====');
console.log('Starting app in diagnostic mode');
console.log('===========================');

// Register the DiagnosticApp component
AppRegistry.registerComponent('main', () => DiagnosticApp);
registerRootComponent(DiagnosticApp);
