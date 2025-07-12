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
      color: "text-blue-600",
    },
    {
      title: "Skills Wanted",
      value: user.skillsWanted.length,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Pending Requests",
      value: pendingRequests.length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Active Swaps",
      value: activeSwaps.length,
      icon: MessageSquare,
      color: "text-indigo-600",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Ready to learn something new or share your expertise?
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <Button onClick={() => navigate("/browse")}>
              <Users className="h-4 w-4 mr-2" />
              Browse Skills
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </div>

        {/* Admin Messages */}
        {activeMessages.length > 0 && (
          <div className="space-y-2">
            {activeMessages.map((message) => (
              <Alert key={message.id} className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">{message.title}</div>
                  <div className="text-sm mt-1">{message.content}</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Swap Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Swap Requests
              </CardTitle>
              <CardDescription>
                Your latest skill exchange activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userSwapRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No swap requests yet</p>
                  <p className="text-sm">Start browsing skills to connect!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSwapRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {request.fromUserId === user.id ? "You" : "Someone"}{" "}
                          requested {request.requestedSkill}
                        </p>
                        <p className="text-sm text-gray-600">
                          Offering: {request.offeredSkill}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <Badge
                          variant={
                            request.status === "accepted"
                              ? "default"
                              : request.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {userSwapRequests.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/swap-requests")}
                    >
                      View All Requests
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Skills
              </CardTitle>
              <CardDescription>
                Skills you offer and want to learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">
                    Skills You Offer ({user.skillsOffered.length})
                  </h4>
                  {user.skillsOffered.length === 0 ? (
                    <p className="text-sm text-gray-500">No skills added yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.skillsOffered.slice(0, 5).map((skill) => (
                        <Badge key={skill.id} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                      {user.skillsOffered.length > 5 && (
                        <Badge variant="outline">
                          +{user.skillsOffered.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-blue-700">
                    Skills You Want ({user.skillsWanted.length})
                  </h4>
                  {user.skillsWanted.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No skills requested yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.skillsWanted.slice(0, 5).map((skill) => (
                        <Badge key={skill.id} variant="outline">
                          {skill.name}
                        </Badge>
                      ))}
                      {user.skillsWanted.length > 5 && (
                        <Badge variant="outline">
                          +{user.skillsWanted.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/profile")}
                >
                  Manage Skills
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
