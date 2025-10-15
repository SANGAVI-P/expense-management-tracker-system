import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { session, supabase } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <p>Welcome, {session?.user?.email}!</p>
      <p className="mt-4">This is where the expense management system will be built.</p>
    </div>
  );
};

export default Dashboard;