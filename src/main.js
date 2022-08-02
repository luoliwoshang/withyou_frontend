import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./styles/common.css";
import { Quasar, Notify } from "quasar";
import quasarUserOptions from "./quasar-user-options";
import RegisterComponent from "@/components";
import global from "./utils/global"; //注意文件路径，实际路径以项目目录结构为准

const app = createApp(App);
RegisterComponent(app);
app.provide("$global", global); //provide
app.use(Quasar, quasarUserOptions).use(store).use(router).mount("#app");
