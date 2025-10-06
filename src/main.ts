import { createApp } from "vue";
import "@mdi/font/css/materialdesignicons.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import vuetify from "./plugins/vuetify";

import api, { bindAccessToken } from "@/api/http";
import { useAuthStore } from "@/stores/auth";

// FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faUser,
  faFile,
  faUsers,
  faChartLine,
  faGear,
  faRightFromBracket,
  faLink
} from "@fortawesome/free-solid-svg-icons";

library.add(faUser, faFile, faUsers, faChartLine, faGear, faRightFromBracket, faLink);

const app = createApp(App);
const pinia = createPinia();

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(pinia);
app.use(router);
app.use(vuetify);

const auth = useAuthStore();

bindAccessToken(
  () => auth.accessToken || "",
  (token: string) => { auth.accessToken = token; }
);


api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        await auth.refresh();
        return api(err.config);
      } catch {
        await auth.logout();
      }
    }
    return Promise.reject(err);
  }
);

app.mount("#app");
