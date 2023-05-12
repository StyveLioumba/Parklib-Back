const request = require('supertest');
const db = require("../models");

let server;


describe('Auth Router',()=>{

    const currentUser = {
        email : `user-${Math.floor(Math.random()*10)}@email.com`,
        password :`password`
    }

    beforeAll( async()=>{
        server = require("../app.js");
        await db.sequelize.sync({ force: true })
    })

    afterAll(async()=>{
        server.close();
        await db.sequelize.close()
    });

    describe("POST /auth/register", () => {
        it("should return token and status 201", async () => {

          const response = await request(server).post("/auth/register")
          .set('Accept', 'application/json')
          .send(currentUser);

          expect(response.statusCode).toBe(201);
        });
      })

    describe("POST /auth/login", () => {
        it("should return token and status 200", async () => {

          const response = await request(server).post("/auth/")
          .set('Accept', 'application/json')
          .send(currentUser);

          expect(response.statusCode).toBe(200);
        });
      })

});