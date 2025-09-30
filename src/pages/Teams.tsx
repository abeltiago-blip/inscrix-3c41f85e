import Header from '@/components/Header';
import { TeamsList } from '@/components/teams/TeamsList';

const Teams = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <TeamsList />
      </div>
    </div>
  );
};

export default Teams;