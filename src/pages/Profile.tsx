import React, { useState } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Clock,
  Plus,
  X,
  Edit,
  Save,
  Camera,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { Skill } from "@/types";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    isPublic: user?.isPublic || true,
    availability: user?.availability || [],
  });

  const [newSkillOffered, setNewSkillOffered] = useState({
    name: "",
    category: "",
    description: "",
    level: "beginner" as Skill["level"],
  });

  const [newSkillWanted, setNewSkillWanted] = useState({
    name: "",
    category: "",
    description: "",
    level: "beginner" as Skill["level"],
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const availabilityOptions = [
    "weekdays",
    "weekends",
    "mornings",
    "afternoons",
    "evenings",
  ];

  const skillCategories = [
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

  const skillLevels = ["beginner", "intermediate", "advanced", "expert"];

  const handleSaveProfile = () => {
    updateProfile(formData);
    setIsEditing(false);
    setSaveMessage("Profile updated successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleAvailabilityChange = (option: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: checked
        ? [...prev.availability, option]
        : prev.availability.filter((item) => item !== option),
    }));
  };

  const addSkillOffered = () => {
    if (!newSkillOffered.name.trim()) return;

    const skill: Skill = {
      id: `skill-${Date.now()}`,
      name: newSkillOffered.name,
      category: newSkillOffered.category,
      description: newSkillOffered.description,
      level: newSkillOffered.level,
      isApproved: false,
    };

    updateProfile({
      skillsOffered: [...user.skillsOffered, skill],
    });

    setNewSkillOffered({
      name: "",
      category: "",
      description: "",
      level: "beginner",
    });
  };

  const addSkillWanted = () => {
    if (!newSkillWanted.name.trim()) return;

    const skill: Skill = {
      id: `skill-${Date.now()}`,
      name: newSkillWanted.name,
      category: newSkillWanted.category,
      description: newSkillWanted.description,
      level: newSkillWanted.level,
      isApproved: false,
    };

    updateProfile({
      skillsWanted: [...user.skillsWanted, skill],
    });

    setNewSkillWanted({
      name: "",
      category: "",
      description: "",
      level: "beginner",
    });
  };

  const removeSkillOffered = (skillId: string) => {
    updateProfile({
      skillsOffered: user.skillsOffered.filter((skill) => skill.id !== skillId),
    });
  };

  const removeSkillWanted = (skillId: string) => {
    updateProfile({
      skillsWanted: user.skillsWanted.filter((skill) => skill.id !== skillId),
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your skills and availability
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {saveMessage && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {saveMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your public profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full p-2"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPublic: !!checked,
                        }))
                      }
                      disabled={!isEditing}
                    />
                    <Label
                      htmlFor="isPublic"
                      className="flex items-center gap-2"
                    >
                      {formData.isPublic ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                      Make profile public
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    {user.rating.toFixed(1)} rating ({user.reviewCount} reviews)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability
            </CardTitle>
            <CardDescription>
              When are you typically available for skill exchanges?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availabilityOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={formData.availability.includes(option)}
                    onCheckedChange={(checked) =>
                      handleAvailabilityChange(option, !!checked)
                    }
                    disabled={!isEditing}
                  />
                  <Label
                    htmlFor={option}
                    className="text-sm font-normal capitalize"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Offered */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Skills You Offer</CardTitle>
            <CardDescription>
              Skills you can teach or help others with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                >
                  <div className="flex-1">
                    <span className="font-medium text-green-800">
                      {skill.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs border-green-300"
                    >
                      {skill.level}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSkillOffered(skill.id)}
                    className="text-red-500 hover:text-red-700 h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Add New Skill</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Skill name (e.g., Photoshop)"
                  value={newSkillOffered.name}
                  onChange={(e) =>
                    setNewSkillOffered((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <Select
                  value={newSkillOffered.category}
                  onValueChange={(value) =>
                    setNewSkillOffered((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Textarea
                  placeholder="Brief description of your expertise"
                  value={newSkillOffered.description}
                  onChange={(e) =>
                    setNewSkillOffered((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
                <Select
                  value={newSkillOffered.level}
                  onValueChange={(value) =>
                    setNewSkillOffered((prev) => ({
                      ...prev,
                      level: value as Skill["level"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addSkillOffered} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills Wanted */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">
              Skills You Want to Learn
            </CardTitle>
            <CardDescription>
              Skills you're looking to learn or improve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                >
                  <div className="flex-1">
                    <span className="font-medium text-blue-800">
                      {skill.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs border-blue-300"
                    >
                      {skill.level}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSkillWanted(skill.id)}
                    className="text-red-500 hover:text-red-700 h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Add New Skill Interest</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Skill name (e.g., Spanish)"
                  value={newSkillWanted.name}
                  onChange={(e) =>
                    setNewSkillWanted((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <Select
                  value={newSkillWanted.category}
                  onValueChange={(value) =>
                    setNewSkillWanted((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Textarea
                  placeholder="What specifically do you want to learn?"
                  value={newSkillWanted.description}
                  onChange={(e) =>
                    setNewSkillWanted((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
                <Select
                  value={newSkillWanted.level}
                  onValueChange={(value) =>
                    setNewSkillWanted((prev) => ({
                      ...prev,
                      level: value as Skill["level"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Desired level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={addSkillWanted}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill Interest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
