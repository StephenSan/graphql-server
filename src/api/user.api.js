const DataLoader = require('dataloader');
const { update } = require('lodash');


class UserDB {
    constructor() {
        this.users = [];
    }

    create(user) {
        user.id = Date.now().toString();
        this.users.push(user);
        return user;
    }

    get(id) {
        const user  = this.users.find(u => u.id === id);
        console.log("Found user: ", id, user.firstname);
        return user;
    }

    getAll() {
        return this.users;
    }

    update(user) {
        let updated = false
        this.users = this.users.map((u)=>{
            if(u.id === user.id){
                updated = true
                return user
            }
            return u
        })
        
        return updated ? user : null;
    }
}


class UserApi {
    constructor({ userDb, ffRelDb }) {
        this.userDb = userDb;
        this.ffRelDb = ffRelDb;
        this.userLoader = new DataLoader(keys => this.loadUsers(keys))
    }

    async loadUsers(ids) {
        return ids.map(userId => this.userDb.get(userId));
    }

    getAllUsers(){
        return this.userDb.getAll()
    }

    createUser(args){
        const newUser = {...args, posts:[] }
        return this.userDb.create(newUser)
    }

    updateUser(args) {
        const updatedUser = this.userDb.update(args.input)
        if(updatedUser !== null){
            this.userLoader.clear(updatedUser.id)
        }
        return updatedUser
    }

    async resolveFollowers(user) {
        const followerIds = this.ffRelDb.filter((rel)=>rel.followedId === user.id).map((rel) => rel.userId)
        const promises = followerIds.map(followerId => this.userLoader.load(followerId));
        return await Promise.all(promises);
    }

    async resolveFollowing(user) {
        const followedIds = this.ffRelDb.filter((rel)=>rel.userId === user.id).map((rel) => rel.followedId)
        const promises = followedIds.map(followedId => this.userLoader.load(followedId));
        return await Promise.all(promises);
    }

    resolveFullname(user, args){
        const delim = args.delim || " "
        return user.firstname + delim + user.lastname
    }

    follow(args){
        this.ffRelDb.create({
            userId: args.userId,
            followedId: args.followedId
        })
        return this.resolveFollowing({ id: args.userId });
    }
}

module.exports.UserDB = UserDB;
module.exports.UserApi = UserApi;