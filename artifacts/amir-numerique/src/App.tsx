import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import ServiceCategory from "@/pages/services/category";
import ServiceDetail from "@/pages/services/detail";
import Pricing from "@/pages/pricing";
import Portfolio from "@/pages/portfolio";
import Contact from "@/pages/contact";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import DashboardOrders from "@/pages/dashboard/orders";
import NewOrder from "@/pages/dashboard/orders/new";
import OrderDetail from "@/pages/dashboard/orders/detail";
import DashboardQuotes from "@/pages/dashboard/quotes";
import NewQuote from "@/pages/dashboard/quotes/new";
import QuoteDetail from "@/pages/dashboard/quotes/detail";
import DashboardProfile from "@/pages/dashboard/profile";
import AdminDashboard from "@/pages/admin";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/orders/detail";
import AdminQuotes from "@/pages/admin/quotes";
import AdminQuoteDetail from "@/pages/admin/quotes/detail";
import AdminCategories from "@/pages/admin/categories";
import AdminServices from "@/pages/admin/services";
import AdminPortfolio from "@/pages/admin/portfolio";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import SubcontractorPage from "@/pages/subcontractor";
import AdminSubcontractorRequests from "@/pages/admin/subcontractor-requests";
import AdminLogin from "@/pages/admin/login";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/services/:categorySlug/:serviceSlug" component={ServiceDetail} />
      <Route path="/services/:slug" component={ServiceCategory} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/contact" component={Contact} />
      <Route path="/partenariat" component={SubcontractorPage} />

      {/* Auth routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

      {/* Client dashboard routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/orders" component={DashboardOrders} />
      <Route path="/dashboard/orders/new" component={NewOrder} />
      <Route path="/dashboard/orders/:id" component={OrderDetail} />
      <Route path="/dashboard/quotes" component={DashboardQuotes} />
      <Route path="/dashboard/quotes/new" component={NewQuote} />
      <Route path="/dashboard/quotes/:id" component={QuoteDetail} />
      <Route path="/dashboard/profile" component={DashboardProfile} />

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/:id" component={AdminOrderDetail} />
      <Route path="/admin/quotes" component={AdminQuotes} />
      <Route path="/admin/quotes/:id" component={AdminQuoteDetail} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/portfolio" component={AdminPortfolio} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/subcontractor-requests" component={AdminSubcontractorRequests} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
