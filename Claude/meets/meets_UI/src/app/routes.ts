import { createBrowserRouter } from "react-router";

import { LandingPage } from "./components/pages/LandingPage";
import { AuthSelectPage, RegisterPage, LoginPage } from "./components/pages/AuthPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { EkycSubmitPage, EkycStatusPage } from "./components/pages/EkycPage";
import { HomePage } from "./components/pages/HomePage";
import { CandidatesPage, CandidateDetailPage } from "./components/pages/CandidatesPage";
import {
  MeetingRequestPage,
  MeetingSentPage,
  ReceivedApplicationPage,
  ScheduleInputPage,
  ScheduleSelectPage,
  MeetingDetailPage,
  FeedbackPage,
  StripePage,
} from "./components/pages/MeetingPages";
import { ChatListPage, ChatRoomPage } from "./components/pages/ChatPages";
import {
  RelationshipsPage,
  SeriousRequestPage,
  EndOtherRelationshipsPage,
  MarriageApplicationPage,
  MarriagePaymentPage,
  MarriageCompletePage,
} from "./components/pages/RelationshipPages";
import {
  MyProfilePage,
  ProfileViewPage,
  ProfileEditPage,
} from "./components/pages/ProfilePages";
import { AgentSearchPage, AgentDetailPage } from "./components/pages/AgentSearchPage";
import {
  NotificationsPage,
  CertificatesPage,
  BillingPage,
  AccountSuspendedPage,
  OnboardingResumePage,
  MeetingsListPage,
} from "./components/pages/SettingsPages";
import { PlaceholderPage } from "./components/pages/PlaceholderPage";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  // Public routes
  { path: "/", Component: LandingPage },
  { path: "/auth", Component: AuthSelectPage },
  { path: "/auth/register", Component: RegisterPage },
  { path: "/auth/login", Component: LoginPage },

  // Onboarding
  { path: "/onboarding/:step", Component: OnboardingPage },
  { path: "/onboarding-resume", Component: OnboardingResumePage },

  // eKYC
  { path: "/ekyc", Component: EkycSubmitPage },
  { path: "/ekyc/status", Component: EkycStatusPage },

  // Main app (with bottom nav)
  {
    Component: Layout,
    children: [
      { path: "/home", Component: HomePage },
      { path: "/candidates", Component: CandidatesPage },
      { path: "/candidates/:id", Component: CandidateDetailPage },
      { path: "/matches", Component: RelationshipsPage },
      { path: "/chat", Component: ChatListPage },
      { path: "/profile", Component: MyProfilePage },
      { path: "/agents", Component: AgentSearchPage },
    ],
  },

  // Full-screen pages (no bottom nav)
  { path: "/chat/:id", Component: ChatRoomPage },
  { path: "/meeting-request", Component: MeetingRequestPage },
  { path: "/meeting-sent", Component: MeetingSentPage },
  { path: "/received-application", Component: ReceivedApplicationPage },
  { path: "/schedule-input", Component: ScheduleInputPage },
  { path: "/schedule-select", Component: ScheduleSelectPage },
  { path: "/meeting-detail", Component: MeetingDetailPage },
  { path: "/meetings", Component: MeetingsListPage },
  { path: "/feedback", Component: FeedbackPage },
  { path: "/stripe", Component: StripePage },
  { path: "/profile/view", Component: ProfileViewPage },
  { path: "/profile/edit", Component: ProfileEditPage },
  { path: "/notifications", Component: NotificationsPage },
  { path: "/certificates", Component: CertificatesPage },
  { path: "/billing", Component: BillingPage },
  { path: "/account-suspended", Component: AccountSuspendedPage },
  { path: "/agent-search", Component: AgentSearchPage },
  { path: "/agent-search/:id", Component: AgentDetailPage },
  { path: "/serious-request", Component: SeriousRequestPage },
  { path: "/end-other-relationships", Component: EndOtherRelationshipsPage },
  { path: "/marriage-application", Component: MarriageApplicationPage },
  { path: "/marriage-payment", Component: MarriagePaymentPage },
  { path: "/marriage-complete", Component: MarriageCompletePage },
  { path: "/favorites", Component: PlaceholderPage },
  { path: "/history", Component: PlaceholderPage },
  { path: "/premium", Component: PlaceholderPage },
  { path: "/premium-pack", Component: PlaceholderPage },
  { path: "/help", Component: PlaceholderPage },
  { path: "/settings", Component: PlaceholderPage },
]);