/**
 * Main React application component
 * 
 * Sets up:
 * - React Query for data fetching and caching
 * - Client-side routing with wouter
 * - Global UI providers (tooltips, toasts)
 * - Application routes and navigation
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import UploadPage from "@/pages/upload";
import ResultsPage from "@/pages/results";
import NotFound from "@/pages/not-found";

/**
 * Application router component
 * Defines all available routes and their corresponding page components
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={UploadPage} />           {/* File upload page */}
      <Route path="/results" component={ResultsPage} />   {/* Results display page */}
      <Route component={NotFound} />                      {/* 404 fallback page */}
    </Switch>
  );
}

/**
 * Root application component
 * Wraps the entire app with necessary providers and context
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Global toast notification system */}
        <Toaster />
        {/* Main application routes */}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
