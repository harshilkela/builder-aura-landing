import React, { useState } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  MessageSquare,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Download,
  Send,
  Settings,
  BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    users,
    swapRequests,
    reviews,
    adminMessages,
    banUser,
    approveSkill,
    rejectSkill,
    sendAdminMessage,
  } = useSkillSwap();
  const navigate = useNavigate();

  const [messageDialog, setMessageDialog] = useState({
    open: false,
  });
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    type: "info" as "info" | "warning" | "update",
  });

  if (!user || user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.isBanned).length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const totalSwaps = swapRequests.length;
  const pendingSwaps = swapRequests.filter(
    (s) => s.status === "pending",
  ).length;
  const completedSwaps = swapRequests.filter(
    (s) => s.status === "completed",
  ).length;

  const handleBanUser = (userId: string) => {
    banUser(userId);
  };

  const handleSendMessage = () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) return;

    sendAdminMessage({
      title: newMessage.title,
      content: newMessage.content,
      type: newMessage.type,
      isActive: true,
    });

    setMessageDialog({ open: false });
    setNewMessage({ title: "", content: "", type: "info" });
  };

  const downloadReport = () => {
    const reportData = {
      summary: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalSwaps,
        pendingSwaps,
        completedSwaps,
      },
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        rating: u.rating,
        reviewCount: u.reviewCount,
        isBanned: u.isBanned,
        skillsCount: u.skillsOffered.length + u.skillsWanted.length,
      })),
      swapRequests: swapRequests.map((s) => ({
        id: s.id,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillswap-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage users, monitor activities, and maintain platform quality
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            <Button
              variant="outline"
              onClick={downloadReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button onClick={() => setMessageDialog({ open: true })}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {activeUsers}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Swaps
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {totalSwaps}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Banned Users
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {bannedUsers}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="swaps">Swap Requests</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage platform users and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilePhoto} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.name}</h3>
                            {user.role === "admin" && (
                              <Badge variant="secondary">Admin</Badge>
                            )}
                            {user.isBanned && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            ⭐ {user.rating.toFixed(1)} ({user.reviewCount}{" "}
                            reviews) • {user.skillsOffered.length} skills
                            offered
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!user.isBanned && user.role !== "admin" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBanUser(user.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Ban
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swap Requests Tab */}
          <TabsContent value="swaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Swap Request Monitoring</CardTitle>
                <CardDescription>
                  Monitor all skill exchange activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {swapRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {request.requestedSkill} ↔ {request.offeredSkill}
                          </p>
                          <p className="text-sm text-gray-600">
                            From User {request.fromUserId} → To User{" "}
                            {request.toUserId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "accepted"
                              ? "default"
                              : request.status === "pending"
                                ? "secondary"
                                : request.status === "completed"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      {request.message && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          "{request.message}"
                        </div>
                      )}
                    </div>
                  ))}
                  {swapRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No swap requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills Moderation</CardTitle>
                <CardDescription>
                  Review and approve user skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.flatMap((user) =>
                    [...user.skillsOffered, ...user.skillsWanted].map(
                      (skill) => (
                        <div key={skill.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{skill.name}</h3>
                              <p className="text-sm text-gray-600">
                                {skill.category} • {skill.level}
                              </p>
                              <p className="text-sm text-gray-600">
                                By: {user.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {skill.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {skill.isApproved ? (
                                <Badge variant="default">Approved</Badge>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => approveSkill(skill.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectSkill(skill.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Messages</CardTitle>
                <CardDescription>
                  Manage platform-wide announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminMessages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{message.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {message.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              message.type === "warning"
                                ? "destructive"
                                : message.type === "update"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {message.type}
                          </Badge>
                          {message.isActive && (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Send Message Dialog */}
        <Dialog
          open={messageDialog.open}
          onOpenChange={(open) => setMessageDialog({ open })}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Platform Message</DialogTitle>
              <DialogDescription>
                Send a message to all platform users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select
                  value={newMessage.type}
                  onValueChange={(value) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      type: value as "info" | "warning" | "update",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">📢 Information</SelectItem>
                    <SelectItem value="warning">⚠️ Warning</SelectItem>
                    <SelectItem value="update">🚀 Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Message title"
                  value={newMessage.title}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Message content"
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSendMessage}
                disabled={
                  !newMessage.title.trim() || !newMessage.content.trim()
                }
                className="w-full"
              >
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
