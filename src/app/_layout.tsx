import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from '../context/AppContext'; // 1. Importou o provedor

export default function TabLayout() {
  return (
    <AppProvider> 
      <Tabs screenOptions={{ tabBarActiveTintColor: '#26b845' }}>
        
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }} 
        />
        
        <Tabs.Screen 
          name="greenhouse" 
          options={{ 
            title: 'Estufa',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
          }} 
        />
        
        <Tabs.Screen 
          name="agenda" 
          options={{ 
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkbox-outline" size={size} color={color} />
            ),
          }} 
        />
        
      </Tabs>
    </AppProvider>
  );
}