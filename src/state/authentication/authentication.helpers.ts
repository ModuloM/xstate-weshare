import type { AuthenticationInfo, User } from './types.ts'

const AUTHENTICATION_KEY = 'authenticationInfo'
export const getAuthentication = () => {
  console.log('retrieve authentication info')
  const authenticationData = localStorage.getItem(AUTHENTICATION_KEY)

  if (authenticationData && authenticationData != '') {
    return JSON.parse(authenticationData) as AuthenticationInfo
  }

  return null
}

export const setAuthenticationInfo = (user: User) => {
  console.log('save authentication info')

  localStorage.setItem(AUTHENTICATION_KEY, JSON.stringify({ user }))
}

export const deleteAuthenticationInfo = () => {
  localStorage.setItem(AUTHENTICATION_KEY, '')
}