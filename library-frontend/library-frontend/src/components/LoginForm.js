import { useMutation, useLazyQuery } from '@apollo/client'

import React, { useEffect, useState } from 'react'
import { LOGIN, CURRENT_USER } from '../queries'

const LoginForm = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN)
  const [getUser, {loading, data}] = useLazyQuery(CURRENT_USER)

  if(data && data.me) {
    props.handleUser(data.me)
  }
  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      props.setToken(token)
      localStorage.setItem('user-token', token)
    }
  }, [ result.data])
  
  const handleLogin = async (e) => {
    e.preventDefault()
    await login({ variables: { username, password }}).then(() => props.changePage())
    await getUser()
  }
  if (!props.show) {
    return null
  }

 
  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
         username<input value={username} onChange={(e) => setUsername(e.target.value) }></input>
        </div>
        <div>
          password<input autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value) }></input>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
