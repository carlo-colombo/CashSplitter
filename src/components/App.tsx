// Main App component for Cashsplitter
import { FunctionComponent } from "preact";
import { Router } from "preact-router";
import { Home } from "../routes/Home.tsx";
import { CreateGroup } from "../routes/CreateGroup.tsx";
import { GroupDetail } from "../routes/GroupDetail.tsx";
import { NotificationProvider } from "./Notification.tsx";
import { GroupsProvider } from "../context/GroupsContext.tsx";

export const App: FunctionComponent = () => {
  return (
    <NotificationProvider>
      <GroupsProvider>
        <div className="cashsplitter-app">
          <header>
            <h1>Cashsplitter</h1>
          </header>

          <main>
            <Router>
              <Home path="/" />
              <CreateGroup path="/create" />
              <GroupDetail path="/group/:timestamp" />
            </Router>
          </main>

          <footer>
            <p>&copy; {new Date().getFullYear()} Cashsplitter</p>
          </footer>
        </div>
      </GroupsProvider>
    </NotificationProvider>
  );
};
