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
          <nav
            className="navbar is-primary"
            role="navigation"
            aria-label="main navigation"
          >
            <div className="navbar-brand">
              <a className="navbar-item" href="/#/">
                <strong>Cashsplitter</strong>
              </a>

              <a
                role="button"
                className="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </a>
            </div>
          </nav>

          <main className="section">
            <div className="container">
              <Router hook={useHashLocation}>
                <Route path="/" component={Home} />
                <Route path="/create" component={CreateGroup} />
                <Route path="/group/:timestamp" component={GroupDetail} />
                <Route
                  path="/group/:timestamp/addExpense"
                  component={AddExpenseRoute}
                />
              </Router>
            </div>
          </main>

          <footer className="footer">
            <div className="content has-text-centered">
              <p>&copy; {new Date().getFullYear()} Cashsplitter</p>
            </div>
          </footer>
        </div>
      </GroupsProvider>
    </NotificationProvider>
  );
};
