const request = require('supertest');
const db = require("../models/index.js");
const HttpStatus = require('../utils/httpStatus.util.js');

let server;

describe('Auth Router',()=>{

    const currentUser = {
        email : `user-${(Math.random()*10)}@email.com`,
        password :`password`
    }
    const currentAdmin = {
        email : `admin-${(Math.random()*10)}@email.com`,
        password :`password`
    }

    beforeEach(()=>{
        server = require("../app.js");
    })

    afterEach(()=>{
        server.close();
    });

    describe("POST /auth/register", () => {
        it("should return token and status 201", async () => {

          const response = await request(server).post("/auth/register")
          .set('Accept', 'application/json')
          .send(currentUser);

          expect(response.statusCode).toBe(HttpStatus.CREATED.code);
        });

        it('should return status 400 if email and password are not valid',async()=>{
            const response = await request(server).post("/auth/register")
            .set('Accept', 'application/json')
            .send({});

            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
        }); 
        
        it('should return status 400 if password length is less than 6',async()=>{
          
          const response = await request(server).post("/auth/register")
            .set('Accept', 'application/json')
            .send({email:currentUser.email,password:"123"});

            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
        });

        it('should return status 409 if user already exists',async()=>{
            const response = await request(server).post("/auth/register")
            .set('Accept', 'application/json')
            .send(currentUser);

            expect(response.statusCode).toBe(HttpStatus.CONFLICT.code);
        });
    })

    describe("POST /auth/login", () => {
      it("should return token and status 200", async () => {
        const response = await request(server).post("/auth/")
          .set('Accept', 'application/json')
          .send(currentUser);

        expect(response.statusCode).toBe(HttpStatus.OK.code);
      });

      it('should return status 400 if email and password are not valid',async()=>{
        const response = await request(server).post("/auth/")
          .set('Accept', 'application/json')
          .send({});

          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
      }); 
      
      it('should return status 400 if password length is less than 6',async()=>{
        
        const response = await request(server).post("/auth/")
          .set('Accept', 'application/json')
          .send({email:currentUser.email,password:"123"});

          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
      });

      it('should return status 400 if email or password are invalid',async()=>{
        
        const response = await request(server).post("/auth/")
          .set('Accept', 'application/json')
          .send({email:"email",password:"123"});

          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
      });

    });

    describe("POST /auth/admin", () => {

      it("should return token and status 201", async () => {

        const response = await request(server).post("/auth/admin")
        .set('Accept', 'application/json')
        .send(currentAdmin);

        expect(response.statusCode).toBe(HttpStatus.CREATED.code);
      });

      it('should return status 400 if email and password are not valid',async()=>{
          const response = await request(server).post("/auth/admin")
          .set('Accept', 'application/json')
          .send({});

          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
      }); 
      
      it('should return status 400 if password length is less than 6',async()=>{
        
        const response = await request(server).post("/auth/admin")
          .set('Accept', 'application/json')
          .send({email:currentAdmin.email,password:"123"});

          expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.code);
      });

      it('should return status 409 if user already exists',async()=>{
          const response = await request(server).post("/auth/admin")
          .set('Accept', 'application/json')
          .send(currentAdmin);

          expect(response.statusCode).toBe(HttpStatus.CONFLICT.code);
      });

    })

});