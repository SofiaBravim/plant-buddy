/*Context API é um pacote de dados centralizado, uma "memória central" do app. 
Utilizando 3 partes principais para compôr o Context API:
1 - O contexto (AppContext): o canal de transmissão
2 - O provedor (AppProvider): o "pai" que guarda as informações reais com useState e abrange o app inteiro
3 - O hook customizado (useApp): um atalho que puxa os dados em qualquer tela*/
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Agenda, Task } from '@/types';

//Interface de AppContext
interface AppContextData {
    user: User;
    activeAgenda: string; //a agenda associada 
    setActiveAgendaId: (id: string) => void;
    checkTask: (agendaID: string, taskID: string) => void;
    addAgenda: (name: string, frequency: 'diaria' | 'semanal', plantName: string, plantSpecies: string) => void; //talvez esse plantName só não seja suficiente por causa da struct
    addTask: (title: string, description?: string) => void;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: ReactNode }) {
    //criando uma agenda de exemplo para testes inicialmente
    const [user, setUser] = useState<User>({
        name: 'Jardineiro',
        xp: 0,
        level: 1,
        agendas: [
            {id: '1',
            name: 'Escola',
            frequency: 'diaria', 
            tasks: [{ id: '1', title: 'Dever de Matemática', done: false}],
            plant: {
                species: 'Girassol',
                name: 'Solzinho',
                stageNow: 0,
                maxStage: false
            }}
        ]
    });

    const [activeAgenda, setActiveAgendaId] = useState<string>('');

    function addAgenda(name: string, frequency: 'diaria' | 'semanal', plantName: string, plantSpecies: string){
        const newAgenda: Agenda = {
            id: Math.random().toString(36).substring(7), //gera uma string aleatória para criar um ID único
            name: name,
            frequency: frequency,
            tasks: [], //a lista de tarefas nasce vazia
            plant: {
                species: plantSpecies,
                name: plantName,
                stageNow: 0,
                maxStage: false
            }
        };
    
        //adiciona a nova agenda às existentes
        setUser((prev) => ({
            ...prev,
            agendas: [...prev.agendas, newAgenda]
        }));
    }

    function addTask(title: string, description?: string){
        setUser((prev) => {
            const newAgendas = prev.agendas.map(agenda => { //varre todas as agendas com o map
                if(agenda.id === activeAgenda) { //achando a tarefa ativa, adiciona a nova task
                    const newTask: Task = {
                        id: Math.random().toString(),
                        title: title,
                        description: description,
                        done: false
                    };
                    return {...agenda, tasks: [...agenda.tasks, newTask]}; //retorna com tudo que já tinha antes e a nova tarefa
                }
                return agenda; //caso não seja a agenda ativa, retorna sem mudar
            });
            return {...prev, agendas: newAgendas};
        });
    }

    function checkTask (agendaID: string, taskID: string){
        setUser((prev) => {
            let xpGain = 0; //o check da task vai alterar o XP de alguma forma

            const newAgendas = prev.agendas.map(agenda => {
                if(agenda.id !== agendaID) return agenda; //ignora as agendas não utilizadas agora

                //Inverte o boolean da tarefa para marcar como concluída ou não concluída
                const newTasks = agenda.tasks.map(task => {
                    if(task.id === taskID) {
                        const newStatus = !task.done; //pega o boolean contrário ao estado atual
                        xpGain = newStatus ? 10 : -10; //se foi conclúida, +10 xp, se não, -10 xp
                        return {...task, done: newStatus}; 
                    }
                    return task; //retorna a tarefa com o novo status
                });

                //Calcula o crescimento da planta
                const totalTasks = newTasks.length; //vê quantas tarefas a planta tem pra crescer completamente (total concluídas = estágio máximo da planta)
                const done = newTasks.filter(t => t.done).length; //Quantidade de tarefas já concluídas da planta
                let newStage = 0;
                if(totalTasks > 0) {
                    //Por regra de 3 simples, descobre a porcentagem concluída e multiplica por 4 (o estágio máximo da planta)
                    const percentage = done/totalTasks;
                    newStage = Math.floor(percentage * 4);
                }
                return {
                    ...agenda,
                    tasks: newTasks,
                    plant: {
                        ...agenda.plant,
                        stageNow: newStage, //atualiza o estágio da planta baseado no cálculo
                        maxStage: newStage === 4 //marca como true se a planta alcançou o estágio 4
                    }
                };
            });

            const newXP = Math.max(0, prev.xp + xpGain); //calcula o novo xp
            const calculatedLevel = Math.floor(Math.max(0, prev.xp + xpGain) / 100) + 1; //recalcula o nível do usuário onde a cada 100 xp, sobe um nível
            const newLevel = Math.min(150, calculatedLevel); //nunca passa do nível 150

            return {
                ...prev, 
                xp: newXP,
                level: newLevel,
                agendas:newAgendas
            };
        });
    }

    return (
        <AppContext.Provider value={{
            user,
            activeAgenda,
            setActiveAgendaId,
            checkTask,
            addAgenda,
            addTask
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() { //o Hook que será utilizado ao longo do código
  return useContext(AppContext);
}

