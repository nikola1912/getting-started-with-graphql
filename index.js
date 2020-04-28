const express = require('express')
const expressGraphQL = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt
} = require('graphql')

const data = require('./data.js');
const authors = data.authors;
const books = data.books;

const app = express()

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "A single book",
  fields: () => ({
    id: { type: GraphQLInt },
    authorId: { type: GraphQLInt },
    name: { type: GraphQLString },
    year: { type: GraphQLInt },
    author: {
      type: AuthorType,
      resolve: book => authors.find(author => author.id === book.authorId)
    }
  })
})

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "A single author",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    books: { 
      type: new GraphQLList(BookType) ,
      resolve: author => books.filter(book => book.authorId === author.id)
    }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    author: {
      type: AuthorType,
      args: {
        name: { type: GraphQLString }
      },
      resolve: (parent, args) => authors.find(author => author.name === args.name)
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'A list of all authors',
      resolve: () => authors
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'A list of all books',
      resolve: () => books
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'Create new book',
      args: {
        name: { type: GraphQLString },
        year: { type: GraphQLInt },
        authorId: { type: GraphQLInt }
      },
      resolve: (parent, args) => {
        const newBook = {
          name: args.name,
          year: args.year,
          authorId: args.authorId,
          id: books.length + 1,
        }
        books.push(newBook)
        return newBook
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))

app.listen(5000, () => console.log('Server Running'))