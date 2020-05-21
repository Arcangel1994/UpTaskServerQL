const {gql} = require('apollo-server');

const typeDefs = gql`

    type Curso {
        titulo: String
        tecnologia: String
    }

    type Tecnologia {
        tecnologia: String
    }

    type Query{
        obtenerCursos: [Curso]
        obtenerTecnologia: [Tecnologia]
        obtenerProyectos: [Proyecto]
        obtenerTareas(input: ProyectoIDInput): [Tarea]
    }

    input ProyectoIDInput{
        proyecto: String!
    }

    input UsuarioInput {
        nombre: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input ProyectoInput {
        nombre: String!
    }

    input TareaInput {
        nombre: String!
        proyecto: String
    }

    type Token {
        token: String
    }

    type Proyecto {
        nombre: String
        id: ID
    }

    type Tarea {
        nombre: String
        proyecto: String
        estado: Boolean
        id: ID
    }

    type Mutation {
        # Usuario
        crearUsuario(input: UsuarioInput): String
        autenticarUsuario(input: AutenticarInput): Token

        # Proyectos
        nuevoProyecto(input: ProyectoInput): Proyecto
        actualizarProyecto(id: ID!, input: ProyectoInput): Proyecto
        eliminarProyecto(id: ID!): String

        #Tareas
        nuevaTarea(input: TareaInput): Tarea
        actualizarTarea(id: ID!, input: TareaInput, estado: Boolean): Tarea
        eliminarTarea(id: ID!): String
    }

`;

module.exports = typeDefs;