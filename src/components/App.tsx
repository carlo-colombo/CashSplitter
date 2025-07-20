// Main App component for Cashsplitter
import { FunctionComponent } from "preact";
import { Router } from "preact-router";
import { Home } from "../routes/Home.tsx";

export const App: FunctionComponent = () => {
  return (
    <div className="cashsplitter-app">
      <header>
        <h1>Cashsplitter</h1>
      </header>
      
      <main>
        <Router>
          <Home path="/" />
          {/* Additional routes will be added here */}
        </Router>
      </main>
      
      <footer>
        <p>&copy; {new Date().getFullYear()} Cashsplitter</p>
      </footer>
    </div>
  );
};
