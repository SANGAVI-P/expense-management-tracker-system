import { useSession } from "@/contexts/SessionContext";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { BarChart3, Goal, History, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Wallet className="h-8 w-8 text-blue-500" />,
    title: "Track Expenses & Income",
    description: "Effortlessly log your daily transactions to see a clear picture of your cash flow.",
  },
  {
    icon: <Goal className="h-8 w-8 text-green-500" />,
    title: "Set Monthly Budgets",
    description: "Create custom budgets for different spending categories and get warnings when you're near your limit.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    title: "Visualize Your Spending",
    description: "Interactive charts and graphs help you understand where your money goes each month.",
  },
  {
    icon: <History className="h-8 w-8 text-orange-500" />,
    title: "Transaction History",
    description: "Easily search, filter, and review all your past transactions to find what you're looking for.",
  },
];

const Index = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  if (session) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background">
      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Take Control of Your Finances
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Our expense management system helps you track spending, set budgets, and achieve your financial goals with ease.
            </p>
            <Button asChild size="lg" className="text-lg">
              <Link to="/login">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Manage Your Money
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;