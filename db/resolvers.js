const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Tarea = require('../models/Tarea');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});

const crearToken = (usuario, secreta, expiresIn) => {
    const {id, email, nombre} = usuario;
    return jwt.sign(
        {id,email,nombre}
        ,secreta
        ,{expiresIn}
    );
}

const resolvers = {
    Query: {
        obtenerCursos: () => cursos,
        obtenerTecnologia: () => cursos,
        obtenerProyectos: async(_, {}, ctx) => {
            const proyectos = await Proyecto.find({creador: ctx.usuario.id});

            return proyectos;
        },
        obtenerTareas: async(_, {input}, ctx) => {

            const tareas = await Tarea.find({creador: ctx.usuario.id}).where('proyecto').equals(input.proyecto);
            return tareas;

        }
    },
    Mutation: {
        crearUsuario: async (_, {input}, ctx) => {
            console.log(input)
            const {email, password} = input
            console.log('Creando Usuario')

            const existeUsuario = await Usuario.findOne({email});

            if(existeUsuario){
                throw new Error('El usuario ya esta registrado');
            }

            try{

                const salt = await bcryptjs.genSalt(10);

                input.password = await bcryptjs.hash(password, salt);

                const nuevoUsuario = new Usuario(input);
                console.log(nuevoUsuario);
                nuevoUsuario.save();
                return "Usuario Creado";
            }catch(error){
                console.log(error);
            }

        },
        autenticarUsuario: async (_, {input}, ctx) => {
            console.log(input)
            const {email, password} = input

            const existeUsuario = await Usuario.findOne({email});

            if(!existeUsuario){
                throw new Error('El usuario no existe');
            }

            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);

            if(!passwordCorrecto){
                throw new Error('El contaseña no es correcta');
            }

            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24hr')
            };

        },
        nuevoProyecto: async (_, {input}, ctx) => {

            console.log('Desde resolver', ctx);

            try{
                console.log("Proyecto Guardado")

                const proyecto = new Proyecto(input);

                proyecto.creador = ctx.usuario.id;

                const resultado = await proyecto.save();

                return resultado;

            }catch(error){
                console.log(error)
            }

        },
        actualizarProyecto: async (_, {id, input}, ctx) => {

            let proyecto = await Proyecto.findById(id);

            if(!proyecto){
                throw new Error('Proyecto no encontrado');
            }

            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes permiso para editar este proyecto');
            }

            proyecto = await Proyecto.findOneAndUpdate({_id: id}, input, {new: true});

            return proyecto;

        },
        eliminarProyecto: async (_, {id}, ctx) => {
            
            let proyecto = await Proyecto.findById(id);

            if(!proyecto){
                throw new Error('Proyecto no encontrado');
            }

            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes permiso para editar este proyecto');
            }

            await Proyecto.findOneAndDelete({_id: id});

            return "Proyecto Eliminado";

        },
        nuevaTarea: async (_, {input}, ctx) => {
            try{
                const tarea = new Tarea(input)
                tarea.creador = ctx.usuario.id;
                const resultado = await tarea.save();
                return resultado;
            }catch(error){
                console.log(error);
            }
        },
        actualizarTarea : async (_, {id,input,estado}, ctx) => {

            let tarea = await Tarea.findById(id); 

            if(!tarea) {
                throw new Error('Tarea no encontrada');
            }

            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes permiso para modificar esta tarea');
            }

            input.estado = estado;

            tarea = await Tarea.findOneAndUpdate({_id: id}, input, {new: true})

            return tarea;

        },
        eliminarTarea: async (_, {id}, ctx) => {

            let tarea = await Tarea.findById(id); 

            if(!tarea) {
                throw new Error('Tarea no encontrada');
            }

            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes permiso para modificar esta tarea');
            }

            await Tarea.findOneAndDelete({_id: id});

            return "Tarea Eliminada";

        }
    }
}

module.exports = resolvers;