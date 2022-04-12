import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue")
  },
  {
    path: "/create-form",
    name: "CreateForm",
    component: () => import("../views/CreateForm.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue")
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  // eslint-disable-line no-unused-vars
  let isAuthenticated = false;
  let response = false;
  if (
    !!Vue.$cookies.get("loginToken") &&
    !sessionStorage.getItem("loginToken")
  ) {
    sessionStorage.setItem("loginToken", Vue.$cookies.get("loginToken"));
  }
  const token = sessionStorage.getItem("loginToken");
  if (token) {
    try {
      response = await Vue.prototype.backendApi.post(
        "/token-validation",
        {},
        {
          headers: {
            "x-auth-token": token
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
    isAuthenticated = response;
  }
  if (to.name === "Register" && !isAuthenticated) next();
  else if (to.name !== "Login" && !isAuthenticated) next({ name: "Login" });
  else next();
});

export default router;
