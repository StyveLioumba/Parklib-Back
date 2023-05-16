const request = require('supertest');
const HttpStatus = require('../utils/httpStatus.util.js');

let server;

describe('User Router',()=>{

    beforeEach(()=>{
        server = require("../app.js");
    });

    afterEach(()=>{
        server.close();
    });

    describe("GET /users",() => {

        it("should return status 401 if token is not valid", async () => {
                
                const response = await request(server).get("/users")
                .set("authorization", `bearer ${"fakeToken"}`);
    
                expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED.code);
        });

        it("should return users list and status 200",() => {

            request(server).post("/auth")
            .set('Accept', 'application/json')
            .send({email:"super@admin.com",password:"password"})
            .then( async (res)=>{
                const response = await request(server).get("/users")
                .set("authorization", `bearer ${res.accessToken}`);
    
                expect(response.statusCode).toBe(HttpStatus.OK.code);
            });

           
        });
    });
});
