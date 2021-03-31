require('dotenv').config()
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const { v1: uuid } = require('uuid')

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MONGODB:', error.message)
  })


const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
    
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: async (root, args) => {
    
      if(args.author && args.genre){
        const existingAuthor = await Author.find({ name: args.author})
        const authorID = existingAuthor[0]._id
        return  Book.find({ 
          author: authorID,
          genres: { $in: [ args.genre ]}
        }).populate('author')
      }
      else if (args.author) {
        const existingAuthor = await Author.find({ name: args.author})
        const authorID = existingAuthor[0]._id
        return Book.find({ author: authorID}).populate('author')
      } else if (args.genre) {
        return Book.find({genres: { $in: [args.genre] }}).populate('author')
      } 
      return Book.find({}).populate('author')
    },
    allAuthors: () => Author.find({})
  },
  Mutation: {
    addBook: async (root, args) => {

      const doesAuthorExist = await Author.exists({ name: args.author })

      console.log('exist?',doesAuthorExist)
      try {
        if(doesAuthorExist === false) {
          const newAuthor = new Author ({ name: args.author})
          const newAuthorID = await newAuthor.save()
          console.log('newAuthor?', newAuthorID)
  
          const book = new Book ({ ...args, author: newAuthorID._id })
          return book.save().then(a => a.populate('author').execPopulate())
        }
  
      const existingAuthor = await Author.find({ name: args.author})
      console.log(existingAuthor[0]._id)
      const id = existingAuthor[0]._id;
  
      const book = new Book ({ ...args, author: id })
      return book.save().then(a => a.populate('author').execPopulate())
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

    },
    editAuthor: async (root, args) => {
      const existingAuthor = await Author.find({ name: args.name})
      const authorID = existingAuthor[0]._id

      const updatedAuthor = {
        name: args.name,
        born: args.setBornTo
      }
      
      return Author.findByIdAndUpdate(authorID, updatedAuthor, { new: true })
    }
  },
  Author: {
    bookCount: async (root) => {
      const existingAuthor = await Author.find({ name: root.name})
      const authorID = existingAuthor[0]._id
      const number = Book.countDocuments({ author: authorID })
      return number
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})