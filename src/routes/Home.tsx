// Home route component
import { FunctionComponent } from "preact";
import { GroupsList } from "../components/GroupsList.tsx";

interface HomeProps {
  path: string;
}

export const Home: FunctionComponent<HomeProps> = () => {
  return (
    <div className="home-page">
      <h2>Welcome to Cashsplitter</h2>
      <p>A tool to help manage expenses when in a group of people.</p>
      
      <div className="groups-container">
        <GroupsList />
      </div>
    </div>
  );
};
