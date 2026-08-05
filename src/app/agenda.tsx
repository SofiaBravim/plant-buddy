import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

export default function AgendaScreen(){

  const { user, activeAgenda, checkTask, addTask } = useApp(); //extraindo as informações que serão necessárias de AppProvider
  const [newTaskTitle, setNewTaskTitle] = useState(''); //"memória" local para armazenar o input do usuário antes do nome da tarefa ser atualizado
  const currentAgenda = user.agendas.find(agenda => agenda.id === activeAgenda); //encontra os dados da agenda atual
  
  function handleAddTask(){ //lida com a criação de uma tarefa
    if (newTaskTitle.trim().length > 0) { //vê se é um título válido, o trim tira os espaços para não permitir que o título sejam apenas espaços
      addTask(newTaskTitle);
      setNewTaskTitle(''); //limpa o campo de escrita depois de adicionar o nome
    }
  }

  if(!currentAgenda){ //caso o usuário não tenha nenhuma agenda ativa ou criada
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="leaf-outline" size={64} color="#33a033" />
        <Text style={styles.emptyText}>Nenhuma agenda selecionada.</Text>
        <Text style={styles.subText}>Crie uma na tela inicial para começar a cultivar!</Text>
      </View>
    );
  }
  return (
<KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}> //cabeçalho da agenda
        <Text style={styles.headerTitle}>{currentAgenda.name}</Text>
        <Text style={styles.headerSubtitle}>
          Cultivando: {currentAgenda.plant.name} ({currentAgenda.plant.species})
        </Text>
      </View>

      <FlatList //lista de tarefas
        data={currentAgenda.tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.taskCard, item.done && styles.taskCardDone]} 
            onPress={() => checkTask(currentAgenda.id, item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
              {item.done && <Ionicons name="checkmark" size={18} color="#FBF7E9" />}
            </View>
            <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Sua lista está vazia. Que tal adicionar uma nova tarefa?</Text>
        }
      />

      <View style={styles.inputContainer}> //criação de uma nova tarefa
        <TextInput
          style={styles.input}
          placeholder="O que vamos fazer hoje?"
          placeholderTextColor="#A89F91"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask} // Permite adicionar apertando "Enter" no teclado
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={24} color="#FBF7E9" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcecb5', // Amarelo pergaminho claro
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: '#42372d', // Marrom quente escuro
    fontWeight: 'bold',
    // fontFamily: colocar uma aqui
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#88af90', // Verde sálvia
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E1D5',
    elevation: 2, // Sombra suave no Android
    shadowColor: '#4A3F35', // Sombra suave no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taskCardDone: {
    backgroundColor: '#F4F1EA',
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#8DA399',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: '#8DA399',
  },
  taskTitle: {
    fontSize: 16,
    color: '#4A3F35',
    flex: 1,
  },
  taskTitleDone: {
    color: '#A89F91',
    textDecorationLine: 'line-through',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Evita cortar no iPhone
    backgroundColor: '#FBF7E9',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#4A3F35',
    borderWidth: 1,
    borderColor: '#E8E1D5',
    marginRight: 12,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8DA399',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#8DA399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 20,
    color: '#4A3F35',
    marginTop: 16,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    color: '#A89F91',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#A89F91',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 40,
  }
});