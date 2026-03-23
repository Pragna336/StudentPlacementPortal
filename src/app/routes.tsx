import { createBrowserRouter } from "react-router";
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { HomeDashboard } from "./components/HomeDashboard";
import { AptitudePractice } from "./components/AptitudePractice";
import { CodingPractice } from "./components/CodingPractice";
import { InterviewPreparation } from "./components/InterviewPreparation";
import { MockTest } from "./components/MockTest";
import { TestQuestion } from "./components/TestQuestion";
import { ResultScreen } from "./components/ResultScreen";
import { ProgressTracking } from "./components/ProgressTracking";
import { ProfileScreen } from "./components/ProfileScreen";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/register",
    Component: RegisterScreen,
  },
  {
    path: "/home",
    Component: HomeDashboard,
  },
  {
    path: "/aptitude",
    Component: AptitudePractice,
  },
  {
    path: "/coding",
    Component: CodingPractice,
  },
  {
    path: "/interview",
    Component: InterviewPreparation,
  },
  {
    path: "/mock-test",
    Component: MockTest,
  },
  {
    path: "/test-question",
    Component: TestQuestion,
  },
  {
    path: "/result",
    Component: ResultScreen,
  },
  {
    path: "/progress",
    Component: ProgressTracking,
  },
  {
    path: "/profile",
    Component: ProfileScreen,
  },
  {
    path: "/admin-login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
]);
