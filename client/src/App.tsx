import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ActiveChildProvider } from "./contexts/ActiveChildContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NotificationCenter } from "./components/NotificationCenter";
import Today from "./pages/Today";
import Growth from "./pages/Growth";
import Diary from "./pages/Diary";
import Content from "./pages/Content";
import Profile from "./pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Today} />
      <Route path={"/growth"} component={Growth} />
      <Route path={"/diary"} component={Diary} />
      <Route path={"/content"} component={Content} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <ActiveChildProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <NotificationCenter />
              <Router />
            </TooltipProvider>
          </NotificationProvider>
        </ActiveChildProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
