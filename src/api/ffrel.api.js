const DataLoader = require('dataloader')
 

class FFRelDB {
    constructor() {
        this.ffrel = [];
    }

    create(ffrel) {
        this.ffrel.push(ffrel);
        return ffrel;
    }

    get(id) {
        return this.ffrel.find(u => u.id === id);
    }

    getAll() {
        return this.ffrel;
    }

    filter(filter){
        return this.ffrel.filter(filter)
    }
}

module.exports.FFRelDB = FFRelDB;