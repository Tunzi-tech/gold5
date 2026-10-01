import { computed, type Ref } from 'vue'
import type { Post } from '../types/social'

export function usePosts(posts: Ref<Post[]>, search: Ref<string>) {
  const filteredPosts = computed(() => {
    if (!search.value.trim()) return posts.value

    const q = search.value.toLowerCase()

    return posts.value.filter(
      post =>
        post.content.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.zone?.toLowerCase().includes(q)
    )
  })

  function likePost(post: Post) {
    post.liked = !post.liked
    post.likes += post.liked ? 1 : -1
  }

  function createPost(content: string) {
    if (!content.trim()) return null

    const post: Post = {
      id: Date.now(),
      author: 'You',
      handle: '@you',
      avatar: 'YO',
      time: 'now',
      content: content.trim(),
      likes: 0,
      comments: 0,
      liked: false
    }

    posts.value.unshift(post)
    return post
  }

  return {
    filteredPosts,
    likePost,
    createPost
  }
}
