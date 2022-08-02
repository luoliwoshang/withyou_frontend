<template>
  <q-layout view="hHh LpR fFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Withyou
        </q-toolbar-title>
        <q-btn push dense icon="close" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" elevated>
      <!-- drawer content -->
      <q-tabs
        vertical
        active-color="primary"
        inline-label
        outside-arrows
        mobile-arrows
        class="bg-blue-2 text-white shadow-2"
      >
        <template v-for="(item, index) in routes">
          <q-route-tab
            v-if="item.menu != false"
            :label="item.label"
            :icon="item.icon"
            :to="item.path"
            exact
          />
        </template>
      </q-tabs>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, inject } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const global = inject("$global");

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
const logout = () => {
  localStorage.removeItem("token");
  router.push({
    name: global.router.name.login,
  });
};
const routes = router.options.routes;
</script>
