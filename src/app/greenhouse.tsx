import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Animated, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

// Mapeamento dos caminhos estáticos dos PNGs
const PLANT_IMAGES: Record<string, Record<number, any>> = {
  girassol: {
    0: require('../../assets/plants/sunflower/stage_0.png'),
    1: require('../../assets/plants/sunflower/stage_1g.png'),
    2: require('../../assets/plants/sunflower/stage_2g.png'),
    3: require('../../assets/plants/sunflower/stage_3g.png'),
  },
};

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

  // Animações
  const wateringAnimation = useRef(new Animated.Value(0)).current;
  const plantScale = useRef(new Animated.Value(1)).current;
  const previousStage = useRef(currentAgenda?.plant.stageNow || 0);

  // Cálculo de XP
  const progressPercentage = user.xp % 100; 
  const nextLevel = user.level + 1;

  // Separa e ordena vasos
  const sortedPots = [...POT_COLORS].sort((a, b) => {
    const aUnlocked = user.level >= a.unlockLevel;
    const bUnlocked = user.level >= b.unlockLevel;
    if (aUnlocked === bUnlocked) return a.unlockLevel - b.unlockLevel;
    return aUnlocked ? -1 : 1;
  });

  const currentPotHex = POT_COLORS.find(p => p.id === selectedPot)?.hex || '#d9c5b2';

  // Animação de regar
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

  // Busca a imagem de acordo com a espécie e estágio atual
  const speciesKey = currentAgenda.plant.species.toLowerCase();
  const currentStage = currentAgenda.plant.stageNow ?? 0;
  const plantImageSource = PLANT_IMAGES[speciesKey]?.[currentStage];

  return (
    <View style={styles.container}>
      
      {/* TOPO: Botão Trocar Planta + Barra de XP */}
      <View style={styles.topBar}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.circleButton} onPress={() => setPlantModalVisible(true)}>
            <Ionicons name="storefront-outline" size={24} color="#683607" />
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

      {/* ÁREA CENTRAL: Exibição da Imagem da Planta + Vaso */}
      <View style={styles.plantDisplayArea}>
        
        {/* Regador Animado */}
        <Animated.View style={[
          styles.wateringCanContainer, 
          { 
            opacity: wateringAnimation,
            transform: [{ rotate: wateringRotate }]
          }
        ]}>
          <Ionicons name="water-outline" size={70} color="#7acadf" />
        </Animated.View>

        {/* Container Ilustração + Vaso */}
        <Animated.View style={[styles.plantWrapper, { transform: [{ scale: plantScale }] }]}>
          
          <View style={styles.plantImageContainer}>
            {plantImageSource ? (
              <Image 
                source={plantImageSource} 
                style={styles.plantImage} 
                resizeMode="contain" 
              />
            ) : (
              <Ionicons name="leaf" size={180} color="#4b974b" />
            )}
          </View>
          
          {/* Vaso */}
          <View style={styles.potWrapper}>
            <View style={[styles.potRim, { backgroundColor: currentPotHex }]} />
            <View style={[styles.potBody, { backgroundColor: currentPotHex }]} />
          </View>

        </Animated.View>
      </View>

      {/* RODAPÉ: Botão Trocar Cor + Nome da Planta */}
      <View style={styles.bottomBar}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.circleButton} onPress={() => setPotModalVisible(true)}>
            <Ionicons name="color-palette-outline" size={24} color="#683607" />
          </TouchableOpacity>
          <Text style={styles.buttonSubtext}>Trocar Cor</Text>
        </View>

        <View style={styles.plantInfoContainer}>
          <Text style={styles.plantName}>{currentAgenda.plant.name}</Text>
          <Text style={styles.plantSpecies}>{currentAgenda.plant.species}</Text>
        </View>

        <View style={{ width: 48 }} />
      </View>

      {/* MODAL 1: Trocar Planta */}
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
                          <Ionicons name="lock-closed" size={22} color="#868686" />
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
    color: '#8d8982',
  },
  
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
    color: '#3b2510',
    marginTop: 4,
    fontWeight: '500',
  },

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
    backgroundColor: '#8abec2',
    borderRadius: 6,
  },

  plantDisplayArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  wateringCanContainer: {
    position: 'absolute',
    top: 20,
    right: 50,
    zIndex: 10,
  },
  plantWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: '85%',
  },
  plantImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },

  potWrapper: {
    alignItems: 'center',
    marginTop: -18,
  },
  potRim: {
    width: 130,
    height: 20,
    borderRadius: 10,
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
    width: 110,
    height: 90,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginTop: -3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  plantInfoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A3F35',
    textAlign: 'center',
  },
  plantSpecies: {
    fontSize: 15,
    color: '#7d8f87',
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
  },

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
    color: '#4a3f35',
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
    borderColor: '#8da399',
    backgroundColor: '#F4F1EA',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#4a3f35',
    textAlign: 'center',
  },
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
    color: '#797570',
    marginTop: 6,
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  closeModalText: {
    fontSize: 16,
    color: '#69655e',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});