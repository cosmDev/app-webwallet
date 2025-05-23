import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CreatePropView from "../views/CreatePropView.vue";
import AllProposalsView from "../views/AllProposalsView.vue";
import TxView from "../views/TxView.vue";
import Feegrant from "../views/Feegrant.vue";
import DelegationsView from "../views/DelegationsView.vue";
import AuthzView from "../views/AuthzView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/create-proposal",
      name: "create-proposal",
      component: CreatePropView,
    },
    {
      path: "/all-proposals",
      name: "all-proposals",
      component: AllProposalsView,
    },
    {
      path: "/tx-details/:txHash",
      name: "tx-details",
      component: TxView,
    },
    {
      path: "/my-delegations",
      name: "my-delegations",
      component: DelegationsView,
    },

    {
      path: "/fee-grants",
      name: "fee-grants",
      component: Feegrant,
    },
    {
      path: "/my-authz",
      name: "my-authz",
      component: AuthzView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
  ],
});

export default router;
