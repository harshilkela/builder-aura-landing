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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  MessageCircle,
  Filter,
  Clock,
  User,
} from "lucide-react";
import { User as UserType } from "@/types";

const Browse = () => {
  const { user } = useAuth();
  const { createSwapRequest } = useSkillSwap();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [swapRequestDialog, setSwapRequestDialog] = useState({
    open: false,
    targetUser: null as UserType | null,
    targetSkill: "",
  });
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  // Mock users data with skills (in real app, this would come from context/API)
  const mockUsers: UserType[] = [
    {
      id: "user-2",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      location: "Austin, TX",
      profilePhoto: "",
      isPublic: true,
      availability: ["weekends"],
      skillsOffered: [
        {
          id: "skill-4",
          name: "Spanish",
          category: "Language",
          description: "Native Spanish speaker, can teach all levels",
          level: "expert",
          isApproved: true,
        },
        {
          id: "skill-5",
          name: "Yoga",
          category: "Fitness",
          description: "Certified yoga instructor with 5 years experience",
          level: "expert",
          isApproved: true,
        },
      ],
      skillsWanted: [
        {
          id: "skill-6",
          name: "Excel",
          category: "Office",
          description: "Advanced Excel formulas and pivot tables",
          level: "intermediate",
          isApproved: true,
        },
      ],
      rating: 4.9,
      reviewCount: 8,
      joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      isBanned: false,
      role: "user",
    },
    {
      id: "user-3",
      name: "Mike Chen",
      email: "mike@example.com",
      location: "Seattle, WA",
      profilePhoto: "",
      isPublic: true,
      availability: ["evenings", "weekends"],
      skillsOffered: [
        {
          id: "skill-7",
          name: "Guitar",
          category: "Music",
          description: "10+ years playing acoustic and electric guitar",
          level: "advanced",
          isApproved: true,
        },
        {
          id: "skill-8",
          name: "Python",
          category: "Programming",
          description: "Backend development and data analysis",
          level: "expert",
          isApproved: true,
        },
      ],
      skillsWanted: [
        {
          id: "skill-9",
          name: "Photography",
          category: "Arts",
          description: "Portrait and landscape photography",
          level: "intermediate",
          isApproved: true,
        },
      ],
      rating: 4.7,
      reviewCount: 15,
      joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      isBanned: false,
      role: "user",
    },
    {
      id: "user-4",
      name: "Emma Davis",
      email: "emma@example.com",
      location: "Boston, MA",
      profilePhoto: "",
      isPublic: true,
      availability: ["weekdays", "mornings"],
      skillsOffered: [
        {
          id: "skill-10",
          name: "Cooking",
          category: "Cooking",
          description: "Italian and French cuisine, baking",
          level: "advanced",
          isApproved: true,
        },
        {
          id: "skill-11",
          name: "Excel",
          category: "Office",
          description: "Advanced formulas, macros, and data visualization",
          level: "expert",
          isApproved: true,
        },
      ],
      skillsWanted: [
        {
          id: "skill-12",
          name: "Fitness Training",
          category: "Fitness",
          description: "Personal training and workout planning",
          level: "beginner",
          isApproved: true,
        },
      ],
      rating: 4.8,
      reviewCount: 22,
      joinedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      isBanned: false,
      role: "user",
    },
  ];

  const categories = [
    "Programming",
    "Design",
    "Language",
    "Music",
    "Sports",
    "Cooking",
    "Business",
    "Arts",
    "Fitness",
    "Office",
    "Other",
  ];

  const filteredUsers = mockUsers.filter((otherUser) => {
    if (otherUser.id === user.id || !otherUser.isPublic) return false;

    const matchesSearch = searchTerm
      ? otherUser.skillsOffered.some((skill) =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : true;

    const matchesCategory =
      selectedCategory === "all"
        ? true
        : otherUser.skillsOffered.some(
            (skill) => skill.category === selectedCategory,
          );

    const matchesLevel =
      selectedLevel === "all"
        ? true
        : otherUser.skillsOffered.some(
            (skill) => skill.level === selectedLevel,
          );

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const openSwapRequestDialog = (targetUser: UserType, skillName: string) => {
    setSwapRequestDialog({
      open: true,
      targetUser,
      targetSkill: skillName,
    });
    setRequestMessage("");
    setSelectedOfferedSkill("");
  };

  const sendSwapRequest = () => {
    if (!swapRequestDialog.targetUser || !selectedOfferedSkill) return;

    createSwapRequest({
      fromUserId: user.id,
      toUserId: swapRequestDialog.targetUser.id,
      requestedSkill: swapRequestDialog.targetSkill,
      offeredSkill: selectedOfferedSkill,
      message: requestMessage,
    });

    setSwapRequestDialog({ open: false, targetUser: null, targetSkill: "" });
    setRequestMessage("");
    setSelectedOfferedSkill("");

    // Show success message or redirect
    navigate("/swap-requests");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Skills</h1>
            <p className="text-gray-600 mt-1">
              Find people to learn from and share knowledge with
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search skills (e.g., Photoshop, Spanish, Guitar)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((otherUser) => (
            <Card key={otherUser.id} className="h-fit">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser.profilePhoto} />
                    <AvatarFallback>
                      {otherUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {otherUser.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {otherUser.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {otherUser.rating.toFixed(1)} ({otherUser.reviewCount})
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Skills Offered */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">
                    Skills Offered
                  </h4>
                  <div className="space-y-2">
                    {otherUser.skillsOffered.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {skill.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs border-green-300"
                          >
                            {skill.level}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {skill.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            openSwapRequestDialog(otherUser, skill.name)
                          }
                          className="ml-2"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Request
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Wanted */}
                {otherUser.skillsWanted.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-blue-700">
                      Looking to Learn
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {otherUser.skillsWanted.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Available
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {otherUser.availability.map((time) => (
                      <Badge
                        key={time}
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new
                members.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Swap Request Dialog */}
        <Dialog
          open={swapRequestDialog.open}
          onOpenChange={(open) =>
            setSwapRequestDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request Skill Swap</DialogTitle>
              <DialogDescription>
                Send a swap request to learn {swapRequestDialog.targetSkill}{" "}
                from {swapRequestDialog.targetUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What skill will you offer in return?</Label>
                <Select
                  value={selectedOfferedSkill}
                  onValueChange={setSelectedOfferedSkill}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a skill to offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.skillsOffered.map((skill) => (
                      <SelectItem key={skill.id} value={skill.name}>
                        {skill.name} ({skill.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Personal message (optional)</Label>
                <Textarea
                  placeholder="Hi! I'd love to learn about..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={sendSwapRequest}
                disabled={!selectedOfferedSkill}
                className="w-full"
              >
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Browse;
