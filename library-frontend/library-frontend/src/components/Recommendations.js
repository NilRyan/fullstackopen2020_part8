import React, { useState } from 'react'


const Recommendations = ({user, show, favoriteBooks}) => {
  
  
  if (!show) {
    return null
  }

  
  return (
    <div>
      <h1>Recommendations</h1>

      <p>books in your favorite genre <b>{user.favoriteGenre}</b></p>
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
            
            {favoriteBooks && favoriteBooks
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
    </div>
  )
}

export default Recommendations
