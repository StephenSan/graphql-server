var express = require("express");
var { ApolloServer, gql } =  require('apollo-server-express');
var _ = require('lodash')
const { UserDB, UserApi } = require("./api/user.api")
const { FFRelDB } = require("./api/ffrel.api")


// Schema definitions
var typeDefs = gql`
    type Post {
        id: ID!
        title: String!
        subtitle: String!
        authorId: ID!
        author: User!
    }

    type User {
        id: ID!
        firstname: String!
        lastname: String!
        fullname(delim: String): String!
        posts: [Post!]!
        following: [User!]!
        followers: [User!]!
    }

    input UpdateUser {
        id: ID!
        firstname: String!
        lastname: String!
    }

    type Query {
        allUsers: [User!]!
    }

    type Mutation {
        createUser(
            firstname: String!
            lastname: String!
        ): User!

        updateUser(
            input: UpdateUser
        ): User

        createPost(
            title: String!
            subtitle: String!
            authorId: ID!
        ): Post!

        follow(userId: ID!, followedId: ID!): [User!]!

    }
`;

const userDb = new UserDB();
const ffRelDb = new FFRelDB();
const userApi = new UserApi({ userDb, ffRelDb });
const posts = []

// Resolver functions
const resolvers = {
    User: {
        posts: (user) => posts.filter(post => post.authorId === user.id),
        following: (user) => {
            return userApi.resolveFollowing(user)
        },
        followers: (user) => {
            return userApi.resolveFollowers(user)
        },
        fullname: (user, args) => {
            return userApi.resolveFullname(user, args)
        }
    },
    Post: {
        author: (post) => users.find(user => user.id === post.authorId)
    },
    Query: {
        allUsers: () => userApi.getAllUsers()
    },
    Mutation: {
        createUser: (_, args) => {
          return userApi.createUser(args)
        },
        updateUser: (_, args)=>{
            return userApi.updateUser(args)
        },
        createPost: (_, args) => {
            const newPost = {...args, id: Date.now().toString()}
            posts.push(newPost);
            return newPost
            
        },
        follow: (_, args) => {
            return userApi.follow(args)
        }
    }
    
};
   
const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

server.applyMiddleware({ app })

module.exports = app;
