
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { ALL_BOOKS, BOOK_ADDED, FAVORITE_BOOKS } from './queries'
import { useApolloClient, useLazyQuery, useSubscription } from '@apollo/client'

const App = () => {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const [favorites, setFavorites] = useState(null)
  const [favoriteBooks, {loading, data}] = useLazyQuery(FAVORITE_BOOKS)

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(p => p.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook)}
      })
    }
  }

  const handleToken = (token) => {
    setToken(token)
  }

  const handleUser = (user) => {
    setUser(user)
  }
  
    useSubscription(BOOK_ADDED, {
      onSubscriptionData: ({ subscriptionData }) => {
        console.log(subscriptionData)
        updateCacheWith(subscriptionData.data.bookAdded)
        
        if(subscriptionData) {
          window.alert(`${subscriptionData.data.bookAdded.title} was added`);
        }
      }
    })
 
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