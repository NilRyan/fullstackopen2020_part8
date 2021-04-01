import React, { useState } from 'react'
import { ALL_BOOKS } from '../queries'
import { useQuery } from '@apollo/client'

const Books = (props) => {
  const {loading, data} = useQuery(ALL_BOOKS)
  const [showGenre, setShowGenre] = useState('ALL')
  if (!props.show) {
    return null
  }

  if(loading) {
    return (
      <div>
        loading...
      </div>
    )
  }

  const books = [...data.allBooks]
  const allGenres = ['ALL', ...new Set (books.map((book) => book.genres).flat())]
  
  console.log(allGenres)

  return (
    <div>
      <h2>books</h2>
      <h1>in genre {showGenre} </h1>
    <div>
      <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                author
              </th>
              <th>
                published
              </th>
            </tr>
            
            {books.filter((book) => showGenre === 'ALL' ? true : book.genres.includes(showGenre))
              .map(a =>
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            )}
          </tbody>
        </table>
    </div>
      {
        allGenres.map((genre) => <button key={genre} onClick={() => setShowGenre(genre)}>{genre}</button>)
      }
    <div>
      
    </div>
    </div>
  )
}

export default Books