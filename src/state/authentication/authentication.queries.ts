import type { User } from './types.ts'

type UserInput = {
  userName: string
  password: string
}
const timer = (delay: number, data: unknown) => new Promise((resolve) => setTimeout(() => resolve(data), delay))

export const loginQuery = async ({ userName, password }: UserInput) => {
  console.log('do login', userName, password)

  const user = await timer(5000, {
    name: 'me',
  })

  return user as User
}
