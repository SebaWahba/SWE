import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Browse from "./pages/Browse";
import AISearch from "./pages/AISearch";
import Watch from "./pages/Watch";
import AuthCallback from "./pages/AuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/auth/callback",
    Component: AuthCallback,
  },
  {
    path: "/browse",
    Component: Browse,
  },
  {
    path: "/search",
    Component: AISearch,
  },
  {
    path: "/watch/:id",
    Component: Watch,
  },
]);
