import { createRouter, createWebHashHistory } from "vue-router";
import global from "../utils/global";
// let global = inject("$global"); //setup
// const global_ds = {
//   router: {
//     default_page_name: "user",
//     name: {
//       login: "Login",
//       user: "user",
//     },
//   },
// };
// console.log(global);
import Layout from "../layout";

const routes = [
  {
    path: "/",
    name: "",
    redirect: { name: "Login" },
    menu: false,
  },
  {
    path: "/login",
    name: global.router.name.login,
    menu: false,
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
  },
  {
    path: "/user",
    icon: "person",
    label: "用户",
    component: Layout,
    children: [
      {
        path: "",
        name: global.router.name.user,
        component: () => import("../views/user"),
      },
    ],
  },
  {
    path: "/challenge",
    name: "challenge",
    component: Layout,
    icon: "emoji_events",
    label: "挑战",
    children: [
      {
        path: "",
        component: () => import("../views/challenge"),
      },
    ],
  },
  {
    path: "/clockin",
    name: "clockin",
    component: Layout,
    icon: "whatshot",
    label: "打卡",
    children: [
      {
        path: "",
        component: () => import("../views/clockin"),
      },
    ],
  },
  {
    path: "/good",
    name: "good",
    component: Layout,
    icon: "shopping_bag",
    label: "商品",
    children: [
      {
        path: "",
        component: () => import("../views/good"),
      },
    ],
  },
  {
    path: "/purchased",
    name: "purchased",
    component: Layout,
    icon: "shopping_cart",
    label: "购入",
    children: [
      {
        path: "",
        component: () => import("../views/purchased"),
      },
    ],
  },
];

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  if (localStorage.getItem("token")) {
    console.log(global);
    if (to.name === global.router.name.login) {
      router.push({
        name: global.router.default_page_name,
      });
    } else {
      next();
    }
  } else if (to.name == global.router.name.login) {
    next();
  } else {
    router.push({
      name: global.router.name.login,
    });
  }
});
export default router;
