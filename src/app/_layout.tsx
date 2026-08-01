import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Importa a biblioteca de ícones

export default function TabLayout() {
  return (
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
  );
}