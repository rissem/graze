import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Link,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FeedsService } from "../../client/sdk.gen";
import { FeedCreate } from "../../client/types.gen";
import { 
  Card, 
  CardBody, 
  CardHeader
} from "../../components/ui/card";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Field } from "../../components/ui/field";
import useCustomToast from "../../hooks/useCustomToast";

export const Route = createFileRoute("/_layout/feeds")({
  component: FeedsPage,
});

function FeedsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  // Query to fetch user's feeds
  const {
    data: userFeeds,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userFeeds"],
    queryFn: () => FeedsService.readUserFeeds(),
  });

  // Mutation to create a new feed
  const createFeedMutation = useMutation({
    mutationFn: (feedData: FeedCreate) =>
      FeedsService.createFeed({ requestBody: feedData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFeeds"] });
      showSuccessToast("The feed has been added successfully.");
      setIsOpen(false);
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to add feed");
    },
  });

  // Mutation to unfollow a feed
  const unfollowFeedMutation = useMutation({
    mutationFn: (feedId: string) => FeedsService.unfollowFeed({ feed_id: feedId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFeeds"] });
      showSuccessToast("You've unfollowed this feed.");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to unfollow feed");
    },
  });

  // Form for adding a new feed
  const { register, handleSubmit, reset } = useForm<FeedCreate>();

  const onSubmit = (data: FeedCreate) => {
    createFeedMutation.mutate(data);
    reset();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">My Feeds</Heading>
        <DialogRoot
          open={isOpen}
          onOpenChange={({ open }) => setIsOpen(open)}
        >
          <DialogTrigger asChild>
            <Button colorScheme="teal">Add New Feed</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogCloseTrigger />
              <DialogHeader>
                <DialogTitle>Add New Feed</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Stack gap={4}>
                  <Field label="Feed Name">
                    <Input {...register("name", { required: true })} placeholder="My Favorite Blog" />
                  </Field>
                  <Field label="Feed URL">
                    <Input
                      {...register("url", { required: true })}
                      placeholder="https://example.com/feed.xml"
                    />
                  </Field>
                  <Field label="Description">
                    <Input
                      {...register("description")}
                      placeholder="A brief description of this feed"
                    />
                  </Field>
                </Stack>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline" mr={3}>
                    Cancel
                  </Button>
                </DialogActionTrigger>
                <Button
                  colorScheme="teal"
                  type="submit"
                  loading={createFeedMutation.isPending}
                >
                  Add Feed
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogRoot>
      </HStack>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : isError ? (
        <Box textAlign="center" py={10}>
          <Text color="red.500">Error loading feeds: {(error as Error).message}</Text>
        </Box>
      ) : userFeeds?.data.length === 0 ? (
        <Card>
          <CardBody>
            <Text textAlign="center">
              You haven't subscribed to any feeds yet. Click "Add New Feed" to get started.
            </Text>
          </CardBody>
        </Card>
      ) : (
        <VStack gap={4} align="stretch">
          {userFeeds?.data.map((feed) => (
            <Card key={feed.id}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">{feed.name}</Heading>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => unfollowFeedMutation.mutate(feed.id)}
                    loading={unfollowFeedMutation.isPending}
                  >
                    Unfollow
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <Text mb={2}>{feed.description || "No description available"}</Text>
                <Link href={feed.url} color="teal.500">
                  {feed.url}
                </Link>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Container>
  );
} 