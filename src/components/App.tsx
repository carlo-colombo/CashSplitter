// Main App component for Cashsplitter
import { FunctionComponent } from "preact";
import { Route, Router } from "wouter-preact";
import { useHashLocation } from "wouter-preact/use-hash-location";
import { Home } from "../routes/Home.tsx";
import { CreateGroup } from "../routes/CreateGroup.tsx";
import { GroupDetail } from "../routes/GroupDetail.tsx";
import { AddExpenseRoute } from "../routes/AddExpenseRoute.tsx";
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
            <Router hook={useHashLocation}>
              <Route path="/" component={Home} />
              <Route path="/create" component={CreateGroup} />
              <Route path="/group/:timestamp" component={GroupDetail} />
              <Route
                path="/group/:timestamp/addExpense"
                component={AddExpenseRoute}
              />
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
