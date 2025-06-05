import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import App from './App.vue';
import 'ant-design-vue/dist/reset.css';
import 'ag-grid-community/styles/ag-grid.min.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import './styles/main.scss';

// 导入AG Grid企业版模块
import 'ag-grid-enterprise';

const app = createApp(App);
const pinia = createPinia();

app.use(Antd);
app.use(pinia);

app.mount('#app');