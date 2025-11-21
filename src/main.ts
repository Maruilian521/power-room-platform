import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import './assets/styles/themes.css' // 导入双主题系统
import './mock' // 导入模拟数据

// 初始化主题（默认 IotMatrix 旗舰版）
const savedTheme = localStorage.getItem('app-theme') || 'iot-matrix'
document.documentElement.setAttribute('data-theme', savedTheme)

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
