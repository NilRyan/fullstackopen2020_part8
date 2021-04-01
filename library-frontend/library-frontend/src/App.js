
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { FAVORITE_BOOKS } from './queries'
import { useApolloClient, useLazyQuery } from '@apollo/client'

const App = () => {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const [favorites, setFavorites] = useState(null)
  const [favoriteBooks, {loading, data}] = useLazyQuery(FAVORITE_BOOKS)

  const handleToken = (token) => {
    setToken(token)
  }

  const handleUser = (user) => {
    setUser(user)
  }
  
 
  useEffect(() => {
    if (data && data.favoriteBooks) {
      setFavorites(data.favoriteBooks)
      console.log(user.favoriteGenre)
      console.log('favorites-effect', favorites)
    }
  }, [data])


 
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  const changePage = () => {
    setPage('authors')
  }

  console.log(user)
  console.log('favorites', favorites)

  
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { token && <button onClick={() => setPage('add')}>add book</button>}
        { token && <button onClick={() => {
          setPage('recommend')
          favoriteBooks({variables: { genre: user.favoriteGenre}})
        }
        }
          >recommend</button>}
      {
        token ? <button onClick={logout}>logout</button> :
        <button onClick={() => setPage('login')}>login</button>
      }
      </div>

      <LoginForm
        handleUser={handleUser}
        changePage={changePage}
        setToken={handleToken}
        show={page === 'login'} />

      <Recommendations show= { page === 'recommend'}
        favoriteBooks={favorites}
        user={user} />
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