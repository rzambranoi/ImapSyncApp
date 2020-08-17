import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import SingUp from "../views/SingUp.vue";
import Login from "../views/Login.vue";
import NewImap from "../views/NewImap.vue";
import History from "../views/History.vue";

Vue.use(VueRouter);

function iflogginRedirect(to, from, next) {
  if (localStorage.token) {
    next("/");
  } else {
    next();
  }
}
function onlyIfLoogged(to, from, next) {
  const API_URL = "http://localhost:8081/api/v1/";
  fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.token}`
    }
  })
    .then(res => res.json())
    .then(result => {
      if (result.user) {
        next();
      } else {
        next("/login");
      }
    });
}

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/singUp",
    name: "SingUp",
    component: SingUp,
    beforeEnter: iflogginRedirect
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: iflogginRedirect
  },
  {
    path: "/new_imap",
    name: "NewImap",
    component: NewImap,
    beforeEnter: onlyIfLoogged
  },
  {
    path: "/history",
    name: "History",
    component: History,
    beforeEnter: onlyIfLoogged
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
