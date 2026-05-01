import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores";

import Login from "../components/LoginPage.vue";
import Forgot from "../components/ForgotPage.vue";
import Reset from "../components/ResetPage.vue";
import Register from "../components/RegisterPage.vue";
import Notif from "../components/NotifPage.vue";
import Home from "../components/HomePage.vue";
import OpenCashier from "../components/CashierSessionPage.vue";
import CloseCashier from "../components/CloseCashierPage.vue";
import Cashier from "../components/CashierPage.vue";
import Product from "../components/ProductPage.vue";
import AddProduct from "../components/AddProductPage.vue";
import AddCategory from "../components/AddCategoryPage.vue";
import AddBrand from "../components/AddBrandPage.vue";
import PosTransaction from "../components/TransactionPage.vue";
import ListProduct from "../components/ListProduct.vue";
import TopupFund from "../components/TopupFundPage.vue";
import TransferFund from "../components/TransferFundPage.vue";
import Finance from "../components/FinancePage.vue";
import FinanceExpanse from "../components/FinanceExpanse.vue";
import FinanceIncome from "../components/FinanceIncome.vue";
import Setting from "../components/SettingPage.vue";
import Report from "../components/ReportPage.vue";
import ListBon from "../components/ListBonPage.vue";
import History from "../components/HistoryPage.vue";
import EditProduct from "../components/reusable/EditOrAddProduct.vue";
import TransactionDetail from "../components/TransactionDetail.vue";
import StrukPage from "../components/StrukPage.vue";
import StockOpname from "../components/StockOpname.vue";
import AddStock from "../components/AddStock.vue";
import DashboardPage from "@/components/DashboardPage.vue";
import SubscriptionPage from "@/components/SubscriptionPage.vue";
import ChoosePlanPage from "@/components/ChoosePlan.vue";
import PaymentPage from "@/components/PaymentPlan.vue";
import BillingPage from "@/components/BillingPage.vue";
import SubscriberPage from "@/components/ListSubscriber.vue";
import SubscriberDetailPage from "@/components/SubscriberDetailPage.vue";
import PosOverview from "@/components/OverviewPosPage.vue";
import OutletPage from "@/components/OutletPage.vue";
import DetailOutletPage from "@/components/OutletDetail.vue";
import UserPage from "@/components/UserPage.vue";
import UserOutlet from "@/components/UserOutlet.vue";
import ProductLayout from "@/components/ProductLayout.vue";
import PosLayout from "@/components/PosLayout.vue";
import PosOpenSession from "@/components/PosOpenSession.vue";
import StockPage from "@/components/ProductStockPage.vue";
import StockDetail from "@/components/ProductStockDetail.vue";
import AccountBank from "@/components/AccountFinance.vue";
import AccountMutation from "@/components/AccountMutationPage.vue";
import Integration from "@/components/IntegrationPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "Dashbord",
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/subscription",
    name: "Subscription",
    component: SubscriptionPage,
    meta: {
      requiresAuth: true,
      roles: ["super_admin", "system_admin"],
    },
  },
  {
    path: "/history",
    name: "History",
    component: History,
  },

  // Bank Account
  {
    path: "/account",
    name: "accountBank",
    component: AccountBank,
  },
  {
    path: "/mutation",
    name: "accountMutation",
    component: AccountMutation,
  },
  {
    path: "/forgot-password",
    name: "forgot",
    component: Forgot,
  },
  {
    path: "/reset-password",
    name: "reset",
    component: Reset,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/notif",
    name: "notif",
    component: Notif,
  },
  {
    path: "/open-cashier",
    name: "cashier",
    component: OpenCashier,
  },
  {
    path: "/close-cashier",
    name: "cashierClose",
    component: CloseCashier,
  },
  {
    path: "/cashier",
    name: "cashierOpen",
    component: Cashier,
  },
  {
    path: "/finance",
    name: "finance",
    component: Finance,
  },
  {
    path: "/stocks-opname",
    name: "stokOpname",
    component: StockOpname,
  },
  {
    path: "/expanse",
    name: "expanse",
    component: FinanceExpanse,
  },
  {
    path: "/income",
    name: "income",
    component: FinanceIncome,
  },
  {
    path: "/payment",
    name: "payment",
    component: PaymentPage,
  },
  {
    path: "/struk",
    name: "struk",
    component: StrukPage,
  },
  {
    path: "/report",
    name: "report",
    component: Report,
  },
  {
    path: "/topup-fund",
    name: "topupFund",
    component: TopupFund,
  },
  {
    path: "/transfer-fund",
    name: "transferFund",
    component: TransferFund,
  },
  {
    path: "/product",
    name: "product",
    component: ProductLayout,
    children: [
      {
        path: "",
        name: "productOverview",
        component: Product,
      },
      {
        path: "list-product", // TANPA slash di depan
        name: "listProduct",
        component: ListProduct,
      },
      {
        path: "stock", // TANPA slash di depan
        name: "stockProduct",
        component: StockPage,
      },
      {
        path: "create", // TANPA slash di depan
        name: "addProduct",
        component: AddProduct,
      },
      {
        path: "edit/:id", // TANPA slash di depan
        name: "editProduct",
        component: AddProduct,
      },
      {
        path: "add-category", // TANPA slash di depan
        name: "addCategory",
        component: AddCategory,
      },
      {
        path: "add-brand", // TANPA slash di depan
        name: "addBrand",
        component: AddBrand,
      },
      {
        path: "stock-detail/:productId/:outletId",
        name: "stockDetail",
        component: StockDetail,
        props: true,
      },
    ],
  },
  {
    path: "/list-bon",
    name: "listBon",
    component: ListBon,
  },
  {
    path: "/add-stock",
    name: "addStock",
    component: AddStock,
  },
  {
    path: "/choose-plan",
    name: "choosePlan",
    component: ChoosePlanPage,
  },
  {
    path: "/subscription/billing",
    name: "billingPage",
    component: BillingPage,
    meta: {
      requiresAuth: true,
      roles: ["super_admin", "system_admin"],
    },
  },
  {
    path: "/subscription/subscriber",
    name: "subscriberPage",
    component: SubscriberPage,
    meta: {
      requiresAuth: true,
      roles: ["super_admin"],
    },
  },
  {
    path: "/subscription/subscriber/:id",
    name: "subscriberDetail",
    component: SubscriberDetailPage,
    meta: {
      requiresAuth: true,
      roles: ["super_admin"],
    },
  },
  {
    path: "/setting",
    name: "setting",
    component: Setting,
  },

  //Outlet Page
  {
    path: "/outlet",
    name: "outlet",
    component: OutletPage,
  },
  {
    path: "/detail-outlet/:id",
    name: "detailOutlet",
    component: DetailOutletPage,
  },

  //POS Page
  {
    path: "/pos",
    name: "pos",
    component: PosLayout,
    children: [
      {
        path: "",
        name: "posOverview",
        component: PosOverview,
      },
      {
        path: "transaction",
        name: "posTransaction",
        component: PosTransaction,
      },
      {
        path: "open-session",
        name: "posOpenSession",
        component: PosOpenSession,
      },
    ],
  },

  //USER Page
  {
    path: "/user",
    name: "user",
    component: UserPage,
  },
  {
    path: "/user/create-user-outlet",
    name: "userOutlet",
    component: UserOutlet,
  },

  // Integration Page
  {
    path: "/integration",
    name: "integration",
    component: Integration,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const token = userStore.token;

  // 1️⃣ Cek login
  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  // 2️⃣ Cek role jika ada meta.roles
  if (to.meta.roles) {
    const userRole = userStore.role;

    if (!to.meta.roles.includes(userRole)) {
      return next("/dashboard"); // atau halaman unauthorized
    }
  }

  next();
});

// router.beforeEach(async (to, from, next) => {
//   if (to.name === "posTransaction") {
//     try {
//       const res = await api.get("/cashier/session");

//       if (!res.data.data) {
//         return next({ name: "posOpenSession" });
//       }
//     } catch (err) {
//       return next({ name: "posOpenSession" });
//     }
//   }

//   next();
// });

export default router;
