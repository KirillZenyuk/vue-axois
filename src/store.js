import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import authAxios from "./axios-auth";
import router from "./router";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        token: null,
        userId: null,
        user: null
    },
    getters: {
        token: state => {
            return state.token
        },
        userId: state => {
            return state.userId
        },
        user: state => {
            return state.user
        },
        isAuthenticated: state => {
            return state.token !== null
        }
    },
    mutations: {
        'SET_USER': (state, payload) => {
            state.user = payload
        },
        'AUTH_USER': (state, payload) => {
            state.token = payload.token
            state.userId = payload.userId
        },
        'LOGOUT': state => {
            state.token = null
            state.userId = null
            state.user = null
        }
    },
    actions: {
        signUp(context, payload) {
            authAxios.post('/accounts:signUp?key=AIzaSyD15JbHDjIpxWLji1MGLYcNjg0365AOONY', {
                email: payload.email,
                password: payload.password,
                returnSecureToken: true
            })
                .then(res => {
                    console.log(res)
                    context.commit('AUTH_USER', {token: res.data.idToken, userId: res.data.localId})
                    context.dispatch("storeUser", payload)
                    context.dispatch("fetchUser")
                    router.replace('/dashboard')
                    context.dispatch("setLogoutTimer", res.data.expiresIn)
                    localStorage.setItem('token', res.data.idToken)
                    localStorage.setItem('userId', res.data.localId)
                    localStorage.setItem('expirationDate', new Date(new Date().getTime() + res.data.expiresIn * 1000))
                })
                .catch(err => console.log(err))
        },
        signIn(context, payload) {
            authAxios.post('/accounts:signInWithPassword?key=AIzaSyD15JbHDjIpxWLji1MGLYcNjg0365AOONY', {
                email: payload.email,
                password: payload.password,
                returnSecureToken: true
            })
                .then(res => {
                    console.log(res)
                    context.commit('AUTH_USER', {token: res.data.idToken, userId: res.data.localId})
                    context.dispatch("fetchUser")
                    router.replace('/dashboard')
                    context.dispatch("setLogoutTimer", res.data.expiresIn)
                    localStorage.setItem('token', res.data.idToken)
                    localStorage.setItem('userId', res.data.localId)
                    localStorage.setItem('expirationDate', new Date(new Date().getTime() + res.data.expiresIn * 1000))
                })
                .catch(err => console.log(err))
        },
        tryAutoSignIn(context) {
            const token = localStorage.getItem('token')
            if (!token) {
                return
            }
            const expirationDate = localStorage.getItem('expirationDate')
            if (new Date() >= expirationDate) {
                return
            }
            const userId = localStorage.getItem('userId')
            context.commit('AUTH_USER', {
                token,
                userId
            })
        },
        setLogoutTimer(context, payload) {
            setTimeout(context.commit('LOGOUT'), payload * 1000)
        },
        logout(context) {
            context.commit("LOGOUT")
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            localStorage.removeItem('expirationDate')
            router.replace('/')
        },
        storeUser(context, payload) {
            if (!context.state.token) {
                return
            }
            axios.post('/users.json' + '?auth=' + context.state.token, payload)
                .then(res => console.log(res))
                .catch(err => console.log(err))
        },
        fetchUser(context) {
            axios.get('/users.json' + '?auth=' + context.state.token)
                .then(res => {
                    const users = []
                    for (let key in res.data) {
                        const user = res.data[key]
                        user.id = key
                        users.push(user)
                    }
                    context.commit('SET_USER', users[0])
                })
                .catch(err => console.log(err))
        }
    }
})
