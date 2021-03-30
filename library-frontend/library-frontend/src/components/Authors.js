  
import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client';
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from '../queries'

const Authors = (props) => {
  const {loading, data} = useQuery(ALL_AUTHORS)
  const [author, setAuthor] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS}, { query: ALL_BOOKS } ]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    editAuthor({ variables: { name: author, setBornTo: birthYear}})
  }

  if (!props.show) {
    return null
  }
 

  if(loading) {
    return (
      <div>loading...</div>
    )
  }

  const authors = [...data.allAuthors]
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div>
        <h1>Set birthyear</h1>
        <form onSubmit={handleSubmit} >
          <div>
            <select onChange={(e) => setAuthor(e.target.value)}>
              {authors.map((author) => <option key={author.name} value={author.name}>
              {author.name}
              </option>)}
            </select>
          </div>
        
          <div>
            born:<input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}/>
          </div>
          <button type="submit">update author</button>
        </form>

      </div>
    </div>
  )
}

export default Authors
