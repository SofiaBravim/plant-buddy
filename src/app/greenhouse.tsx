import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

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
  const currentAgenda = user.agendas.find(a => a.id === activeAgenda); //encontra a agenda ativa

  //Estados da interface
  const [modalVisible, setModalVisible] = useState(false); 
  const [selectedPot, setSelectedPot] = useState(POT_COLORS[0].id);

  //Valores de animação
  const wateringAnimation = useRef(new Animated.Value(0)).current;
  const plantScale = useRef(new Animated.Value(1)).current;
  const previousStage = useRef(currentAgenda?.plant.stageNow || 0);

  //Cálculo da barra de XP: cada nível tem 100 xp, então o resto da divisão por 100  dá a exata % do nível atual
  const progressPercentage = user.xp % 100;
  const nextLevel = user.level + 1;
  
  //Separa e ordena as cores desbloqueadas e bloqueadas
  const sortedPots = [...POT_COLORS].sort((a, b) => {
    const aUnlocked = user.level >= a.unlockLevel;
    const bUnlocked = user.level >= b.unlockLevel;
    if (aUnlocked === bUnlocked) return a.unlockLevel - b.unlockLevel;
    return aUnlocked ? -1 : 1;
  });

  //Crescimento da 
  useEffect(() => {
    if(currentAgenda && currentAgenda.plant.stageNow > previousStage.current) { //se a plata tiver crescido, roda a animação do regador e do crescimento
      Animated.sequence([
        //regador inclina
        Animated.timing(wateringAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        //planta dá um "pulinho" para representar o crescimento
        Animated.sequence([
          Animated.timing(plantScale, { toValue: 1.1, duration: 300, useNativeDriver: true}),
          Animated.timing(plantScale, { toValue: 1, duration: 300, useNativeDriver: true })
        ]),
        //regador some
        Animated.timing(wateringAnimation, { toValue: 0, duration: 500, useNativeDriver: true, })
      ]).start();

      previousStage.current = currentAgenda.plant.stageNow; //atualiza previousStage para o estágio atual
    }
  }, [currentAgenda?.plant.stageNow]);

  //se não tiver agenda mostra a tela vazia
  //colocar tipo uma janelinha por trás 
  if(!currentAgenda) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Sua estufa está vazia.</Text>
      </View>
    );
  }

  //giro do regador
  const wateringRotate = wateringAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg']
  });

  return(
    <View style={styles.container}>
      {/* Botão de trocar a agenda ativa + barra de XP */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.switchButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="storefront-outline" size={24} color="#4A3F35" />
        </TouchableOpacity>
        <View style={styles.xpContainer}>
          <Text style={styles.levelText}>{user.level}</Text>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${progressPercentage}%` }]}/>
          </View>
          <Text style={styles.levelText}>{nextLevel}</Text>
        </View>
      </View>

      {/* Planta, Animação e Textos */}
      <View style={styles.plantDisplayArea}>
        {/*Regador fica invísel até a animação rodar */}
        <Animated.View style={[
          styles.wateringCanContainer, { opacity: wateringAnimation, transform: [{ rotate: wateringRotate}]
        }
        ]}>
          <Ionicons name="water-outline" size={40} color="#7BA0C0" />
        </Animated.View>

        {/*Representação da Planta (Placeholder visual, mudar após colocar as imagens PNG */}
        <Animated.View style={[styles.plantContainer, { transform: [{ scale: plantScale }] }]}>
          <Ionicons name="leaf" size={100} color="#8DA399" />
          {/* O vaso, a cor muda dependendo do que estiver selecionado */}
          <View style={[ styles.pot, { backgroundColor: POT_COLORS.find(p => p.id === selectedPot)?.hex }
          ]} />
        </Animated.View>

        <Text style={styles.plantName}>{currentAgenda.plant.name}</Text>
        <Text style={styles.plantSpecies}>{currentAgenda.plant.species}</Text>
      </View>

      {/*Lista de Cores dos Vasos no Rodapé */}
      <View style={styles.potsSection}>
        <Text style={styles.potsTitle}>Vasos Disponíveis</Text>
        <FlatList
        data={sortedPots}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUnlocked = user.level >= item.unlockLevel;
          const isSelected = selectedPot === item.id;

          return(
            <TouchableOpacity
            style={[
              styles.potOption,
              !isUnlocked && styles.potOptionLocked,
              isSelected && styles.potOptionSelected
            ]}
            onPress={() => isUnlocked && setSelectedPot(item.id)}
            activeOpacity={isUnlocked ? 0.7 : 1}
            >
              <View style={[styles.potColorPreview, { backgroundColor: item.hex }]}>
                {!isUnlocked && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={24} color="#A89F91" />
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
      </View>
      {/*Trocar de Agenda Ativa */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha uma Planta!</Text>
            {user.agendas.map(agenda => (
              <TouchableOpacity
              key={agenda.id}
              style={[styles.modalOption, activeAgenda === agenda.id && styles.modalOptionActive]}
              onPress={() => {
                setActiveAgendaId(agenda.id);
                setModalVisible(false);
              }}
              >
                <Text style={styles.modalOptionText}>{agenda.plant.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalText}>Cancelar</Text>
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
  
  /* Cabeçalho */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  switchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E1D5',
    marginRight: 16,
  },
  xpContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#8DA399', // O "líquido" verde
    borderRadius: 6,
  },

  /* Área da Planta */
  plantDisplayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wateringCanContainer: {
    position: 'absolute',
    top: 20,
    right: 80,
    zIndex: 10,
  },
  plantContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pot: {
    width: 80,
    height: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -10, // Sobe um pouco para grudar na folha
  },
  plantName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A3F35',
  },
  plantSpecies: {
    fontSize: 18,
    color: '#8DA399',
    fontStyle: 'italic',
    marginTop: 4,
  },

  /* Lista de Vasos */
  potsSection: {
    height: 250,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8E1D5',
    borderBottomWidth: 0,
  },
  potsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 16,
    textAlign: 'center',
  },
  potOption: {
    flex: 1,
    alignItems: 'center',
    margin: 8,
  },
  potOptionSelected: {
    transform: [{ scale: 1.1 }], // Dá um leve destaque ao vaso selecionado
  },
  potOptionLocked: {
    opacity: 0.5, // Fica opaco se estiver bloqueado
  },
  potColorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 12,
    color: '#A89F91',
    marginTop: 8,
  },

  /* Modal de Troca */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 63, 53, 0.5)', // Fundo escuro transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FBF7E9',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3F35',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
  closeModalButton: {
    marginTop: 16,
    padding: 16,
  },
  closeModalText: {
    fontSize: 16,
    color: '#A89F91',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});