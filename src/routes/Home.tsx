// Home route component
import { FunctionComponent } from "preact";
import { GroupsList } from "../components/GroupsList.tsx";

export const Home: FunctionComponent = () => {
  return (
    <div className="home-page">
      <div className="hero is-primary is-small">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              Welcome to Cashsplitter
            </h1>
            <h2 className="subtitle">
              A tool to help manage expenses when in a group of people.
            </h2>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <GroupsList />
        </div>
      </div>
    </div>
  );
};
