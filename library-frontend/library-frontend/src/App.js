
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState('login')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const handleToken = (token) => {
    setToken(token)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  const changePage = () => {
    setPage('authors')
  }

  
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { token && <button onClick={() => setPage('add')}>add book</button>}
      
      {
        token ? <button onClick={logout}>logout</button> :
        <button onClick={() => setPage('login')}>login</button>
      }
      </div>

      <LoginForm
        changePage={changePage}
        setToken={handleToken}
        show={page === 'login'} />

      <Authors
        token={token}
        show={page === 'authors'}
      />

      <Books
        token={token}
        show={page === 'books'}
      />

    { token &&
      <NewBook
        token={token}
        show={page === 'add'}
      />
      
    }

    </div>
  )
}

export default App