<template>
  <div class="flex justify-center items-center" style="height: 100%">
    <q-card style="width: 400px; height: fit-content">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">登陆</div>
      </q-card-section>
      <q-card-section>
        <q-input outlined v-model="username" label="用户名" />
        <q-input class="q-mt-md" outlined v-model="password" label="密码" />
      </q-card-section>
      <q-card-actions class="q-px-md">
        <q-btn color="primary" label="登陆" @click="login" />
        <q-btn flat>注册</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>
<script setup>
import { ref, inject } from "vue";
import User from "../apis/user.js";
import { useRouter } from "vue-router";
const global = inject("$global");
const router = useRouter();
const username = ref("");
const password = ref("");
const login = () => {
  console.log(username);
  User.login({
    username: username.value,
    password: password.value,
  })
    .then((res) => {
      localStorage.setItem("token", res.token);
      router.push({
        name: global.router.default_page_name,
      });
    })
    .catch((err) => {
      console.log("err " + err);
    });
};
</script>
