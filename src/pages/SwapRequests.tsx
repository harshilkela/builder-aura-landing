import React, { useState } from "react";
import AppLayout from "@/components/Layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import { Button } from "@/components/ui/button";
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
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import { SwapRequest } from "@/types";

const SwapRequests = () => {
  const { user } = useAuth();
  const { swapRequests, updateSwapRequest, deleteSwapRequest, addReview } =
    useSkillSwap();
  const navigate = useNavigate();

  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    swapRequest: null as SwapRequest | null,
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const userSwapRequests = swapRequests.filter(
    (request) => request.fromUserId === user.id || request.toUserId === user.id,
  );

  const incomingRequests = userSwapRequests.filter(
    (request) => request.toUserId === user.id && request.status === "pending",
  );

  const outgoingRequests = userSwapRequests.filter(
    (request) => request.fromUserId === user.id && request.status === "pending",
  );

  const activeSwaps = userSwapRequests.filter(
    (request) => request.status === "accepted",
  );

  const completedSwaps = userSwapRequests.filter(
    (request) => request.status === "completed",
  );

  const handleAcceptRequest = (requestId: string) => {
    updateSwapRequest(requestId, "accepted");
  };

  const handleRejectRequest = (requestId: string) => {
    updateSwapRequest(requestId, "rejected");
  };

  const handleCompleteSwap = (requestId: string) => {
    updateSwapRequest(requestId, "completed");
    const request = swapRequests.find((r) => r.id === requestId);
    if (request) {
      setReviewDialog({ open: true, swapRequest: request });
    }
  };

  const handleDeleteRequest = (requestId: string) => {
    deleteSwapRequest(requestId);
  };

  const submitReview = () => {
    if (!reviewDialog.swapRequest) return;

    const isReviewerFromUser = reviewDialog.swapRequest.fromUserId === user.id;
    const revieweeId = isReviewerFromUser
      ? reviewDialog.swapRequest.toUserId
      : reviewDialog.swapRequest.fromUserId;

    addReview({
      swapRequestId: reviewDialog.swapRequest.id,
      reviewerId: user.id,
      revieweeId: revieweeId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });

    setReviewDialog({ open: false, swapRequest: null });
    setReviewData({ rating: 5, comment: "" });
  };

  const getOtherUserName = (request: SwapRequest) => {
    // In a real app, you'd look up the user by ID
    return request.fromUserId === user.id ? "Other User" : "Requester";
  };

  const RequestCard: React.FC<{
    request: SwapRequest;
    type: "incoming" | "outgoing" | "active" | "completed";
  }> = ({ request, type }) => {
    const isFromCurrentUser = request.fromUserId === user.id;
    const otherUserName = getOtherUserName(request);

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {otherUserName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-medium">
                    {isFromCurrentUser ? "You" : otherUserName} requested{" "}
                    <span className="text-blue-600">
                      {request.requestedSkill}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Offering:{" "}
                    <span className="text-green-600">
                      {request.offeredSkill}
                    </span>
                  </p>
                </div>
                {request.message && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm italic">"{request.message}"</p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {request.createdAt.toLocaleDateString()}
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
                    className="text-xs"
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              {type === "incoming" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {type === "outgoing" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteRequest(request.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
              {type === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCompleteSwap(request.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
            <p className="text-gray-600 mt-1">
              Manage your skill exchange requests and activities
            </p>
          </div>
          <Button onClick={() => navigate("/browse")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Browse Skills
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incoming" className="relative">
              Incoming
              {incomingRequests.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                >
                  {incomingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeSwaps.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedSwaps.length})
            </TabsTrigger>
          </TabsList>

          {/* Incoming Requests */}
          <TabsContent value="incoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Requests for You
                </CardTitle>
                <CardDescription>
                  People who want to learn your skills
                </CardDescription>
              </CardHeader>
            </Card>
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No incoming requests
                  </h3>
                  <p className="text-gray-600">
                    When someone wants to learn from you, their requests will
                    appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="incoming"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Outgoing Requests */}
          <TabsContent value="outgoing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Your Pending Requests
                </CardTitle>
                <CardDescription>
                  Requests you've sent to others
                </CardDescription>
              </CardHeader>
            </Card>
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No outgoing requests
                  </h3>
                  <p className="text-gray-600">
                    Browse skills and send requests to start learning!
                  </p>
                  <Button className="mt-4" onClick={() => navigate("/browse")}>
                    Browse Skills
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="outgoing"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Swaps */}
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Active Skill Swaps
                </CardTitle>
                <CardDescription>
                  Accepted exchanges in progress
                </CardDescription>
              </CardHeader>
            </Card>
            {activeSwaps.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No active swaps
                  </h3>
                  <p className="text-gray-600">
                    Once someone accepts your request or you accept theirs, it
                    will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeSwaps.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="active"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Swaps */}
          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Completed Swaps
                </CardTitle>
                <CardDescription>Your skill exchange history</CardDescription>
              </CardHeader>
            </Card>
            {completedSwaps.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No completed swaps yet
                  </h3>
                  <p className="text-gray-600">
                    Your completed skill exchanges will be shown here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedSwaps.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    type="completed"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog
          open={reviewDialog.open}
          onOpenChange={(open) =>
            setReviewDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rate Your Experience</DialogTitle>
              <DialogDescription>
                How was your skill exchange with{" "}
                {reviewDialog.swapRequest &&
                  getOtherUserName(reviewDialog.swapRequest)}
                ?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={reviewData.rating.toString()}
                  onValueChange={(value) =>
                    setReviewData((prev) => ({
                      ...prev,
                      rating: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                    <SelectItem value="2">⭐⭐ Below Average</SelectItem>
                    <SelectItem value="1">⭐ Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comment (optional)</Label>
                <Textarea
                  placeholder="Share your experience..."
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitReview} className="w-full">
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default SwapRequests;
