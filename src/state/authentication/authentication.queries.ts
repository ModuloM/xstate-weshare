type UserInput = {
  userName: string
  password: string
}
const timer = (delay: number) => new Promise((_, reject) => setTimeout(() => {
  const error = new Error('MFA needed')
  error.name = 'MFA'
  reject(error)
}, delay))

export const loginQuery = async ({ userName, password }: UserInput) => {
  console.log('do login', userName, password)

  return await timer(1000) as Promise<Error>
}
