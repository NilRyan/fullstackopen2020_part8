require('dotenv').config()
const { ApolloServer, gql, UserInputError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')
const pubsub = new PubSub()

const JWT_SECRET = process.env.SECRET
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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
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
    favoriteBooks(genre: String!): [Book!]!
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token 
  }
  type Subscription {
    bookAdded: Book!
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
    favoriteBooks: (root, args) => {
      return Book.find({ 
        genres: { $in: [ args.genre ]}
      }).populate('author')
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const { currentUser } = context

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const doesAuthorExist = await Author.exists({ name: args.author })

      console.log('exist?',doesAuthorExist)
      try {
        if(doesAuthorExist === false) {
          const newAuthor = new Author ({ name: args.author})
          const newAuthorID = await newAuthor.save()
          console.log('newAuthor?', newAuthorID)
  
          const book = new Book ({ ...args, author: newAuthorID._id })
          const bookAdded = (await book.save()).populate('author').execPopulate()

          pubsub.publish('BOOK_ADDED', { bookAdded })
          return bookAdded
        }
  
      const existingAuthor = await Author.find({ name: args.author})
      console.log(existingAuthor[0]._id)
      const id = existingAuthor[0]._id;
  
      const book = new Book ({ ...args, author: id })
      const bookAdded = (await book.save()).populate('author').execPopulate()

      pubsub.publish('BOOK_ADDED', { bookAdded })
      return bookAdded
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

    },
    editAuthor: async (root, args, context) => {
      const { currentUser } = context

      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const existingAuthor = await Author.find({ name: args.name})
      const authorID = existingAuthor[0]._id

      const updatedAuthor = {
        name: args.name,
        born: args.setBornTo
      }
      
      return Author.findByIdAndUpdate(authorID, updatedAuthor, { new: true })
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'password') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET)}
    }
  },
  Author: {
    bookCount: async (root) => {
      const existingAuthor = await Author.find({ name: root.name})
      const authorID = existingAuthor[0]._id
      const number = Book.countDocuments({ author: authorID })
      return number
    }
  }, 
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')){
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})