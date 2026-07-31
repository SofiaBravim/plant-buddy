//O intuito do arquivo é guardar as estruturas que serão utilizadas ao longo do projeto
//export serve para tornar o tipo público
export type Task = {
    id: string;
    title: string;
    description?: string; //o ? permite que esse atributo seja opcional para o tipo
    done: boolean;
};

export type Agenda = {
    id: string;
    name: string;
    currency: 'diaria' | 'semanal'; //apenas essas duas opções vão existir no projeto
    tasks: Task[]; //cria uma lista de objetos Tarefa para uma agenda
    //cada agenda tem uma e apenas uma planta associada a ela
    plant: {
        species: string;
        name: string;
        stageNow: number; //vai de 0 até total de estágios (imagens) - 1
        maxStage: boolean; //se a planta já chegou em seu estágio máximo
    };
};

export type User = {
    name: string;
    xp: number;
    level: number;
    agendas: Agenda[];
};