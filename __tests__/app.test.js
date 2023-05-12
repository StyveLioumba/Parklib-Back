const request = require('supertest');
let server;

describe('App Server',()=>{
    beforeAll(()=>{
        server = require("../app.js");
    })

    afterAll(()=>{
        server.close();
    });

    it('should be defined',()=>{
        expect(server).toBeDefined();
    })

    describe("GET /", () => {
        it("should response the GET method", async () => {
          const response = (await request(server).get("/"));
          expect(response.statusCode).toBe(200);
        });
      });

    describe("GET /*", () => {
        it("should response return a status 404", async () => {
          const response = (await request(server).get("/anything"));
          expect(response.statusCode).toBe(404);
        });
      });
})

