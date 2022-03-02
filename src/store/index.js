// import Vue from 'vue'
import {
    createStore
} from 'vuex'

import getters from './getters'

const files =
    import.meta.globEager('./modules/*.js')
const modules = {}
for (const key in files) {
    if (files[key].default) {
        modules[key.replace(/(\.\/modules\/|\.js)/g, '')] = files[key].default
    }
}
Object.keys(modules).forEach(item => {
    if (modules[item]) {
        modules[item]['namespaced'] = true
    }
})

export default createStore({
    modules,
    getters
})
