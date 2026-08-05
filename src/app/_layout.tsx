import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from '../context/AppContext'; // 1. Importou o provedor

export default function TabLayout() {
  return (
    <AppProvider> 
      <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#26b845', //ícones do rodapé
        tabBarInactiveTintColor: '#9c978f', //ícones inativos do rodapé
        tabBarStyle: {
          backgroundColor: '#fce39e', //fundo do rodapé
          borderTopColor: '#e8e1d5', //linha que separa o rodapé
          elevation: 0, //tira a sombra do android
          shadowOpacity: 0, //tira a sombra do ios
        },
        headerStyle: {
          backgroundColor: '#f3dd94', //fundo do cabeçalho
          //elevation: 0, gostei mais com sombra
          //shadowOpacity: 0,
        },
        headerTintColor: '#4A3F35', //cor do título do cabeçalho
        headerTitleAlign: 'center', //centraliza o conteúdo
        }}>
        
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