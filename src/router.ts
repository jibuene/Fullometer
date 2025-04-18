import HelloWorld from './components/HelloWorld.vue'
import Eval from './views/Eval.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: Eval, meta: { title: 'Home' } },
        { path: '/:path(.*)', component: HelloWorld },
    ]
})
