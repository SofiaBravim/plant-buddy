import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

//criando protótipo de banco de dados pras cores do vaso

const POT_COLORS = [
  { id: '1', hex: '#774c3a', name: 'argila', unlockLevel: 1},
  { id: '2', hex: '#a5485f', name: 'rosé', unlockLevel: 2},
  { id: '3', hex: '#313f69', name: 'azul', unlockLevel: 3},
  { id: '4', hex: '#4b3a17', name: 'marrom', unlockLevel: 5},
  { id: '5', hex: '#49125a', name: 'roxo', unlockLevel: 10},
  { id: '6', hex: '#CB997E', name: 'Tijolo', unlockLevel: 15 }
]

export default function GreenhouseScreen() {
  const { user, activeAgenda, setActiveAgendaId } = useApp();
  const currentAgenda = user.agendas.find(a => a.id === activeAgenda);

  // Modais
  const [plantModalVisible, setPlantModalVisible] = useState(false);
  const [potModalVisible, setPotModalVisible] = useState(false);
  
  // Vaso Selecionado
  const [selectedPot, setSelectedPot] = useState(POT_COLORS[0].id);

  // Valores de Animação
  const wateringAnimation = useRef(new Animated.Value(0)).current;
  const plantScale = useRef(new Animated.Value(1)).current;
  const previousStage = useRef(currentAgenda?.plant.stageNow || 0);

  // Cálculo da Barra de XP
  const progressPercentage = user.xp % 100; 
  const nextLevel = user.level + 1;

  // Separa e ordena os vasos
  const sortedPots = [...POT_COLORS].sort((a, b) => {
    const aUnlocked = user.level >= a.unlockLevel;
    const bUnlocked = user.level >= b.unlockLevel;
    if (aUnlocked === bUnlocked) return a.unlockLevel - b.unlockLevel;
    return aUnlocked ? -1 : 1;
  });

  // Cor atual do vaso
  const currentPotHex = POT_COLORS.find(p => p.id === selectedPot)?.hex || '#D9C5B2';

  // Animação de crescimento (Regador)
  useEffect(() => {
    if (currentAgenda && currentAgenda.plant.stageNow > previousStage.current) {
      Animated.sequence([
        Animated.timing(wateringAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(plantScale, { toValue: 1.15, duration: 300, useNativeDriver: true }),
          Animated.timing(plantScale, { toValue: 1, duration: 300, useNativeDriver: true })
        ]),
        Animated.timing(wateringAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
      
      previousStage.current = currentAgenda.plant.stageNow;
    }
  }, [currentAgenda?.plant.stageNow]);

  if (!currentAgenda) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Sua estufa está vazia.</Text>
      </View>
    );
  }

  const wateringRotate = wateringAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'] 
  });

  return (
    <View style={styles.container}>
      
      {/* TOPO: Botão de Trocar Planta + Barra de XP */}
      <View style={styles.topBar}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.circleButton} onPress={() => setPlantModalVisible(true)}>
            <Ionicons name="storefront-outline" size={24} color="#4A3F35" />
          </TouchableOpacity>
          <Text style={styles.buttonSubtext}>Trocar Planta</Text>
        </View>

        <View style={styles.xpContainer}>
          <Text style={styles.levelText}>{user.level}</Text>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.levelText}>{nextLevel}</Text>
        </View>
      </View>

      {/* ÁREA CENTRAL: A Planta em Grande Destaque */}
      <View style={styles.plantDisplayArea}>
        
        {/* Regador Animado */}
        <Animated.View style={[
          styles.wateringCanContainer, 
          { 
            opacity: wateringAnimation,
            transform: [{ rotate: wateringRotate }]
          }
        ]}>
          <Ionicons name="water-outline" size={48} color="#7BA0C0" />
        </Animated.View>

        {/* Planta + Vaso Estilizado */}
        <Animated.View style={[styles.plantContainer, { transform: [{ scale: plantScale }] }]}>
          {/* Planta (Aumentada em destaque) */}
          <Ionicons name="leaf" size={150} color="#8DA399" />
          
          {/* Design Realista do Vaso (Aba + Corpo Tapered) */}
          <View style={styles.potWrapper}>
            <View style={[styles.potRim, { backgroundColor: currentPotHex }]} />
            <View style={[styles.potBody, { backgroundColor: currentPotHex }]} />
          </View>
        </Animated.View>

        <Text style={styles.plantName}>{currentAgenda.plant.name}</Text>
        <Text style={styles.plantSpecies}>{currentAgenda.plant.species}</Text>
      </View>

      {/* PARTE INFERIOR: Botão de Trocar Cor (Alinhado à esquerda no rodapé) */}
      <View style={styles.bottomBar}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.circleButton} onPress={() => setPotModalVisible(true)}>
            <Ionicons name="color-palette-outline" size={24} color="#4A3F35" />
          </TouchableOpacity>
          <Text style={styles.buttonSubtext}>Trocar Cor</Text>
        </View>
      </View>

      {/* MODAL 1: Trocar de Agenda/Planta */}
      <Modal visible={plantModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha uma Planta</Text>
            {user.agendas.map(agenda => (
              <TouchableOpacity 
                key={agenda.id} 
                style={[styles.modalOption, activeAgenda === agenda.id && styles.modalOptionActive]}
                onPress={() => {
                  setActiveAgendaId(agenda.id);
                  setPlantModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{agenda.plant.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setPlantModalVisible(false)}>
              <Text style={styles.closeModalText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Trocar Cor do Vaso */}
      <Modal visible={potModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <Text style={styles.modalTitle}>Vasos Disponíveis</Text>
            
            <FlatList
              data={sortedPots}
              keyExtractor={(item) => item.id}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isUnlocked = user.level >= item.unlockLevel;
                const isSelected = selectedPot === item.id;

                return (
                  <TouchableOpacity 
                    style={[
                      styles.potOption, 
                      !isUnlocked && styles.potOptionLocked,
                      isSelected && styles.potOptionSelected
                    ]}
                    onPress={() => {
                      if (isUnlocked) {
                        setSelectedPot(item.id);
                        setPotModalVisible(false);
                      }
                    }}
                    activeOpacity={isUnlocked ? 0.7 : 1}
                  >
                    <View style={[styles.potColorPreview, { backgroundColor: item.hex }]}>
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <Ionicons name="lock-closed" size={22} color="#A89F91" />
                        </View>
                      )}
                    </View>
                    {!isUnlocked && (
                      <Text style={styles.unlockText}>Nível {item.unlockLevel}</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setPotModalVisible(false)}>
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7E9',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#A89F91',
  },
  
  /* Botões e Texto Auxiliar */
  actionButtonContainer: {
    alignItems: 'center',
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D5',
    elevation: 2,
    shadowColor: '#4A3F35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonSubtext: {
    fontSize: 11,
    color: '#4A3F35',
    marginTop: 4,
    fontWeight: '500',
  },

  /* Topo (Barra de XP e Botão Superior) */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  xpContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3F35',
  },
  xpBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#E8E1D5',
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#8DA399',
    borderRadius: 6,
  },

  /* Área Central */
  plantDisplayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wateringCanContainer: {
    position: 'absolute',
    top: 20,
    right: 60,
    zIndex: 10,
  },
  plantContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  /* Design do Vaso Estilizado */
  potWrapper: {
    alignItems: 'center',
    marginTop: -16, // Encaixa com a base da planta
  },
  potRim: {
    width: 120,
    height: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    elevation: 3,
    shadowColor: '#4A3F35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    zIndex: 2,
  },
  potBody: {
    width: 102,
    height: 85,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: -3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },

  plantName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4A3F35',
  },
  plantSpecies: {
    fontSize: 18,
    color: '#8DA399',
    fontStyle: 'italic',
    marginTop: 4,
  },

  /* Parte Inferior (Trocar Cor) */
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'flex-start', // Alinha com o botão da estufa no topo esquerdo
  },

  /* Estilos dos Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 63, 53, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FBF7E9',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E1D5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1D5',
  },
  modalOptionActive: {
    borderColor: '#8DA399',
    backgroundColor: '#F4F1EA',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#4A3F35',
    textAlign: 'center',
  },
  
  /* Grid de Vasos no Modal */
  potOption: {
    flex: 1,
    alignItems: 'center',
    margin: 8,
  },
  potOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  potOptionLocked: {
    opacity: 0.5,
  },
  potColorPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E1D5',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 12,
    color: '#A89F91',
    marginTop: 6,
  },

  closeModalButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  closeModalText: {
    fontSize: 16,
    color: '#A89F91',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});