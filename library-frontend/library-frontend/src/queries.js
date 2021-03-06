import { gql } from '@apollo/client'


export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }`

export const FAVORITE_BOOKS = gql`
  query favorite_books($genre: String!){
    favoriteBooks (genre: $genre) {
      title
      published
      author {
        name
        born
        bookCount
      }
      genres
      id
    }
  }`

export const CURRENT_USER = gql`
  query {
    me {
    username
    favoriteGenre
    }
  }`
export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount 
    }
  }`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      author {
        name
        born
        bookCount
      }
      genres
      id
    }
  }`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,,
      published: $published,
      genres: $genres
    ) {
      title
      author {
        name
        born
        bookCount
      }
      published
      genres
    }
  }`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      name
      born
    }
  }`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      author {
        name
      }
      genres
      id
    }
  }`