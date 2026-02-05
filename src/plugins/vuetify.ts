import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { es } from "vuetify/locale";

export default createVuetify({
  components,
  directives,
  locale: {
    locale: "es",
    messages: { es },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});

