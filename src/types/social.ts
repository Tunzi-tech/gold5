export type Page = {
  id: number
  name: string
  handle: string
  description: string
  followers: string
  avatar: string
  color: string
  followed: boolean
  category: string
}

export type Post = {
  id: number
  author: string
  handle: string
  avatar: string
  page?: string
  time: string
  content: string
  zone?: string
  image?: string
  likes: number
  comments: number
  liked: boolean
}

export type Person = {
  id: number
  name: string
  username: string
  avatar: string
  reason: string
  mutual: number
  followed: boolean
}
