const request = require("supertest");
const app = require("../server");
const mongoose = require('mongoose');

beforeAll( async ()=>{
   await mongoose.connect(MONGODB_URI)
})

afterAll(async ()=>{
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
})

describe('Auth api', () => {
    test ("post api/auth/register",async()=>{
     const res = await request(app)
     .post("/api/auth/register")
     .send({
        "name":"testing",
        "shopName":"hitler shop",
        "email":"test@email.com",
        "password":"testing123"
     })
     expect(res.statusCode.toBe(201));
    })
});
