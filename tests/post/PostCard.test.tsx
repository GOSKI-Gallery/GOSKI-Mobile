import '../../jest.setup.js';
import React from "react";
import { render } from "@testing-library/react-native";
import PostCard from "../../components/post/PostCard";

jest.mock("../../states/useAuthStore", () => ({
  useAuthStore: jest.fn(() => ({ user: { id: "123" } })),
}));

jest.mock("../../components/ui/PostSkeleton", () => {
  const RN = jest.requireActual("react-native");
  return (props: any) => <RN.View {...props} testID="post-skeleton" />;
});

const mockPost = {
    id: '1',
    image_url: 'https://example.com/image.png',
    description: 'Test post description',
    users: {
      id: 'u1',
      username: 'testuser',
      profile_photo_url: 'https://example.com/avatar.png',
    },
  };

describe("PostCard", () => {
  it("renders loading state correctly", () => {
    const { getAllByTestId } = render(<PostCard isLoading={true} posts={[]} />);
    expect(getAllByTestId("post-skeleton")).toHaveLength(3);
  });

  it("renders empty state correctly", () => {
    const { getByText } = render(<PostCard isLoading={false} posts={[]} />);
    expect(getByText("Nenhum post registrado")).toBeTruthy();
  });

  it("renders posts correctly", () => {
    const posts = [mockPost, { ...mockPost, id: "2" }];
    const { getAllByText } = render(<PostCard isLoading={false} posts={posts} />);
    expect(getAllByText("Test post description").length).toBe(2);
  });
});
