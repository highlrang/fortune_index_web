import { createBrowserRouter } from "react-router";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ConsultationPage } from "./pages/ConsultationPage";
import { ConsultationHistoryPage } from "./pages/ConsultationHistoryPage";
import { TarotPickerPage } from "./pages/TarotPickerPage";
import { TarotSpreadPage } from "./pages/TarotSpreadPage";
import { TarotResultPage } from "./pages/TarotResultPage";
import { InvestmentResultPage } from "./pages/InvestmentResultPage";
import { MyPage } from "./pages/MyPage";
import { LikedFortunesPage } from "./pages/LikedFortunesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SignupPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/home",
    Component: HomePage,
  },
  {
    path: "/consultation",
    Component: ConsultationPage,
  },
  {
    path: "/consultation-history",
    Component: ConsultationHistoryPage,
  },
  {
    path: "/tarot-picker",
    Component: TarotPickerPage,
  },
  {
    path: "/tarot-spread",
    Component: TarotSpreadPage,
  },
  {
    path: "/tarot-result",
    Component: TarotResultPage,
  },
  {
    path: "/investment-result",
    Component: InvestmentResultPage,
  },
  {
    path: "/my",
    Component: MyPage,
  },
  {
    path: "/liked-fortunes",
    Component: LikedFortunesPage,
  },
  {
    path: "/notifications",
    Component: NotificationsPage,
  },
  {
    path: "/terms",
    Component: TermsPage,
  },
  {
    path: "/privacy",
    Component: PrivacyPolicyPage,
  },
]);
