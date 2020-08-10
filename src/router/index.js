import {createRouter, createWebHashHistory} from 'vue-router'

const routes = [
  {
    path: '/canvas-study',
    name: 'CanvasStudy',
    component: () =>
      import(/* webpackChunkName: "CanvasStudy" */ '@/views/CanvasStudy/index'),
  },
  {
    path: '/gobang/:room',
    name: 'Gobang',
    component: () =>
      import(/* webpackChunkName: "Gobang" */ '@/views/Gobang/index'),
  },
  {
    path: '/',
    redirect: '/canvas-study',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
