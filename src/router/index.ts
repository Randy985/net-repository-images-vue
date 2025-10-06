import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage.vue";
import RegisterPage from "@/pages/auth/RegisterPage.vue";

// Layout
import DashboardLayout from "@/layouts/DashboardLayout.vue";

// Dashboard children pages
import DashboardPage from "@/pages/dashboard/DashboardPage.vue";
import DocumentListPage from "@/pages/documents/DocumentListPage.vue";
import SupplierListPage from "@/pages/suppliers/SupplierListPage.vue";
import AuditLogPage from "@/pages/audit/AuditLogPage.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginPage, meta: { guest: true } },
  { path: "/register", component: RegisterPage, meta: { guest: true } },
  {
    path: "/dashboard/tokens",
    component: () => import("@/pages/documents/DocumentTokensPage.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: DashboardPage },
      { path: "documents", component: DocumentListPage },
      { path: "suppliers", component: SupplierListPage },
      { path: "audit", component: AuditLogPage },
      {
        path: "settings",
        component: () => import("@/pages/settings/UserListPage.vue"),
        meta: { requiresAuth: true, roles: [1, 2] }
      }
    ],
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.accessToken) return "/login";
  if (to.meta.guest && auth.accessToken) return "/dashboard";
});

export default router;
