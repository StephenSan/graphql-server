var express = require("express");
var { ApolloServer, gql } =  require('apollo-server-express');
var _ = require('lodash')

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
        posts: [Post!]!
        following: [User!]!
        followers: [User!]!
    }

    type Query {
        allUsers: [User!]!
    }

    type Mutation {
        createUser(
            firstname: String!
            lastname: String!
        ): User!

        createPost(
            title: String!
            subtitle: String!
            authorId: ID!
        ): Post!

        follow(userId: ID!, followedId: ID!): [User!]!
    }
`;

const users = []
const posts = []
const ffRel = []


// Resolver functions
const resolvers = {
    User: {
        posts: (user) => posts.filter(post => post.authorId === user.id),
        following: (user) => {
            const followedIds = ffRel.filter((rel)=>rel.userId === user.id).map((rel) => rel.followedId)
            return users.filter((u) => followedIds.indexOf(u.id) > -1 )
        },
        followers: (user) => {
            const followerIds = ffRel.filter((rel)=>rel.followedId === user.id).map((rel) => rel.userId)
            return users.filter((u) => followerIds.indexOf(u.id) > -1 )
        }

    },
    Post: {
        author: (post) => users.find(user => user.id === post.authorId)
    },
    Query: {
        allUsers: () => users 
    },
    Mutation: {
        createUser: (_, args) => {
            const newUser = {...args, posts:[], following:[], followers:[], id: Date.now().toString()}
            users.push(newUser)
            return newUser
        },
        createPost: (_, args) => {
            const newPost = {...args, id: Date.now().toString()}
            posts.push(newPost);
            return newPost
            
        },
        follow: (_, args) => {
            ffRel.push({
                userId: args.userId,
                followedId: args.followedId
            })
            const followedIds = ffRel.filter((rel)=>rel.userId === args.userId).map((rel) => rel.followedId)
            return users.filter((user) => followedIds.indexOf(user.id) > -1 )
        }
    }
    
};
   
const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

server.applyMiddleware({ app })

module.exports = app;
