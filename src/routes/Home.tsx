// Home route component
import { FunctionComponent } from "preact";
import { GroupsList } from "../components/GroupsList.tsx";

export const Home: FunctionComponent = () => {
  return (
    <div className="home-page">
      <div className="section">
        <div className="container">
          <GroupsList />
        </div>
      </div>
    </div>
  );
};
