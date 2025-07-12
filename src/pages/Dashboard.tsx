import React from "react";
import AppLayout from "@/components/Layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  Zap,
  Heart,
  Target,
  Award,
  Rocket,
  Rainbow,
  Coffee,
  Globe,
  User,
  Calendar,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { swapRequests, adminMessages } = useSkillSwap();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const userSwapRequests = swapRequests.filter(
    (request) => request.fromUserId === user.id || request.toUserId === user.id,
  );
  const pendingRequests = userSwapRequests.filter(
    (request) => request.status === "pending",
  );
  const activeSwaps = userSwapRequests.filter(
    (request) => request.status === "accepted",
  );

  const activeMessages = adminMessages.filter((msg) => msg.isActive);

  const stats = [
    {
      title: "Skills Offered",
      value: user.skillsOffered.length,
      icon: BookOpen,
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      description: "Ready to teach",
    },
    {
      title: "Learning Goals",
      value: user.skillsWanted.length,
      icon: Target,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
      description: "Want to learn",
    },
    {
      title: "Pending Requests",
      value: pendingRequests.length,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      description: "Awaiting response",
    },
    {
      title: "Active Swaps",
      value: activeSwaps.length,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      description: "In progress",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const motivationalQuotes = [
    { text: "Every expert was once a beginner", icon: Rocket },
    { text: "Learning never stops being awesome", icon: Sparkles },
    { text: "Your skills are someone's inspiration", icon: Heart },
    { text: "Knowledge shared is knowledge multiplied", icon: Globe },
  ];

  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const QuoteIcon = randomQuote.icon;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section with modern design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 dark:from-purple-800 dark:via-pink-800 dark:to-blue-800 p-8 text-white transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-pink-600/80 to-blue-600/80 dark:from-purple-800/90 dark:via-pink-800/90 dark:to-blue-800/90"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Hey there, {user.name.split(" ")[0]}! ✨
                </h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl">
                Ready to dive into some amazing skill exchanges? Your learning
                journey awaits!
              </p>
              <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 w-fit">
                <QuoteIcon className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium italic">
                  "{randomQuote.text}"
                </span>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex gap-3">
              <Button
                onClick={() => navigate("/browse")}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 group"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                Discover Skills
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <User className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Admin Messages with modern styling */}
        {activeMessages.length > 0 && (
          <div className="space-y-3">
            {activeMessages.map((message) => (
              <Alert
                key={message.id}
                className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <AlertDescription className="flex-1">
                    <div className="font-semibold text-blue-900 dark:text-white">
                      {message.title}
                    </div>
                    <div className="text-blue-700 dark:text-gray-100 mt-1">
                      {message.content}
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Stats Grid with glassmorphism cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={`
                  border-0 shadow-xl shadow-purple-500/10 backdrop-blur-sm 
                  bg-gradient-to-br ${stat.bgGradient} 
                  hover:shadow-2xl hover:shadow-purple-500/20 
                  transition-all duration-500 hover:scale-105 
                  rounded-3xl overflow-hidden group cursor-pointer
                  float-animation
                `}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-100">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r text-gray-800 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-200">
                        {stat.description}
                      </p>
                    </div>
                    <div
                      className={`
                        p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} 
                        group-hover:scale-110 group-hover:rotate-12 
                        transition-all duration-300 shadow-lg
                      `}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Swap Requests with modern card design */}
          <Card className="border-0 shadow-xl shadow-purple-500/10 backdrop-blur-sm bg-white/80 dark:bg-gray-800/95 rounded-3xl overflow-hidden transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="gradient-text-purple">Recent Swaps</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-100">
                Your latest skill exchange adventures
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {userSwapRequests.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-fit mx-auto">
                    <Rainbow className="h-12 w-12 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-white font-medium">
                      No swaps yet, but that's about to change!
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-100 mt-1">
                      Start browsing skills to begin your journey
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/browse")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl px-6 py-3 font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Exploring
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSwapRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {request.fromUserId === user.id ? "You" : "Someone"}{" "}
                            requested{" "}
                            <span className="text-purple-600 font-semibold">
                              {request.requestedSkill}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-100 mt-1">
                            Offering:{" "}
                            <span className="text-emerald-600 font-medium">
                              {request.offeredSkill}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-200 mt-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {request.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <Badge
                            className={`
                              text-xs font-medium px-3 py-1 rounded-full border-0
                              ${
                                request.status === "accepted"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                  : request.status === "pending"
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                    : request.status === "completed"
                                      ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                                      : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                              }
                            `}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userSwapRequests.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 rounded-2xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                      onClick={() => navigate("/swap-requests")}
                    >
                      View All Requests
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Overview with enhanced design */}
          <Card className="border-0 shadow-xl shadow-purple-500/10 backdrop-blur-sm bg-white/80 rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Your Skills
                </span>
              </CardTitle>
              <CardDescription className="dark:text-gray-100">
                Your superpowers and learning aspirations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-200">
                    Skills You Offer ({user.skillsOffered.length})
                  </h4>
                </div>
                {user.skillsOffered.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-100 italic">
                    Add some skills to start sharing your expertise! ✨
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.slice(0, 5).map((skill, index) => (
                      <Badge
                        key={skill.id}
                        className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-medium hover:scale-105 transition-transform duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                    {user.skillsOffered.length > 5 && (
                      <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300 px-3 py-1 rounded-full">
                        +{user.skillsOffered.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-700 dark:text-blue-200">
                    Learning Goals ({user.skillsWanted.length})
                  </h4>
                </div>
                {user.skillsWanted.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-100 italic">
                    What would you love to learn? Add your wishlist! 🎯
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.slice(0, 5).map((skill, index) => (
                      <Badge
                        key={skill.id}
                        className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium hover:scale-105 transition-transform duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                    {user.skillsWanted.length > 5 && (
                      <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300 px-3 py-1 rounded-full">
                        +{user.skillsWanted.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={() => navigate("/profile")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl py-3 font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 group"
              >
                <BookOpen className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Manage Your Skills
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
